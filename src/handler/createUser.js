'use strict'
const AWS=require ('aws-sdk');
const uuid= require ('uuid');

const dynamoDB= new AWS.DynamoDB.DocumentClient();
module.exports.createUser = (event, context, callback)=>{
    const  now= new Date().toISOString();
    const data= JSON.parse(event.body);
    if ( typeof data.email != 'string'){
        console.error ('User must have an email of type string');
       
        const response ={
            statusCode: 400,
            body: JSON.stringify({"message":"User must have an email of type string"})
        }
    }
    const params={
        TableName: 'users',
        Item: {
            id: uuid.v4(),
            email: data.email,
            createdAt: now,
            updatedAt: now
        }
    }
    dynamoDB.put(params,(error, data)=>{
       
        if(error){
       console.log(error);
       callback(new error(error));
       return;
        }
        const response={
            statusCode:201,
            body: JSON.stringify(data.Items)
        }
        callback(null, response);
    })

}