"use strict";
const AWS = require("aws-sdk");
const getClient = require("../mongo_client.js");

module.exports.listEvents = async (event) => {
  try{
  console.warn("event", event);
  const client = await getClient.getClient();
   console.warn("client", client);
  const db = await client.db("fff");
   console.warn("db", db);
  const eventsTable = await db.collection("events");
   console.warn("eventsTable", eventsTable);
  const eventsOnDB = await eventsTable.find().toArray();
     console.warn("eventsOnDB", eventsOnDB);
  const liveConnectionsTable = await db.collection("web-socket-connections");
      console.warn("liveConnectionsTable", liveConnectionsTable);
  const liveConnections = await liveConnectionsTable.find().toArray();
      console.warn("liveConnections", liveConnections);
  const endpoint =
    event.requestContext.domainName + "/" + event.requestContext.stage;
     console.warn("endpoint", endpoint);
  const apigatewaymanagementapi = new AWS.ApiGatewayManagementApi({
    endpoint: endpoint,
  });
      console.warn("apigatewaymanagementapi", apigatewaymanagementapi);

  const post = async (connectionId, message) => {
     console.warn("inside post function");
         console.warn("connectionId", connectionId);
           console.warn("message", message);
    return await apigatewaymanagementapi
      .postToConnection({
        ConnectionId: connectionId,
        Data: Buffer.from(JSON.stringify(message))
      })
      .promise();
  };

  const postCalls = liveConnections.map(async (connection) => {
        console.warn("connection", connection);
    const listOfEvents = JSON.stringify({
      action: "listEvents",
      data: eventsOnDB,
    });
     console.warn("listOfEvents",listOfEvents);
    return await post(connection.connectionId, listOfEvents);
  });


    await Promise.all(postCalls);

  return { statusCode: 200, body: "Data sent." };
  }catch(e){
    console.warn(e.stack);
     return { statusCode: 500, body: e.stack };
  }
};
