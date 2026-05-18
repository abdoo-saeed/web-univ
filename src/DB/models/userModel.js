import mongoose, { model, Schema } from 'mongoose';

import { Gender, roles } from '../enums/user.enums.js';





const userSchema = new Schema(
   {
      firstName:{
         type:String,
         required:true,
         minLength:3,
         maxLength:50
      },
      lastName:{
          type:String,
         required:true,
         minLength:3,
         maxLength:50
      },
      email:{
         type:String,
         required:true,
         minLength:10,
         maxLength:250,
         unique:true
      },
      password:{
         type:String,
         required:true,
         minLength:8,
      },
      gender:{
         type:String,
         default:Gender.male,
         enum:[Gender.male,Gender.female] //or Object.values(Gender)
      },


      confirmEmail:{
         type:Boolean,
         default:false
      },


      age:Number,
      phone:{
         type:String
      },
      credential_changedAt:Date,
      isDeleted:{
        type:Boolean,
        default:false
      },
      role:{
         type:Number,
         default:roles.user,
         enum:Object.values(roles)

      },
      profileImage:{
         type: String
      },
      

   },
    
    
    {
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


    userSchema.virtual("username")
    .set(function(value){
      console.log(value);
      
      const [firstName,lastName] = value.split(' ')
      this.set('firstName',firstName)
      this.set('lastName',lastName)
    })
    .get(function(){
      return `${this.firstName} ${this.lastName}`
    })



    export const userModel = mongoose.models.user || model("user",userSchema)