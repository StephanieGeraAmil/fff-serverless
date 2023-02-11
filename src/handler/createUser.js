"use strict";
const AWS = require("aws-sdk");
const uuid = require("uuid");
const MongoClient = require("mongodb").MongoClient;

module.exports.createUser = async (event, context, callback) => {
  const now = new Date().toISOString();
  const data = JSON.parse(event.body);
  if (typeof data.email != "string") {
    const response = {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Methods": "*",
      },
      body: JSON.stringify({
        message: "User must have an email of type string",
      }),
    };
  }
  const params = {
    TableName: "users",
    Item: {
      id: uuid.v4(),
      email: data.email,
      createdAt: now,
      updatedAt: now,
    },
  };
  if (data.name) {
    params.Item.name = data.name;
  }
  if (data.gender) {
    params.Item.gender = data.gender;
  }
  if (data.birthDate) {
    params.Item.birthDate = data.birthDate;
  }
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

    const result = await users.insertOne(params.Item);
    response = {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Methods": "*",
      },
      body: JSON.stringify({
        message: result,
      }),
    };
  } catch (e) {
    console.warn(e);
    response = {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Methods": "*",
      },
      body: JSON.stringify({
        message: e,
      }),
    };
  } finally {
    return response;
  }
};
