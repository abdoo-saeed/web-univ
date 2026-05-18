import { create, find, findByEmail, findById } from "../../DB/db.repo.js"
import { messageModel } from "../../DB/models/messageModel.js";
import { userModel } from "../../DB/models/userModel.js";
import { errorRes } from "../../utils/res.handle.js";




export const sendMessages=async({to,body})=>{
    const user = await  findByEmail({ email : to})

    if(!user){
       return errorRes({message:"user not found",status:404})
    }

    const message = await create({
        model:messageModel,
        data:{
            to:user.email,
            body,
        }
    })

    return {
        data:[
            message
        ]
    }
}




export const getReceivedMessages = async ({ userId }) => {

    const user = await findById({ model: userModel, id: userId });

    if (!user) {
        return errorRes({ message: "user not found", status: 404 });
    }

    const messages = await find({
        model: messageModel,
        filter: { to: user.email }, // 👈 THIS is the key
        sort: { createdAt: -1 } // latest first (optional)
    });

    return {
        data: messages
    };
};



