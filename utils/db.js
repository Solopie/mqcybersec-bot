const { MongoClient, ServerApiVersion } = require('mongodb');
const { MONGODB_URL } = require("./config")


const client = new MongoClient(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const getTeam = async () => {
    const c = await client.connect();
    const collection = c.db("mqcybersec").collection("team");
    const team = await collection.findOne({}, { projection: { _id: 0 } });
    c.close();

    return team;
}

const getAim = async () => {
    const c = await client.connect();
    const collection = c.db("mqcybersec").collection("aim");
    const aim = await collection.findOne({}, { projection: { _id: 0 } });
    c.close();

    return aim;
}

module.exports = {
    getTeam,
    getAim
}