"use strict";
const AWS = require("aws-sdk");
const uuid = require("uuid");
const MongoClient = require("mongodb").MongoClient;

module.exports.deleteEvent = async (event, context, callback) => {
  const params = {
    TableName: "events",
    Key: {
      id: event.pathParameters.id,
    },
  };
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
    const Events = await db.collection("events");
    const usr = await Events.deleteOne(params.Key);
    if (usr !== null) {
      response = {
        statusCode: 202,
        body: JSON.stringify({
          message: usr,
        }),
      };
    } else {
      response = {
        statusCode: 500,
        body: JSON.stringify({
          message: "Event not found",
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
