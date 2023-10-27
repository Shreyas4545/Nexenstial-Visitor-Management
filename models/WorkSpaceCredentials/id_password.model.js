import mongoose from "mongoose";

const id_password = new mongoose.Schema({
    email: {
        required: true,
        type: String
    },
    password: {
        required: true,
        type: String
    },
    role: {
        type: String,
    },
    phone: {
        type: Number,
        unique: true
    },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE"]
    }
})

const Id_Password = mongoose.model("Id_Password", id_password);
export default Id_Password;