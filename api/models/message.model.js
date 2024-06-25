import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    reciver: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    text: {
        type: String,
    },
    file: {
        type: Boolean,
        default: false,
    },
    url: {
        type: String,
        default: '',
    },
    fileType: {
        type: String,
        default: '',
    }
}, {timestamps: true});

const Message = mongoose.model("Message", messageSchema);

export default Message;