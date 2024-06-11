import bcryptjs from "bcryptjs";
import userModel from "../models/user.model.js";
import { errorHandle } from "../utils/error.js";

export const signUp = async (req, res, next) => {
    const {username, email, password} = req.body;
    if(!username || !email || !password){
        return res.status(404).json("invalid information");
    }
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new userModel({username, email, password: hashedPassword});
    try{
        await newUser.save();
        res.status(201).json("New User created");
    }catch(error){
        next(error);
    }
}