import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../logger.js"
dotenv.config();
const MONGO_URL = process.env.MONGO_URL

// Connect Database
export const connectDB = () => {
    mongoose.connect(MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(() => {
            console.log("DB Connected Succesfully....")
            logger.info("DB Connected Succesfully....")
        })
        .catch((err) => {
            console.log("DB Connection Failed!")
            console.log(err)
            process.exit(1)
        });
}
export default connectDB;