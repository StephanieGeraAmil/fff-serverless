"use strict";
const AWS = require("aws-sdk");
const getClient = require("../mongo_client.js");

module.exports.updateEvent = async (event) => {
  try {

    const client = await getClient.getClient();
    const now = new Date().toISOString();
    const data = JSON.parse(event.body);
    const eventData = data.event;

    const upd = {
      updatedAt: now,
    };
    
    if (eventData.id) {
      upd.id = eventData.id;
    }
    if (eventData.title) {
      upd.title = eventData.title;
    }
    if (eventData.description) {
      upd.description = eventData.description;
    }
    if (eventData.type) {
      upd.type = eventData.type;
    }
    if (eventData.img) {
      upd.img = eventData.img;
    }
    if (eventData.creator) {
      upd.creator = eventData.creator;
    }
    if (eventData.lat) {
      upd.lat = eventData.lat;
    }
    if (eventData.lng) {
      upd.lng = eventData.lng;
    }
    if (eventData.targetGender) {
      upd.targetGender = eventData.targetGender;
    }
    if (eventData.targetAgeRange) {
      upd.targetAgeRange = eventData.targetAgeRange;
    }
    if (eventData.meetingHour) {
      upd.meetingHour = eventData.meetingHour;
    }
    if (eventData.meetingDays) {
      upd.meetingDays = eventData.meetingDays;
    }
    if (eventData.expirationDate) {
      upd.expirationDate = eventData.expirationDate;
    }
    upd.createdAt = eventData.createdAt;

    const Item = { $set: upd };
    const Key = {
      id: eventData.id,
    };

    const db = await client.db("fff");
    const eventsTable = await db.collection("events");
    const result = await eventsTable.updateOne(Key, Item);
    if (!result["acknowledged"]) return;

    const liveConnectionsTable = await db.collection("web-socket-connections");

    const liveConnections = await liveConnectionsTable.find().toArray();

    const endpoint =
      event.requestContext.domainName + "/" + event.requestContext.stage;

    const apigatewaymanagementapi = new AWS.ApiGatewayManagementApi({
      endpoint: endpoint,
    });

    const post = async (connectionId, message) => {
      return await apigatewaymanagementapi
        .postToConnection({
          ConnectionId: connectionId,
          Data: Buffer.from(JSON.stringify(message)),
        })
        .promise();
    };

    const postCalls = liveConnections.map(async (connection) => {
      const newEventMessage = JSON.stringify({
        action: "updatedEvent",
        data: upd,
      });
      return await post(connection.connectionId, newEventMessage);
    });

    await Promise.all(postCalls);

    return;
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }
};
