import mongoose from "mongoose";

const WorkSpaceCredentialsSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    secondName: {
        type: String,
    },
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
    site_location: {
        type: String
    },
    image: {
        type: String
    },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE"]
    }
})

const WorkSpaceCredentials = mongoose.model("WorkSpaceCredentials", WorkSpaceCredentialsSchema);
export default WorkSpaceCredentials;