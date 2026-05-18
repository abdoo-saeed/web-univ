import { Router } from "express";
import { upload } from "../../middlewares/multer.middleware.js";
import * as messagesService from "./message.service.js"
import { successRes } from "../../utils/res.handle.js";
import { auth } from './../../middlewares/auth.middleware.js';
const router = Router()




router.post("/send-message",
    
    async(req,res)=>{
        
        const {to,body}= req.body
        const data = await messagesService.sendMessages({to,body})

        return successRes({
            res,
            data
        })

    }
)



router.get("/my-messages",
    auth,
    async (req, res) => {

        const userId = req.user._id;

        const data = await messagesService.getReceivedMessages({ userId });

        return successRes({
            res,
            data
        });

    }
);








export default router