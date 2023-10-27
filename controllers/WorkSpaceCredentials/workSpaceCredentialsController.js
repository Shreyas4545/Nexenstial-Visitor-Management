import e from "express"
import bigPromise from "../../middlewares/bigPromise.js"
import bcrypt from "bcryptjs"
import { forgotPassword } from "../../Templates/forgotPassword.js"
import WorkSpaceCredentials from "../../models/WorkSpaceCredentials/WorkSpaceCredential.model.js"
import Id_Password from "../../models/WorkSpaceCredentials/id_password.model.js"
import { sendMail } from "../../utils/mail.js"

export const signup = async (req, res) => {
    let { firstName, secondName, image, password, site_location, role, email, phone } = req.body;
    console.log(req.headers);
    let obj = { firstName, secondName, image, password, site_location, role, email, phone, status: "ACTIVE" }

    await Id_Password.create({
        email: email,
        password: password,
        role: role,
        phone: phone
    }).catch((err) => {
        console.log(err);
    })

    obj.password = await bcrypt.hash(password, 8);

    await WorkSpaceCredentials.create(obj).then((data) => {
        return res.status(200).json({
            success: true,
            message: "Successfully Created !",
            data: data
        })
    }).catch((err) => {
        console.log(err);
        return res.status(401).json({
            success: false,
            message: err,
        })
    })
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    let user = await WorkSpaceCredentials.findOne({ email: email, raw: true });
    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid Email",
        })
    }
    console.log(email, password, user);
    let x = await bcrypt.compare(password, user.password)
    console.log(x);
    if (!x) {
        return res.status(401).json({
            success: false,
            message: "Invalid Credentials",
        })
    }
    else {
        return res.status(200).json({
            success: true,
            message: "Successfully Logged In !",
            data: user
        })
    }
}

export const getCredentials = async (req, res) => {
    await WorkSpaceCredentials.find({ status: "ACTIVE" }).then((data) => {
        return res.status(200).json({
            success: true,
            message: "Successfully Sent Details !",
            data: data
        })
    }).catch((err) => {
        console.log(err);
        res.status(401).json({
            success: false,
            message: err,
        })
    })
}

export const check = {
    forgotpassword: async (req, res) => {
        const { email } = req.body;
        await Id_Password.findOne({ email: email }).then(async (data) => {
            await sendMail(email, "2gethr’s VMS Password Recovery", forgotPassword(email, data?.password, data?.phone));
            return res.status(200).json({
                success: true,
                message: "Successfully Sent Email !",
            })
        }).catch((err) => {
            console.log(err);
        })
    }
}