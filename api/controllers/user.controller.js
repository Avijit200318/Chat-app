import userModel from "../models/user.model.js";
import { errorHandle } from "../utils/error.js";

export const allUsers = async (req, res, next) => {
    try{
        const users = await userModel.find({_id: {$ne: req.user.id}});
        return res.status(200).json(users);
    }catch(error){
        next(error);
    }
}