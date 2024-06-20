import userModel from "../models/user.model.js";
import { errorHandle } from "../utils/error.js";
import bcryptjs from "bcryptjs";

export const allUsers = async (req, res, next) => {
    try{
        const users = await userModel.find().sort({createdAt: -1});
        return res.status(200).json(users);
    }catch(error){
        next(error);
    }
};

export const userData = async (req, res, next) => {
    try{
        const userId = req.params.id;
        const user = await userModel.findById(userId).select('-password');
        if(!user) return next(errorHandle(404, "User not found"));
        return res.status(200).json(user);
    }catch(error){
        next(error);
    }
};

export const searchUser = async (req, res, next) => {
    try{
        const user = await userModel.find({$or: [
            {email: req.body.searchText},
            {username: { $regex: req.body.searchText, $options: 'i'}}
        ]}).sort({createdAt: -1});
        if(!user) return next(errorHandle(404, "User not found"));
        res.status(201).json(user);
    }catch(error){
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    if(req.user.id !== req.params.userId) return next(errorHandle(401, "You can only update your own profile"));
    try{
        let hashPassword;
        if(req.body.password){
            hashPassword = bcryptjs.hashSync(req.body.password, 10);
        }
        
        const updatedUser = await userModel.findByIdAndUpdate(
            req.params.userId,
            {
                $set: {
                    username: req.body.username,
                    email: req.body.email,
                    status: req.body.status,
                    password: hashPassword,
                    avatar: req.body.avatar,
                },
            },
            {new: true}
        );

        const {password: pass, ...rest} = updatedUser._doc;
        res.status(200).json(rest);
    }catch(error){
        next(error);
    }
}