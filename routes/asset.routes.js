import express from "express"
const router = express.Router()

import { uploadFileToS3, create, createFile, getFile1 } from "../controllers/Assets/assetController.js"

router.route("/asset/url").post(create)
router.route("/asset/file").post(createFile)
router.route("/asset/file").get(getFile1)

export default router;