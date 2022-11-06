// require xmtp 
const { Client }  = require("@xmtp/xmtp-js");
const { Wallet} = require("ethers");
// create a new xmtp client


async function sendMessage(message, receiver) {
    const wallet = new Wallet(process.env.PRIVATE_KEY);
    const client = await Client.create(wallet);
    const conversation = await client.conversations.newConversation(receiver);
    await conversation.send(message);
}

await sendMessage("Hello, Something just happened!", '0xf42D35FC78614e8b6ff1E2F7b13998CD2a0b7500');

module.exports = {sendMessage};