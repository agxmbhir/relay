require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const listeners = require("./utils/listeners.js");
require("./cock.js");
const cock = require("./cock.js");
require("./utils/sonr.js");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post("/call_this", (req, res) => {
    console.log(req.body);
    return res.status(200);
});

app.post("/evm", async (req, res) => {
    const { chain, address, method_name, api_endpoint, abi, xmtpaddress, message} = req.body;
    console.log(req.body);
    let id = Math.round(Math.random() * 1000000000);

    try {
        await cock.client.query(
          'CREATE TABLE IF NOT EXISTS apps (id INT PRIMARY KEY, address STRING, chain STRING, event_name STRING, api_endpoint STRING, abi STRING, xmtpaddress STRING, message STRING);'
        )

        await cock.client.query(
          'INSERT INTO apps (id, address, chain, event_name, api_endpoint, abi, xmtpaddress, message) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);',
          [id, address, chain,  method_name, api_endpoint, abi, xmtpaddress, message]
        )

        let dbres;
        let addresses;

        switch (chain) {
            case "mainnet":
                dbres = await cock.client.query('SELECT * FROM apps WHERE chain = $1', ['mainnet']);   
                if(dbres.rows.length == 0) break;
                addresses = [...new Set(dbres.rows.map(item => item.address))];
                listeners.mainnet(addresses);
                break;
            case "polygon":
                dbres = await cock.client.query('SELECT * FROM apps WHERE chain = $1', ['polygon']);
                if(dbres.rows.length == 0) break;
                addresses = [...new Set(dbres.rows.map(item => item.address))];
                listeners.polygon(addresses);
                break;
            default:
                dbres = await cock.client.query('SELECT * FROM apps WHERE chain = $1', ['mainnet']);   
                if(dbres.rows.length == 0) break;
                addresses = [...new Set(dbres.rows.map(item => item.address))];
                listeners.mainnet(addresses);
                break;
        }

        return res.status(200);
    } catch (error) {
        console.log(error)
    }  
});



(async () => {
    const mainnetQuery = await cock.client.query('SELECT * FROM apps WHERE chain = $1', ['mainnet']);
    if(mainnetQuery.rows.length !== 0) {
        const mainnetAddresses = [...new Set(mainnetQuery.rows.map(item => item.address))];
        console.log(mainnetAddresses);
        listeners.mainnet(mainnetAddresses);
    };

    // const polygonQuery = await cock.client.query('SELECT * FROM apps WHERE chain = $1', ['polygon']);
    // if(polygonQuery.rows.length !== 0) {
    //     const polygonAddresses = [...new Set(polygonQuery.rows.map(item => item.address))];
    //     listeners.polygon(polygonAddresses);
    // }
})();

app.listen(process.env.PORT || 8000, () => console.log("RUNNING"));