import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import schedule from "node-schedule"
import bodyParser from "body-parser"
import logger from "./logger.js"
dotenv.config();
const app = express()
connectDB()
import cookieParser from "cookie-parser"
//cookies and filemiddleware
app.use(cookieParser())

app.use(cors());

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// morgan middlewares
import morgan from "morgan"
app.use(morgan("tiny"))

// regular middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// import all routes here
import userRoutes from "./routes/user.routes.js"
import visitorRoutes from "./routes/Visitor.routes.js"
import assetRoutes from "./routes/asset.routes.js"
import WorkSpaceCredentialRoutes from "./routes/workSpaceCredentials.routes.js"

//import Corn Scheduler Function which schedules mails to visitors every month.
import { sendMail1 } from "./controllers/Visitor/visitorController.js"

// router middleware
app.use("/api", userRoutes);
app.use("/api", visitorRoutes);
app.use("/api", assetRoutes);
app.use("/api", WorkSpaceCredentialRoutes);

app.get("/", function (req, res) {
    return res.status(200).json({
        success: true,
        message: "Welcome To Nexenstial Developers Community"
    })
})

schedule.scheduleJob("30 10 1 * *", async () => {
    sendMail1();
})

export default app;