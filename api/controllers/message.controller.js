import userModel from "../models/user.model.js";
import { errorHandle } from "../utils/error.js";
import messageModel from "../models/message.model.js";

export const sendMessage = async (req, res, next) => {
    try{
        const reciverId = req.params.id;
        const userId = req.user.id;
        const validUser = await userModel.findById(reciverId);
        if(!validUser) return next(errorHandle(404, "reciver not found"));
        const newMessage = await messageModel.create({
            sender: userId,
            reciver: reciverId,
            text: req.body.message,
        });
        return res.status(201).json(newMessage);
    }catch(error){
        next(error);
    }
}