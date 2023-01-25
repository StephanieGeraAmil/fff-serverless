"use strict";
const AWS = require("aws-sdk");
const uuid = require("uuid");
const MongoClient = require("mongodb").MongoClient;

module.exports.createEvent = async (event, context, callback) => {
  const now = new Date().toISOString();
  const data = JSON.parse(event.body);
  if (typeof data.title != "string") {
    const response = {
      statusCode: 400,
      body: JSON.stringify({
        message: "Event must have a title of type string",
      }),
    };
  }
  const params = {
    TableName: "events",
    Item: {
      id: uuid.v4(),
      title: data.title,
      //location: data.location,
      eventType: data.eventType,
     // creator: data.creator,
      createdAt: now,
      updatedAt: now,
    },
  };
  if (data.welcomedGeneres) params.Item.welcomedGeneres = data.welcomedGeneres;
  if (data.meetingHour) params.Item.meetingHour = data.meetingHour;
  if (data.meetingDays) params.Item.meetingDays = data.meetingDays;
  if (data.expirationDate) params.Item.expirationDate = data.expirationDate;

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
    const events = await db.collection("events");
    const result = await events.insertOne(params.Item);
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
