"use strict";
const AWS = require("aws-sdk");
const uuid = require("uuid");
const MongoClient = require("mongodb").MongoClient;

module.exports.updateEvent = async (event, context, callback) => {
  const now = new Date().toISOString();
  const data = JSON.parse(event.body);
  const upd = {
    updatedAt: now,
  };
  if (data.title) upd.title = data.title;
  if (data.eventType) upd.eventType = data.eventType;
  if (data.creator) upd.creator = data.creator;
  if (data.location) upd.location = data.location;
  if (data.welcomedGeneres) upd.welcomedGeneres = data.welcomedGeneres;
  if (data.meetingHour) upd.meetingHour = data.meetingHour;
  if (data.meetingDays) upd.meetingDays = data.meetingDays;
  if (data.expirationDate) upd.expirationDate = data.expirationDate;
  const params = {
    TableName: "events",
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
    const Events = await db.collection("events");
    const result = await Events.updateOne(params.Key, params.Item);
    if (result !== null) {
      response = {
        statusCode: 204,
        body: JSON.stringify({
          message: result,
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
