import { findOne } from "../../DB/db.repo.js"
import { userModel } from "../../DB/models/userModel.js"
import { errorRes } from "../../utils/res.handle.js"
import { compare, hash } from "../../utils/security/hash.security.js"
import { generateDncryption, generateEncryption } from "../../utils/security/encryption.security.js"
import { decodedToken, generateToken} from "../../utils/security/token.security.js"
import {OAuth2Client} from 'google-auth-library'
import crypto from "crypto"
import { confirmEmailKeyPrefix, deletByKey, get, getTtl, set, update } from "../../DB/redis.services.js"
import { emailEmitter, generateOTP} from "../../utils/index.js"
import { findByEmail } from './../../DB/db.repo.js';





//=====================================================================================

const client = new OAuth2Client()



export const signUp = async ({username,password,email,gender,age,phone})=>{

    const isEmailExist = await findOne(
        {
            model:userModel,
            filter:{email},

        }
    )
    if(isEmailExist){
        errorRes({message:"email already exist",status:400})
    }
 
    let hashedPass
    if(password){
        hashedPass =await hash({text: password , target: "argon2"})//to hash the password
    }


    const user = await userModel.create({
            username,
            password:hashedPass,
            email,
            gender,
            age,
            phone:await generateEncryption(phone),
        })


    
       const code =generateOTP()

       await set({
        key:confirmEmailKeyPrefix({userId:user._id}),
        value:{
            otp: await hash({text:code}),
            attempts:1,
        },
        ttl: 300  // 5 minutes
    })


    emailEmitter.emit("Send OTP",{
        email,
        code,
        title:"Confirm Email",
        expiredTime:"5 Minutes"
    })
        


        
    return {
        data:{
            message:"success",
            data:user
        }
    }
} 


export const confirmEmail = async ({email,otp})=>{

    const user = await findByEmail({email})

    if(!user){
        errorRes({message:"user not found",status:404})
    }
    if(user.confirmEmail){
        errorRes({message:"user already confirmed"})
    }


    const otpKey = confirmEmailKeyPrefix({userId:user._id}) 
    const otpData =JSON.parse(await get({key:otpKey}))

    if(!otpData){
        errorRes({message:"otp not found"})
    }

    if(otpData.attempts > 5){
        const ttl = await getTtl(otpKey)
        errorRes({message:`retry after : ${Math.ceil(ttl/60)} minutes`})
    }

    if(! await compare({text:otp , cipherText:otpData.otp})){
        await update({
            key:otpKey,
            value:{
                otp:otpData.otp,
                attempts:otpData.attempts + 1
            },
            ttl:await getTtl(otpKey)
        })
        errorRes({message:"in-valid otp try again"})
    }

  //==== user confirmed his email =====
    await deletByKey(otpKey)
    user.confirmEmail = true
    await user.save()

    return {
        data:{}
    }

}




export const login = async({email,password})=>{
    const user = await findByEmail({email , select:"provider firstName lastName username  password phone"})
    if(!user){
        errorRes({
            message:"in_valid credentials"
        })
    }

    if(!user.confirmEmail){
        errorRes({message:"email not confirmed yet",status:409})
    }
    
    if(!(await compare({text: password ,cipherText: user.password ,target: 'argon2'}))){
        errorRes({ 
            message:"in_valid credentials"
        })
    }

    user.phone = await generateDncryption(user.phone)




    const jwtid = crypto.randomUUID() // make it global to revoked access & refresh
    const accessToken = generateToken({
        payload:{_id:user._id},
        role:user.role,
        options:{
            expiresIn:"1d",
            jwtid  //same key same value
        }

    }) 

    const refreshToken = generateToken({
        payload:{_id:user._id},
        role:user.role,
        options:{
            expiresIn:"1w",
            jwtid
        },
        tokenType: 'refresh' 

    }) 

    
    return{
        data:{
        accessToken,
        refreshToken
        }

    }
}


export const refreshToken = async({refreshToken})=>{

       const {user} = await decodedToken({token:refreshToken,tokenType:"refresh"})
   
        const accessToken = generateToken({
            payload:{_id:user._id},
            role:user.role,
            options:{expiresIn:30*60},


        })
        
        return {
            data:{
                accessToken
            }
        }
}



export const getUserProfile = async({id})=>{
 return{
    data:
    profile
 }

}




export const logoutService = async ({user,iat,jti})=>{

        user.credential_changedAt = Date.now()
        await user.save()


    return {
        data:{}
    }
}