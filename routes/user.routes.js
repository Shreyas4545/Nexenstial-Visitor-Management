import express from "express"
import { protect } from "../middlewares/AuthMiddleWare.js"

const router = express.Router()

// import controllers
import { createUser, getUser, getAllCompanies, getAllUsers } from "../controllers/User/userController.js"

router.route("/user/createUser").post(createUser)
router.route("/user/getUser/:id").get(getUser)
router.route("/user/getAllCompanies").get(getAllCompanies)
router.route("/user/getAllUsers").get(getAllUsers)

export default router;