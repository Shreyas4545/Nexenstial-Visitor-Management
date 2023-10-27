import express from "express";
import { protect } from "../middlewares/AuthMiddleWare.js";
import { getActive, AddVisitor, getVisitorCompanyNames, getAllVisitors, getVisitorByid, updateVisitor, updateVisitorwithQr, bulkLogoutVisitors, CountVisitors, HistoryVisitors, getCompanyName, getTemplate, createTemplate, sendMail1, updateTemplate, getUpcoming, getDeclined } from "../controllers/Visitor/visitorController.js";

const router = express.Router();

router.route("/Visitor").post(protect, AddVisitor);
router.route("/getVisitors").get(protect, getAllVisitors);
router.route("/Visitor/:id").put(protect, updateVisitor);
router.route("/Visitor/:id").get(protect, getVisitorByid);
router.route("/qrCode/:id").put(protect, updateVisitorwithQr);
router.route("/Visitor/logout").post(protect, bulkLogoutVisitors);
router.route("/VisitorsHistory").get(protect, HistoryVisitors);
router.route("/Visitorscount").get(protect, CountVisitors);
router.route("/CompanyName").get(protect, getCompanyName);
router.route("/getAllCompanyNames").get(protect, getVisitorCompanyNames);
router.route("/createTemplate").post(protect, createTemplate);
router.route("/getTemplate").get(protect, getTemplate);
router.route("/sendMail").post(protect, sendMail1);
router.route("/updateTemplate").post(protect, updateTemplate);
router.route("/getUpcoming").get(protect, getUpcoming);
router.route("/getActive").get(protect, getActive);
router.route("/getDeclined").get(protect, getDeclined);

export default router;