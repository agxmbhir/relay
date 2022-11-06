const Web3 = require("web3");
const worker = require("./worker.js");
const { sendMessage } = require("./xmtp.js");

// init web3 for diff chains
const mainnetProvider = new Web3(new Web3.providers.WebsocketProvider(process.env.ALCHEMY_MAINNET_WSS));
const polygonProvider = new Web3(new Web3.providers.WebsocketProvider(process.env.ALCHEMY_POLYGON_WSS));

const mainnet =  (addresses) => mainnetProvider.eth.subscribe("logs", {
    address: addresses
}, (error, txn) => {
    if(!error) {
        console.log(txn.transactionHash);
        
        // worker.add({
        //     txn_hash: txn.transactionHash, 
        //     contract_address: txn.address
        // }).then((job) => {
        //     console.log(job);
        // }).catch((error) => {
        //     console.log(error);
        // }
        // )
    }
}).on("connected", (subId) => {
    console.log("mainnet sub id: ", subId);
});

const polygon = (addresses) => polygonProvider.eth.subscribe("logs", {
    address: addresses
}, (error, txn) => {
    if(!error) {
        console.log(txn);
    }
}).on("connected", (subId) => {
    console.log("polygon sub id: ", subId);
});

module.exports = {
    mainnet,
    polygon
};