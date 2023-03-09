"use strict";
const MongoClient = require("mongodb").MongoClient;

let mongo_client = null;
module.exports.getClient = async () => {
  if (mongo_client !== null) {
    return mongo_client;
  } else {
    const client = await new MongoClient(
      process.env.MONGO_DB_ATLAS_CONECTION_STRING,
      {
        useNewUrlParser: true,
      }
    );
    await client.connect();
    mongo_client= client;
    return mongo_client;
  }
};
