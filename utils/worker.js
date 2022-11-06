require("dotenv").config();
const Bull = require("bull");
const ethers = require("ethers");
const Web3 = require("web3");
const web3Mainnet = new Web3(new Web3.providers.WebsocketProvider("wss://eth-mainnet.g.alchemy.com/v2/1RQfmCwWHtgvJpaTSJ7MHnFlBxa9IpQY"));
const cock = require("../cock.js");
const {serializeEvent} = require("./serialize.js");
const axios = require('axios');
const { sendMessage}  = require("./xmtp.js");

const worker = new Bull("tasks", 
{
   redis: {
        port: process.env.REDIS_PORT,
        host: process.env.REDIS_HOST,
        password: process.env.REDIS_PASSWORD,
        username: process.env.REDIS_USERNAME
   }
}
)

worker.process(async(job, done) => {
        console.log("processing job: ", job.data);
    web3Mainnet.eth.getTransactionReceipt(job.data.txn_hash, async(error, res) => {
        if(error) done(error);

        const getContract = await cock.client.query("SELECT * FROM apps WHERE address = $1", [job.data.contract_address]);
        if(getContract.rows.length == 0) done(error);
        
        const interface = new ethers.utils.Interface(JSON.parse(getContract.rows[0].abi));
        const {logs, transactionHash, transactionIndex, from} = res;

        for(let i = 0; i < logs.length; i++) {
            try {
                const parsedLog = await interface.parseLog(logs[i]);
                const event = serializeEvent(parsedLog);

                // here see if the event name matches
                const getApp = await cock.client.query('SELECT * FROM apps WHERE chain = $1 AND address = $2 AND event_name = $3', ['mainnet', job.data.contract_address, event.name]);
                console.log(getApp.rows);
                if(getApp.rows.length == 0) {
                    done();
                    break;
                };

                // perform the action
                if(getApp.rows[0].api_endpoint.startsWith("http")) {
                    await axios.post(getApp.rows[0].api_endpoint, {
                        ...event,
                        timestamp: Date.now()
                    })
                } else if (getApp.rows[0].xmtpaddress){
                    console.log("sending xmtp message");
                    try {
                        await sendMessage( getApp.rows[0].message,getApp.rows[0].xmtpaddress);
                    }
                    catch (error) {
                        console.log(error);
                    }

                }   else {
                    const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMYP_MAINNET_RPC);
                    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
                    const splitEndpoint = getApp.rows[0].split(":");
                    const contract = new ethers.Contract(splitEndpoint[0], getApp.rows[0].abi, signer);
                    const func = new Function(
                        `return contract.${splitEndpoint[1]}()`
                    );
                    func();
                }
                
                done();
            } catch (error) {
                console.log(error);
            }
        }

        done();
    })
});

module.exports = worker;