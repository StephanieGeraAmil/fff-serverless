"use strict";
const AWS = require("aws-sdk");
const uuid = require("uuid");
const MongoClient = require("mongodb").MongoClient;

module.exports.getUser = async (event) => {
  let params;
  const client = await new MongoClient(
    process.env.MONGO_DB_ATLAS_CONECTION_STRING,
    {
      useNewUrlParser: true,
    }
  );

  let response = null;

  try {
     console.warn(event.queryStringParameters)
    if (event.queryStringParameters) {
     params= {
        Key: event.queryStringParameters
      };
       console.warn(params)
      
    }
    
    await client.connect();
    const db = await client.db("fff");
    const users = await db.collection("users");
    let result = null;
    if (params && params.Key ) {
      result = await users.findOne(params.Key);
    } else {
      result = await users.find().toArray();
    }

    if (result !== null) {
      response = {
        statusCode: 200,
        body: JSON.stringify({
          message: result,
        }),
      };
    } else {
      response = {
        statusCode: 500,
        body: JSON.stringify({
          message: "user not found",
        }),
      };
    }
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
