"use strict";
const AWS = require("aws-sdk");
const uuid = require("uuid");
const MongoClient = require("mongodb").MongoClient;

module.exports.updateUser = async (event, context, callback) => {
  const now = new Date().toISOString();
  const data = JSON.parse(event.body);
  const upd = {
    updatedAt: now,
  };
  if (data.email) {
    upd.email = data.email;
  }
  const params = {
    TableName: "users",
    Item: { $set: upd },
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
    const users = await db.collection("users");
    const result = await users.updateOne(params.Key, params.Item);
    response = {
      statusCode: 201,
      body: JSON.stringify({
        message: result,
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
