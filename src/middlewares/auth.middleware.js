import { errorRes } from '../utils/res.handle.js'
import { decodedToken } from '../utils/security/token.security.js'



export const auth = async (req,res,next) =>{

    const authorization = req.headers.authorization

    const {user,decoded} = await decodedToken({token:authorization})
    req.user = user
    req.decoded = decoded
    next()

}


export const isAdmin = (req, res, next) => {
    if (req.user.role !== 0) {
        return errorRes({
        res,
        message: "Not authorized",
        status: 401
      });
    }
    next();
};