'use strict'
const AWS=require ('aws-sdk');

const dynamoDB= new AWS.DynamoDB.DocumentClient();
module.exports.deleteUser = (event, context, callback)=>{
 
    const params={
        TableName: 'users',
        Key: {
            id: event.pathParameters.id
        }
    }
    dynamoDB.delete(params,(error, data)=>{
      
        if(error){
            console.log(error);
            callback(new Error(error));
            return;
        }
        const response={
            statusCode:200,
            body: JSON.stringify({})
        }
        callback(null, response);
    })

}