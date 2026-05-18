
import { model, Schema, Types } from "mongoose";



const schema = new Schema({
    body:{
        type:String,

    },
 
    to:{
        type:String,
        ref:"User",
        required:true
    }
},{
     timestamps:true,
       toJSON:{
        virtuals:true,
        getters:true 
       },
       toObject:{
        virtuals:true,
        getters:true
       },
       strictQuery:true,
       strict:true,
       validateBeforeSave:true,
       optimisticConcurrency:true
})



export const messageModel = model("message",schema)