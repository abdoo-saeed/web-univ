import { Router } from "express";
import { auth, isAdmin } from "../../middlewares/auth.middleware.js";
import * as adminService from "./admin.service.js"
import { errorRes, successRes } from "../../utils/res.handle.js";




const router = Router();




router.get("/get-users",
    auth,
    isAdmin,
    async (req, res, next) => {

        const data = await adminService.getAllUsersService();

        return successRes({
             res,
             data,
             status:200
            });
    }
);


router.delete("/delete-user",
    auth,
    isAdmin,
    async(req,res,next)=>{
        const email = req.body.email

        const deleted = await adminService.deleteUserService(email)

        successRes({
            res,
            message:'deleted',
            data:deleted
        })

    }
)



router.get("/search-users", auth, isAdmin, async (req, res, next) => {
  try {
    const { firstName, page, limit } = req.query;

    const data = await adminService.searchUsersService({
      firstName,
      page,
      limit,
    });

    return successRes({ res, data });
  } catch (err) {
    return next(err);
  }
});







export default router