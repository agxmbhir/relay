const { Pool, Client } = require('pg')
const connectionString = 'postgresql://agam:z38bFCh7uQ9q2P6FJRjF0g@free-tier4.aws-us-west-2.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&options=--cluster%3Dorange-pumi-4181'


const pool = new Pool({
  connectionString,
})

const client = new Client({
  connectionString,
})
client.connect()
// client.query('SELECT NOW()', (err, res) => {
//   console.log(err, res)
//   client.end()
// })

const getTasks = async () => {
    const client = new Client({
        connectionString,
    })
    await client.connect()
    const res = await client.query('SELECT * FROM apps WHERE status = $1', ['pending'])
    return res.rows
}

module.exports = {
  getTasks,
  client
};