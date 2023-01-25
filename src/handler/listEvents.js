"use strict";
const AWS = require("aws-sdk");
const uuid = require("uuid");
const MongoClient = require("mongodb").MongoClient;

module.exports.listEvents = async (event, context, callback) => {
 
  const client = await new MongoClient(
    process.env.MONGO_DB_ATLAS_CONECTION_STRING,
    {
      useNewUrlParser: true,
    }
  );

  let response;

  try {
    await client.connect();
    const db = await client.db("fff");
    const Event = await db.collection("events");
    const usrs = await Event.find().toArray();
    console.warn (usrs);
    response = {
      statusCode: 200,
      body: JSON.stringify({
        message: usrs,
      }),
    };
  } catch (e) {
    console.warn(e);
    response = {
      statusCode: 400,
      body: JSON.stringify({
        message: e,
      }),
    };
  } finally {
    return response;
  }
};