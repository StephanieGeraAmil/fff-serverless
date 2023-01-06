'use strict'
const AWS=require ('aws-sdk');
const uuid= require ('uuid');

const dynamoDB= new AWS.DynamoDB.DocumentClient();
module.exports.listUsers = (event, context, callback)=>{

    const params={
        TableName: 'users'
    }
    dynamoDB.scan(params,(error, data)=>{
      
        if(error){
       console.log(error);
       callback(new error(error));
       return;
        }
        const response={
            statusCode:200,
            body: JSON.stringify(data.Items)
        }
        callback(null, response);
    })

}