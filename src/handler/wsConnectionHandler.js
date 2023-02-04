"use strict";
const AWS = require("aws-sdk");
const MongoClient = require("mongodb").MongoClient;

module.exports.onConnect = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const params = {
    TableName: "web-socket-connections",
    Client: {
      connectionId: connectionId,
    },
  };

  try {
    const client = await new MongoClient(
      process.env.MONGO_DB_ATLAS_CONECTION_STRING,
      {
        useNewUrlParser: true,
      }
    );
    await client.connect();
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
    const client = await new MongoClient(
      process.env.MONGO_DB_ATLAS_CONECTION_STRING,
      {
        useNewUrlParser: true,
      }
    );
    await client.connect();
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
//{"action":"broadcast", "data":"HI"}
module.exports.onBroadcast = async (event) => {
  let connectionData;
  let liveConnections;
  const client = await new MongoClient(
    process.env.MONGO_DB_ATLAS_CONECTION_STRING,
    { useNewUrlParser: true }
  );
  const postData = JSON.parse(event.body).data;

  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    endpoint:
      event.requestContext.domainName + "/" + event.requestContext.stage,
  });
  await client.connect();
  const db = await client.db("fff");
  liveConnections = await db.collection("web-socket-connections");

  connectionData = await liveConnections.find().toArray();
  console.warn(connectionData);
  const postCalls = connectionData.map(async ({ connectionId }) => {
    try {
      await apigwManagementApi
        .postToConnection({ ConnectionId: connectionId, Data: postData })
        .promise();
    } catch (e) {
      if (e.statusCode === 410) {
        console.log(`Found stale connection, deleting ${connectionId}`);
        console.warn(e);

        await liveConnections.deleteOne({
          ConnectionId: connectionId,
        });
        console.warn("just deleted");
      } else {
        throw e;
      }
    }
  });
  await Promise.all(postCalls);
  return { statusCode: 200, body: "Data sent." };
};

module.exports.onSend = async (event) => {
  const client = await new MongoClient(
    process.env.MONGO_DB_ATLAS_CONECTION_STRING,
    {
      useNewUrlParser: true,
    }
  );
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    endpoint:
      event.requestContext.domainName + "/" + event.requestContext.stage,
  });

  const postData = JSON.parse(event.body).data;
  const postDestination = JSON.parse(event.body).destination;
  try {
    await apigwManagementApi
      .postToConnection({ ConnectionId: postDestination, Data: postData })
      .promise();
  } catch (e) {
    if (e.statusCode === 410) {
      console.log(`Found stale connection, deleting ${postDestination}`);
      await client.connect();
      const db = await client.db("fff");
      const liveConnections = await db.collection("web-socket-connections");
      const res = await liveConnections.deleteOne({
        connectionId: connectionId,
      });
    } else {
      throw e;
    }
  }
  return { statusCode: 200, body: "Data sent." };
};

module.exports.onAddConnectionInfo = async (event) => {
  try {
    const connectionId = event.requestContext.connectionId;
    const client = await new MongoClient(
      process.env.MONGO_DB_ATLAS_CONECTION_STRING,
      {
        useNewUrlParser: true,
      }
    );
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
      await client.connect();
      const db = await client.db("fff");
      const liveConnections = await db.collection(params.TableName);
      await liveConnections.updateOne(params.Key, params.Item);
    }
  } catch (error) {
    console.log(error);
  }
};
module.exports.onEventCRUD = async (event) => {
  try {
    const connectionId = event.requestContext.connectionId;
    const client = await new MongoClient(
      process.env.MONGO_DB_ATLAS_CONECTION_STRING,
      {
        useNewUrlParser: true,
      }
    );
    const operation = JSON.parse(event.body).operation;
    const eventID = JSON.parse(event.body).eventID;
    const bodyToOperation = JSON.parse(event.body).bodyToOperation;
    switch (operation) {
      case "create":
        if (operation && bodyToOperation) {
          const params = {
            TableName: "events",
            Item: bodyToOperation,
          };
          await client.connect();
          const db = await client.db("fff");
          const liveConnections = await db.collection(params.TableName);
          await liveConnections.insertOne(params.Item);
        }

      case "update":
        if (operation && eventID && bodyToOperation) {
          const params = {
            TableName: "events",
            Item: { $set: bodyToOperation },
            Key: {
              eventId: eventID,
            },
          };
          await client.connect();
          const db = await client.db("fff");
          const liveConnections = await db.collection(params.TableName);
          await liveConnections.updateOne(params.Key, params.Item);
        }

      case "delete":
        if (operation && eventID) {
          const params = {
            TableName: "events",
            Key: {
              eventId: eventID,
            },
          };
          await client.connect();
          const db = await client.db("fff");
          const liveConnections = await db.collection(params.TableName);
          await liveConnections.deleteOne(params.Key);
        }

      case "read":
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
