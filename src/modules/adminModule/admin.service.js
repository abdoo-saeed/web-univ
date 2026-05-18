import { find, findOne } from "../../DB/db.repo.js";
import { userModel } from "../../DB/models/userModel.js";
import { errorRes } from "../../utils/res.handle.js";








export const getAllUsersService = async () => {
    const users = await find({
        model: userModel,
        select: '-password',
    });

    return {
        data:{
            users
        }
    }
};




export const deleteUserService = async (email)=>{

     const isEmailExist = await findOne(
            {
                model:userModel,
                filter:{email},
    
            }
        )
        if(!isEmailExist){
            errorRes({message:"user not found"})
        }
    const result = await userModel.deleteOne({email})

    return {
        data:{
            result
        }
    }

}


export const searchUsersService = async ({ firstName, page = 1, limit = 10 }) => {
  const q = (firstName ?? "").trim();
  if (!q) {
    return errorRes({ message: "firstName query is required", status: 400 });
  }

  const filter = { firstName: { $regex: q, $options: "i" } };

  const skip = (Number(page) - 1) * Number(limit);

  const users = await userModel
    .find(filter)
    .select("-password")
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await userModel.countDocuments(filter);

  if (!users.length) {
    return errorRes({ message: "User not found", status: 404 });
  }

  return {
    data: { users, total, page: Number(page), limit: Number(limit) },
  };
};
