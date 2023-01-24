"use strict";
const AWS = require("aws-sdk");
const MongoClient = require("mongodb").MongoClient;

module.exports.onConnect = async (event) => {
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
    const liveConnections = await db.collection("web-socket-connections");
    await liveConnections.insertOne(params.Key);
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
    const liveConnections = await db.collection("web-socket-connections");
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
