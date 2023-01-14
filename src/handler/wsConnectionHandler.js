'use strict'
const AWS=require ('aws-sdk');
const dynamoDB= new AWS.DynamoDB.DocumentClient();

module.exports.onConnect = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const putParams = {
    TableName: "web-socket-connections",
    Item: {
      connectionId: connectionId,
    },
  };
  try {
    await dynamoDB.put(putParams).promise();
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
  const delParams = {
    TableName: "web-socket-connections",
    Key: {
      connectionId: connectionId,
    },
  };
  try {
    await dynamoDB.delete(delParams).promise();
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
module.exports.onBroadcast = async (event) => {
  let connectionData;
  try {
    connectionData = await dynamoDB
      .scan({
        TableName: "web-socket-connections",
        ProjectionExpression: "connectionId",
      })
      .promise();
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }

  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    // apiVersion: "2018-11-29",
    endpoint:
      event.requestContext.domainName + "/" + event.requestContext.stage,
  });

  const postData = JSON.parse(event.body).data;

  const postCalls = connectionData.Items.map(async ({ connectionId }) => {
    try {
      await apigwManagementApi
        .postToConnection({ ConnectionId: connectionId, Data: postData })
        .promise();
    } catch (e) {
      if (e.statusCode === 410) {
        console.log(`Found stale connection, deleting ${connectionId}`);
        await ddb
          .delete({
            TableName: "web-socket-connections",
            Key: { connectionId },
          })
          .promise();
      } else {
        throw e;
      }
    }
  });

  try {
    await Promise.all(postCalls);
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }

  return { statusCode: 200, body: "Data sent." };
};


module.exports.onSend = async (event) => {
  
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
      await ddb
        .delete({
          TableName: "web-socket-connections",
          Key: { postDestination },
        })
        .promise();
    } else {
      throw e;
    }
  }
  return { statusCode: 200, body: "Data sent." };
};