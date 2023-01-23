"use strict";
const AWS = require("aws-sdk");
const uuid = require("uuid");
const MongoClient = require("mongodb").MongoClient;

module.exports.deleteUser = async (event, context, callback) => { 
  const params = {
    TableName: "users",
    Key: {
            id: event.pathParameters.id
        }
  };
  const client = await new MongoClient(process.env.MONGO_DB_ATLAS_CONECTION_STRING, {
    useNewUrlParser: true,
  });


  let response;

  try {
    await client.connect();
    const db = await client.db("fff");
    const users = await db.collection("users");
    const usr = await users.deleteOne(params.Key);
    response = {
      statusCode: 202,
      body: JSON.stringify({
        message: usr,
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
