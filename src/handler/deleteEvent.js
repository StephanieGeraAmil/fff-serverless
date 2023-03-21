"use strict";
const AWS = require("aws-sdk");
const getClient = require("../mongo_client.js");

module.exports.deleteEvent = async (event) => {
  try {

    const client = await getClient.getClient();
    const now = new Date().toISOString();
    const data = JSON.parse(event.body);
    const key = {id:data.event};
    const db = await client.db("fff");
    const eventsTable = await db.collection("events");
    const result = await eventsTable.deleteOne(key);
    if (result === null) return;

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
        action: "deletedEvent",
        data: data.event,
      });
      return await post(connection.connectionId, newEventMessage);
    });

    await Promise.all(postCalls);

    return;
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }
};
