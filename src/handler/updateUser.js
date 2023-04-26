"use strict";
const AWS = require("aws-sdk");
const uuid = require("uuid");
const MongoClient = require("mongodb").MongoClient;

module.exports.updateUser = async (event, context, callback) => {
  let response = [];
  try {
    const now = new Date().toISOString();
    const data = JSON.parse(event.body);
    const upd = {
      updatedAt: now,
    };

    if (data.email) {
      upd.email = data.email;
    }
    if (data.name) {
      upd.name = data.name;
    }
    if (data.gender) {
      upd.gender = data.gender;
    }
    if (data.birthDate) {
      upd.birthDate = data.birthDate;
    }
    const params = {
      TableName: "users",
      Item: { $set: upd },
      Key: {
        id: event.pathParameters.id,
      },
    };

    const client = await getClient.getClient();
    await client.connect();
    const db = await client.db("fff");
    const users = await db.collection("users");
    const result = await users.updateOne(params.Key, params.Item);
    if (result !== null) {
      response = {
        statusCode: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Methods": "*",
        },
        body: JSON.stringify({
          message: result,
        }),
      };
    } else {
      response = {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Methods": "*",
        },
        body: JSON.stringify({
          message: "user not found",
        }),
      };
    }
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
