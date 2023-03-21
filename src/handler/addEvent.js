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
      const ev={
           createdAt: now,
          updatedAt: now,
          id: uuid.v4(),
      }
          if (data.title){ ev.title = data.title;}
    if (data.description){ ev.description = data.description;}
    if (data.type){ ev.type = data.type;}
    if (data.img){ ev.img = data.img;}
    if (data.creator){ ev.creator = data.creator;}
    if (data.lat){ ev.lat = data.lat;}
    if (data.lng){ ev.lng = data.lng;}
    if (data.targetGender){ ev.targetGender = data.targetGender;}
    if (data.targetAgeRange){ ev.targetAgeRange = data.targetAgeRange;}
    if (data.meetingHour){ ev.meetingHour = data.meetingHour;}
    if (data.meetingDays){ ev.meetingDays = data.meetingDays;}
    if (data.expirationDate){ ev.expirationDate = data.expirationDate;}


      // if (data.meetingHour) params.Item.meetingHour = data.meetingHour;
      // if (data.meetingDays) params.Item.meetingDays = data.meetingDays;

      const db = await client.db("fff");
      const eventsTable = await db.collection("events");
      const inserted = await eventsTable.insertOne(ev);
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
          data: ev,
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
