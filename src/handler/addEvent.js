"use strict";
const AWS = require("aws-sdk");
const uuid = require("uuid");
const getClient = require("../mongo_client.js");

module.exports.addEvent = async (event) => {
  try {
    const client = await getClient.getClient();
    const now = new Date().toISOString();
    const data = JSON.parse(event.body).event;
    if (typeof data.title == "string") {
      const params = {
        Item: {
          id: uuid.v4(),
          title: data.title,
          lat: data.lat,
          lng: data.lng,
          type: data.type,
          img: data.img,
          creator: data.creator,
          createdAt: now,
          updatedAt: now,
          targetAgeRange: data.targetAgeRange,
          targetGender: data.targetGender,
          expirationDate: data.expirationDate,
        },
      };

      // if (data.meetingHour) params.Item.meetingHour = data.meetingHour;
      // if (data.meetingDays) params.Item.meetingDays = data.meetingDays;

      const db = await client.db("fff");
      const eventsTable = await db.collection("events");
      const inserted = await eventsTable.insertOne(params.Item);
      if (!inserted["acknowledged"]) return;
      const liveConnectionsTable = await db.collection(
        "web-socket-connections"
      );

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
          action: "newEvent",
          data: params.Item,
        });
        return await post(connection.connectionId, newEventMessage);
      });

      await Promise.all(postCalls);

      return;
    }
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }
};
