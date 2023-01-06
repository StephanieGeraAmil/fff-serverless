'use strict'
const AWS=require ('aws-sdk');

const dynamoDB= new AWS.DynamoDB.DocumentClient();
module.exports.getUser = (event, context, callback)=>{
 
    const params={
        TableName: 'users',
        key:{
            id: event.pathparameters.id
        }
    }
    dynamoDB.get(params,(error, data)=>{
      
        if(error){
            console.log(error);
            callback(new error(error));
            return;
        }
        const response= dataItem?{
            statusCode:200,
            body: JSON.stringify(data.Item)
        }:{
             statusCode:404,
            body: JSON.stringify({"message" : "User not found"})
        }
        callback(null, response);
    })

}