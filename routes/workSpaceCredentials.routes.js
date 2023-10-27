import express from "express";
import { getCredentials, login, signup, check } from "../controllers/WorkSpaceCredentials/workSpaceCredentialsController.js";
const router = express.Router()

router.route("/workspace/signup").post(signup)
router.route("/workspace/login").post(login)
router.route("/workspace/getCredentials").get(getCredentials)
router.route("/workspace/forgotpassword").post(check.forgotpassword);
export default router;