import { Router } from "express";
import * as authService from "./auth.service.js";
import { successRes } from "../../utils/res.handle.js";
import { auth} from "../../middlewares/auth.middleware.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { loginSchema, signUpSchema } from './auth.validation.js';


//=================================================================================================




const router = Router();






router.get('/', (req, res, next) => {
    res.json({ msg: "hello from users module" })
})


router.post("/signUp",validation(signUpSchema),async (req,res,next)=>{

    const {username,password,email,gender,age,phone} = req.body

    //the place the validation done 

    const {data} = await authService.signUp({username,password,email,gender,age,phone})

    successRes({
        res,
        data:{...data},
        status:201
    })

})


router.patch("/confirm-email",async(req,res,next)=>{
     const {otp,email }= req.body
     const data = await authService.confirmEmail({email,otp})
     successRes({res,data})

})



router.post("/login",validation(loginSchema),async (req,res,next)=>{

    const {email,password} = req.body
    const {data} = await authService.login({email,password})

    successRes({
        res,
        data,
    })

})



router.get("/profile",auth,async (req,res)=>{

    successRes({
        res,
        data:req.user
    })

})



router.post('/refresh-Token',async (req,res,next)=>{

    const {data} = await authService.refreshToken({refreshToken:req.headers.authorization})
    //  console.log(data);
     

    return successRes({res,data})
})



router.patch("/logout",auth,async(req,res,next)=>{

    
    const {data} = await authService.logoutService({
        user:req.user,
        iat:req.decoded.iat,
        jti:req.decoded.jti,
    })

    successRes({res})

})




export default router


