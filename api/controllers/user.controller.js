import userModel from "../models/user.model.js";
import { errorHandle } from "../utils/error.js";

export const allUsers = async (req, res, next) => {
    try{
        const users = await userModel.find({_id: {$ne: req.user.id}});
        if(users.length === 0) return next(errorHandle(404, "No users found"));
        return res.status(200).json(users);
    }catch(error){
        next(error);
    }
}