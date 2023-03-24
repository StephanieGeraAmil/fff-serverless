"use strict";
const AWS = require("aws-sdk");
const uuid = require("uuid");

const getClient = require("../mongo_client.js");

module.exports.createUser = async (event, context, callback) => {
  try {
    const client = await getClient.getClient();
    const now = new Date().toISOString();
    const data = JSON.parse(event.body);

    if (typeof data.email !== "string") {
      return {
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
    const Item = {
      id: uuid.v4(),
      email: data.email,
      createdAt: now,
      updatedAt: now,
    };

    if (data.name) {
      Item.name = data.name;
    }
    if (data.gender) {
      Item.gender = data.gender;
    }
    if (data.birthDate) {
      Item.birthDate = data.birthDate;
    }

    const db = await client.db("fff");
    const userTable = await db.collection("users");
    const result = await userTable.insertOne(Item);
    if (!result["acknowledged"]) return;
    const userInserted = await userTable.findOne(result.insertedId);

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Methods": "*",
      },
      body: JSON.stringify(userInserted),
    };
  } catch (e) {
    console.warn(e);
    return {
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
  }
};
