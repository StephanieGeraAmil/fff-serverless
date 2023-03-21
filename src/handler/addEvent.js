"use strict";
const AWS = require("aws-sdk");
const uuid = require("uuid");
const getClient = require("../mongo_client.js");

module.exports.addEvent = async (event) => {
  try {
    const client = await getClient.getClient();
    const now = new Date().toISOString();
    const data = JSON.parse(event.body);
    let response = {};
    if (typeof data.title != "string") {
      response = {
        statusCode: 400,
        body: JSON.stringify({
          message: "Event must have a title of type string",
        }),
      };
    } else {
      const params = {
        Item: {
          id: uuid.v4(),
          title: data.title,
          lat: data.lat,
          lng: data.lng,
          eventType: data.eventType,
          creator: data.creator,
          createdAt: now,
          updatedAt: now,
        },
      };
      if (data.targetGenere) params.Item.targetGenere = data.targetGenere;
      // if (data.meetingHour) params.Item.meetingHour = data.meetingHour;
      // if (data.meetingDays) params.Item.meetingDays = data.meetingDays;
      if (data.expirationDate) params.Item.expirationDate = data.expirationDate;

      const db = await client.db("fff");
      const events = await db.collection("events");
      const result = await events.insertOne(params.Item);
      // response = {
      //   statusCode: 201,
      //   body: JSON.stringify({
      //     message: result,
      //   }),
      // };
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

if (operation && bodyToOperation) {
  const params = {
    Item: bodyToOperation,
  };
  await eventsTable.insertOne(params.Item);
}
