'use strict'
const AWS=require ('aws-sdk');

const dynamoDB= new AWS.DynamoDB.DocumentClient();
module.exports.updateUser = (event, context, callback)=>{
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
        Key: {
            id: event.pathParameters.id
        },
        ExpressionAttributeValues: {
            ":e": data.email,
            ":u": now
        },
        UpdateExpression:  'set email = :e, updatedAt= :u'
    }
    dynamoDB.update(params,(error, data)=>{
       
        if(error){
            console.log(error);
            callback(new Error(error));
            return;
        }
        const response={
            statusCode:200,
            body: JSON.stringify(data.Item)
        }
        callback(null, response);
    })

}