import userModel from "../models/user.model.js";
import { errorHandle } from "../utils/error.js";
import messageModel from "../models/message.model.js";
import chatModel from "../models/chat.model.js";
import {ObjectId} from "mongoose"

export const sendMessage = async (req, res, next) => {
    try{
        const reciverId = req.params.id;
        const userId = req.body.userId;
        const validUser = await userModel.findById(reciverId);
        if(!validUser) return next(errorHandle(404, "reciver not found"));

        const usersChat = await chatModel.findOne({users: {$all: [userId, reciverId]}});
        if(!usersChat){
            const newUsersChat = await chatModel.create({
                users: [userId, reciverId]
            })
        }
        const newMessage = await messageModel.create({
            sender: userId,
            reciver: reciverId,
            text: req.body.message,
            file: req.body.file,
            image: req.body.image,
        });
        return res.status(201).json(newMessage);
    }catch(error){
        next(error);
    }
};

export const showMessage = async (req, res, next) => {
    try{
        const reciverId = req.params.id;
        const userId = req.user.id;
        const validReciver = await userModel.findById(reciverId);
        if(!validReciver) return next(errorHandle(404, "Reciver not found"));
        const allMessages = await messageModel.find({
            $or: [
                {sender: userId, reciver: reciverId},
                {sender: reciverId, reciver: userId},
            ]
        }).sort({ timestamp: 1 });
        return res.status(200).json(allMessages);
    }catch(error){
        next(error);
    }
};

export const getUserChatRoom = async (req, res, next) => {
    try{
        const userId = req.user.id;
        const reciverId = req.params.id;

        const validUser = await userModel.findById(reciverId);
        if(!validUser) return next(errorHandle(404, "reciver not found"));

        let usersChat = await chatModel.findOne({users: {$all: [userId, reciverId]}});

        if(!usersChat){
            usersChat = await chatModel.create({
                users: [userId, reciverId]
            })
        }
        res.status(201).json(usersChat);
    }catch(error){
        next(error);
    }
};

export const deleteMessage = async (req, res, next) => {
    try{
        const message = await messageModel.findById(req.params.id);

        if(!message) return next(errorHandle(404, "message not found"));

        if(message.sender.equals(new ObjectId(req.user.id))) return next(errorHandle(401, "You can only delete your own messages"));

        await messageModel.findByIdAndDelete(req.params.id);

        res.status(200).json("message deleted successfully");
    }catch(error){
        next(error);
    }
};

export const clearChat = async (req, res, next) => {
    try{
        const userId = req.user.id;
        const reciverId = req.params.id;
        await messageModel.deleteMany({
            $or: [
                {sender: userId, reciver: reciverId},
                {sender: reciverId, reciver: userId}
            ]
        });
        res.status(200).json("Chat is clear now");
    }catch(error){
        next(error);
    }
};