"use strict";
const AWS = require("aws-sdk");
const uuid = require("uuid");
const MongoClient = require("mongodb").MongoClient;

module.exports.deleteUser = async (event, context, callback) => {
  let response = [];
  try {
    const params = {
      Key: {
        id: event.pathParameters.id,
      },
    };
    const client = await getClient.getClient();
    await client.connect();
    const db = await client.db("fff");
    const users = await db.collection("users");
    const usr = await users.deleteOne(params.Key);
    if (usr !== null) {
      response = {
        statusCode: 202,
         headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Methods": "*",
        },
        body: JSON.stringify({
          message: usr,
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
