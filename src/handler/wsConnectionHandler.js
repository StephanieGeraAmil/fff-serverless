"use strict";
const AWS = require("aws-sdk");
const MongoClient = require("mongodb").MongoClient;
const getClient = require("../mongo_client.js");

module.exports.onConnect = async (event) => {
  console.warn(event);
  const connectionId = event.requestContext.connectionId;
  const params = {
    TableName: "web-socket-connections",
    Client: {
      connectionId: connectionId,
    },
  };

  try {
    const client = await getClient.getClient();
    const db = await client.db("fff");
    const liveConnections = await db.collection(params.TableName);
    await liveConnections.insertOne(params.Client);
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }
  return {
    statusCode: 200,
  };

  //it would be wise to utilize the connection comunication to send back the inital events to be shown in the client
};

module.exports.onDisconnect = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const params = {
    TableName: "web-socket-connections",
    Key: {
      connectionId: connectionId,
    },
  };

  try {
    const client = await getClient.getClient();
    const db = await client.db("fff");
    const liveConnections = await db.collection(params.TableName);
    await liveConnections.deleteOne(params.Key);
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }
  return {
    statusCode: 200,
  };
};


module.exports.onAddConnectionInfo = async (event) => {
  try {
    const connectionId = event.requestContext.connectionId;
    const client = await getClient.getClient();
    const location = JSON.parse(event.body).location;

    if (location.country && location.city) {
      const upd = {
        country: location.country,
        city: location.city,
      };
      const params = {
        TableName: "web-socket-connections",
        Item: { $set: upd },
        Key: {
          connectionId: connectionId,
        },
      };
      const db = await client.db("fff");
      const liveConnections = await db.collection(params.TableName);
      await liveConnections.updateOne(params.Key, params.Item);
    }
  } catch (error) {
    console.log(error);
  }
};

//we need an eventsInMyCity event that will send the info about the events from a specific city (with pagination?)
/// we need an onNewEvent event that will save into the databse and send an broadcast to all connected clients from that city
///we will need an onUpdateEvent and an onDeleteEvent too

//we will need an onJoinEvent and an onLeaveEvent
//we will need a onListEvent and a onListParticipants
