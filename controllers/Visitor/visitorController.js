import bigPromise from "../../middlewares/bigPromise.js";
import Visitor from "../../models/Visitors/Visitors.model.js";
import axios from "axios"
import { createJwtToken } from "../../utils/generateToken.js";
import { mailTemp } from "../../Templates/mailTemplate.js"
import { sendMail } from "../../utils/mail.js"
import User from "../../models/User/User.model.js";
import sendGridMailTemplate from "../../models/Visitors/sendGridApiTemp.model.js"
import { newsLetter } from "../../Templates/newsLetter.js"
import logger from "../../logger.js"

export const sendNoti = async (content, id,isVisitor,status) => {
    const headers = {
        'Authorization': 'Basic NzIzZDk4NjAtYmRjZi00MDEzLThhNzktZTI2NDliNmUxOWFm',
        'Content-Type': 'application/json'
    };

    const data = {
        "app_id": "a642e016-d61d-46ca-9053-ab4b3d6d8692",
        "included_segments": ["Subscribed Users"],
        "data": { "foo": "bar","visitor":isVisitor,"status":status },
        "contents": { "en": content },
        "subtitle": { "en": "Confirmation of Visitor" },
        "filters": [
            { "field": "tag", "key": "id", "relation": "=", "value": id }
        ]
    };

    axios.post('https://onesignal.com/api/v1/notifications', data, { headers })
        .then(response => {
            console.log('Notification sent successfully:', response?.data);
        })
        .catch(error => {
            console.error('Error sending notification:', error?.response?.data);
        })
}

export const AddVisitor = bigPromise(async (req, res, next) => {

    let { name, phone, user_id, company_name, purpose_of_visit, contact_person_name, contact_person_email, visiting_company_name, image, company_id, logs, email, current_status, news_letter_confirmation, session_start_date, session_start_time, session_end_time, pre_register } = req.body;
    let obj = {
        name, phone, user_id, company_name, purpose_of_visit, contact_person_name, contact_person_email, visiting_company_name, image, company_id, logs, status: "PENDING", current_status, email, logs, news_letter_confirmation, session_start_date, session_start_time, session_end_time, pre_register, active_pre_register_id: 0,
    }
    if (pre_register?.length > 0) {
        pre_register[0].id = 1;
        pre_register[0].qr_expiry = 0;
        pre_register[0].status = "UPCOMING";
    }

    if (logs?.length > 0) {
        logs[0].status = "UPCOMING"
        logs[0].type1 = "CHECK_IN"
        logs[0].user_id = user_id
    }
    if (news_letter_confirmation == 1) {
        sendMail(email, "Nexenstial News Letter Confirmation", newsLetter(name, email, phone, company_name));
    }

    await Visitor.create(obj).then(async (data) => {
        try {
            if (contact_person_email) {
                sendNoti(`"${name}" has been Pre-Registered for ${pre_register[0].session_start_date.split("T")[0]} and invite has been sent to email.`, req.body.user_id,true,"UPCOMING");
            }
            else if (req.body.user_id) {
                sendNoti(`"${name}" has requested for the Check In. Please Accept/Reject.`, req.body.user_id,true,"UPCOMING");
            }
            return res.status(200).json({
                success: true,
                data: data,
                message: "Successfully Added Visitor"
            });
        } catch (error) {
            console.log(error);
            logger.info(error)
            return res.status(500).json({
                success: false,
                message: "An error occurred"
            });
        }
    });
})

export const getAllVisitors = bigPromise(async (req, res, next) => {

    const obj = {}
    if (req.query.visiting_company_name) {
        obj.visiting_company_name = req.query.visiting_company_name
    }

    if (req.query.company_id) {
        obj.company_id = req.query.company_id
    }
    if (req.query.phone) {
        obj.phone = req.query.phone;
    }

    if (req.query.user_id) {
        obj.user_id = req.query.user_id;
    }

    if (req.query.company_id) {
        obj.company_id = req.query.company_id;
    }

    if (req.query.status) {
        obj.status = req.query.status
    }

    if (req.query.current_status) {
        obj.current_status = req.query.current_status
    }

    if (req.query.news_letter_confirmation) {
        obj.news_letter_confirmation = req.query.news_letter_confirmation
    }

    await Visitor.find(obj).then((data) => {
        if (data.length > 0) {
            data?.sort((a, b) => new Date(b.pre_register[b.pre_register.length - 1]?.session_start_date) - new Date(a.pre_register[a.pre_register.length - 1]?.session_start_date))
        }
        logger.info("Successfully Sent Details")
        return res.status(200).json({
            success: data.length > 0 ? true : false,
            data: data,
            message: "Successfully Sent Details"
        })
    }).catch((err) => {
        console.log(err);
        logger.info(err)
        return res.status(401).json({
            success: false,
            message: "Internal Server Error"
        })
    })

})

export const getVisitorByid = bigPromise(async (req, res) => {
    var obj = {}
    if (req.query.status) {
        obj.status = req.query.status;
    }
    if (req.params.id) {
        obj._id = req.params.id;
    }
    await Visitor.findOne(obj).then((data) => {
        const token = createJwtToken({ id: data?._id });
        return res.status(200).json({
            success: true,
            data: data,
            message: "Successfully Sent Details"
        })
    }).catch((err) => {
        console.log(err);
        logger.info(err)
        return res.status(401).json({
            success: false,
            message: "Internal Server Error"
        })
    })
})

export const updateVisitor = bigPromise(async (req, res, next) => {
    const { id } = req.params;
    const { image, name, phone, company_name, purpose_of_visit, contact_person_name, contact_person_email, visiting_company_name, status, email, visiting_company_id, qr_code } = req.body;

    //Check for duplicate Entries
    var repData;
    await Visitor.findById(id).then((data) => {
        repData = data
    }).catch((err) => {
        console.log(err)
    })


    if (req.body.pre_register?.length > 0) {
        let x6 = repData?.pre_register?.filter((s) =>
            s.user_id == req.body.pre_register[0]?.user_id &&
            (s.status == "ACTIVE" || s.status == "UPCOMING") &&
            s.company_name == req.body.pre_register[0]?.company_name &&
            new Date(s.session_start_date).toISOString() == new Date(req.body.pre_register[0]?.session_start_date).toISOString()
        );
        if (x6?.length > 0) {
            return res.status(200).json({
                success: false,
                message: "Your Pre-Register Request has not been Approved yet Bro",
                data: repData
            })
        }
    }

    let obj = {}
    if (req.body.image) {
        obj.image = image
    }
    if (req.body.email) {
        obj.email = email
    }
    if (req.body.name) {
        obj.name = name
    }
    if (req.body.phone) {
        obj.phone = phone
    }
    if (req.body.status) {
        obj.status = status
    }
    if (req.body.active_pre_register_id) {
        obj.active_pre_register_id = req.body.active_pre_register_id
    }
    if (req.body.contact_person_email) {
        obj.contact_person_email = contact_person_email;
    }
    if (req.body.news_letter_confirmation == 1 || req.body.news_letter_confirmation == 0) {
        obj.news_letter_confirmation = req.body.news_letter_confirmation
    }
    if (req.body.company_name) {
        obj.company_name = company_name
    }
    if (req.body.news_letter_confirmation) {
        obj.news_letter_confirmation = req.body.news_letter_confirmation
    }
    if (req.body.visiting_company_id) {
        obj.visiting_company_id = visiting_company_id
    }
    if (req.body.contact_person_name) {
        obj.contact_person_name = contact_person_name
    }
    if (req.body.purpose_of_visit) {
        obj.purpose_of_visit = purpose_of_visit
    }
    if (req.body.visiting_company_name) {
        obj.visiting_company_name = visiting_company_name
    }

    if (req.body.current_status) {
        obj.current_status = req.body.current_status;
    }
    if (req.body.logs) {
        var logs = req.body.logs;
    }
    if (req.body.qr_code) {
        obj.qr_code = req.body.qr_code
    }

    else if (req.body.pre_register?.length > 0) {
        obj.qr_code = req.body.pre_register[0]?.qr_code;
    }

    //Update all Status to Inactive


    let visitor = await Visitor.findById(id).catch((err) => {
        console.log(err);
        logger.info(err)
        return res.status(401).json({
            success: false,
            message: `Internal Server Error + ${err}`
        })
    });

    if (req.body.pre_register_id) {
        for (let i of visitor.pre_register) {
            if (i.id == req.body.pre_register_id) {
                if (req.body.pre_status) {
                    i.status = req.body.pre_status
                }
                if (req.body.qr_expiry) {
                    i.qr_expiry = req.body.qr_expiry
                }
                break;
            }
        }
        obj.pre_register = visitor.pre_register;
    }

    if (req.body.pre_register) {
        let q = visitor?.pre_register;
        let len = q.length;
        req.body.pre_register[0].id = len + 1;
        req.body.pre_register[0].qr_expiry = 0;
        req.body.pre_register[0].status = "UPCOMING";
        q.push(req.body.pre_register[0]);
        obj.pre_register = q;
        sendNoti(`"${visitor?.name}" has been Pre-Registered for ${req.body.pre_register[0]?.session_start_date?.split("T")[0]} and invite has been sent to email.`, req.body.pre_register[0]?.user_id,true,"UPCOMING");
    }
    if (qr_code) {
        if (req.body.id) {
            let pre = visitor?.pre_register?.filter((s) => s.id == parseInt(req.body.id));
            pre[0].qr_code = qr_code;
            let pre1 = visitor?.pre_register?.filter((s) => s.id != parseInt(req.body.id));
            pre1.push(pre[0]);
            obj.pre_register = pre1;
        }
        sendMail(visitor.email, "Nexenstial - Visitor Pre-Register Confirmation", mailTemp(qr_code));
    }
    if (req.query.log_id) {
        for (let i of visitor.logs) {
            if (i.id == req.query.log_id) {
                if (req.query?.company_id) {
                    i.company_id = req.query?.company_id;
                }
                if (req.query?.company_name) {
                    i.company_name = req.query?.company_name;
                }
                if (req.query.contact_person_name) {
                    i.contact_person_name = req.query.contact_person_name
                }
                if (req.query.purpose_of_visit) {
                    i.purpose_of_visit = req.query.purpose_of_visit
                }
                if (req.query?.in_time) {
                    i.in_time = req.query?.in_time;
                }
                if (req.query?.out_time) {
                    i.out_time = req.query?.out_time;
                }
                if (req.query?.site_name) {
                    i.site_name = req.query?.site_name;
                }
                if (req.query?.logs_status == "INACTIVE") {
                    i.status = "INACTIVE";
                }
                else if (req.query?.logs_status) {
                    i.status = req.query?.logs_status
                }
                break;
            }
        }
        obj.logs = visitor.logs;
    }
    if (req.body.log_id) {
        for (let i of visitor.logs) {
            if (i.id == req.body?.log_id) {
                if (req.body?.log_status) {
                    i.status = req.body?.log_status;
                }
                break;
            }
        }
        obj.logs = visitor.logs;
    }
    if (req.query.pre_register_id) {
        for (let i of visitor.pre_register) {
            if (i.id == req.query.pre_register_id) {
                if (req.query.qr_expiry) {
                    i.qr_expiry = req.query.qr_expiry
                }
                if (req.query.status) {
                    i.status = req.query.status
                }
                break;
            }
        }
        obj.pre_register = visitor.pre_register;
    }
    if (req.body.logs) {
        var newArr = visitor.logs;
        logs[0].user_id = req.body.user_id
        if (logs[0]?.type1 == "PRE_REGISTER") {
            logs[0].status = "ACTIVE"
        }
        newArr.push(logs[0]);
        obj.logs = newArr;
    }

    await Visitor.findOneAndUpdate({ _id: id }, {
        $set: obj
    }).then(async (data) => {
        let data1 = await Visitor.findOne({ _id: id }).catch((err) => {
            console.log(err);
            logger.info(err)
            return res.status(401).json({
                success: false,
                message: `Internal Server Error + ${err}`
            })
        })

        if (data1.pre_register.length > 0) {
            data1.pre_register = data1.pre_register.reverse();
        }
        if (image && req.body.user_id && req.body.qr) {
            sendNoti(`"${visitor?.name}" has Scanned Visitor QR and Just Checked In to the facility.`, req.body.user_id,true,"ACTIVE");
        }
        if (image && req.body.user_id && !req.body.qr) {
            sendNoti(`"${visitor?.name}" has requested for the Check In, Please Accept/Reject.`, req.body.user_id,true,"UPCOMING");
        }

        if (req.body.pre_register) {
            let pre_reg = data1.pre_register
            data1.purpose_of_visit = pre_reg[0].purpose_of_visit;
            data1.visiting_company_name = pre_reg[0].company_name;
            data1.contact_person_name = pre_reg[0].contact_person_name;
        }
        return res.status(200).json({
            success: true,
            data: data1,
            message: "Successfully Updated Details"
        })
    }).catch((err) => {
        console.log(err);
        logger.info(err)
        return res.status(401).json({
            success: false,
            message: `Internal Server Error + ${err}`
        })
    })
})

export const updateVisitorwithQr = bigPromise(async (req, res, next) => {
    const { id } = req.params;
    const { qr_code } = req.body;
    let obj = { qr_code: qr_code };
    let vis = await Visitor.findById(id).catch((err) => {
        console.log(err);
        logger.info(err)
        return res.status(401).json({
            success: false,
            message: "Internal Server Error"
        })
    })

    sendMail(vis.email, "Nexenstial - Visitor Pre-Register Confirmation", mailTemp(qr_code));

    await Visitor.findOneAndUpdate({ _id: id }, {
        $set: obj
    }).then((data) => {
        return res.status(200).json({
            success: true,
            message: "Successfully Updated Details"
        })
    }).catch((err) => {
        console.log(err);
        logger.info(err)
        return res.status(401).json({
            success: false,
            message: "Internal Server Error"
        })
    })
})

export const bulkLogoutVisitors = bigPromise(async (req, res, next) => {
    const data = req.body.data;
    for (let i of data) {
        await Visitor.updateOne({ _id: i?.id, "logs.id": i?.log_id }, {
            $set: {
                "logs.$.out_time": i?.out_time,
                "logs.$.status": "INACTIVE"
            }
        }).catch((err) => {
            console.log(err);
            logger.info(err)
            return res.status(401).json({
                success: false,
                message: `Error is ${err}`
            })
        })

        await Visitor.findOneAndUpdate({ _id: i?.id }, { $set: { current_status: "INACTIVE" } }).catch((err) => {
            console.log(err);
            logger.info(err)
            return res.status(401).json({
                success: false,
                message: `Error is ${err}`
            })
        })

        await Visitor.updateOne({ _id: i?.id, "pre_register.id": i?.pre_register_id, "pre_register.status": "ACTIVE" }, {
            $set: {
                "pre_register.$.status": "INACTIVE",
                "pre_register.$.qr_expiry": 0
            }
        }).catch((err) => {
            console.log(err);
            logger.info(err)
            return res.status(401).json({
                success: false,
                message: `Error is ${err}`
            })
        })
    }
    return res.status(200).json({
        success: true,
        message: "Successfully Updated Details"
    })
})

export const HistoryVisitors = async (req, res, next) => {
    let data1 = [], data2 = []

    await Visitor.find({
        $or: [{ $and: [{ "logs.company_name": req.query.visiting_company_name }, { status: "CHECKEDOUT" }, { "logs.user_id": req.query.user_id }] }, {
            $and: [{ "logs.company_name": req.query.visiting_company_name }, { "logs.user_id": req.query.user_id }]
        }, { "logs.status": "INACTIVE" }, { "logs.status": "PENDING" }], raw: true
    }).then(async (data) => {
        for (let i of data) {
            let data2 = []
            if (i.status == "CHECKEDOUT") {
                data2 = i?.logs?.filter((s) => s.company_name == req.query.visiting_company_name && s.user_id == req.query.user_id && (s.status == "INACTIVE" || s.status == "ACTIVE" || s.status == "UPCOMING"));
            }
            else {
                data2 = i?.logs?.filter((s) => s.company_name == req.query.visiting_company_name && s.user_id == req.query.user_id && (s.status == "INACTIVE" || s.status == "PENDING"));
            }
            i.logs = [];
            data2.forEach((item) => {
                let obj = {
                    _id: i?._id,
                    image: i?.image,
                    name: i?.name,
                    phone: i?.phone,
                    company_name: i?.company_name,
                    company_id: i?.company_id,
                    purpose_of_visit: item?.purpose_of_visit ? item?.purpose_of_visit : "",
                    log_id: item?.id,
                    contact_person_name: item?.contact_person_name ? item?.contact_person_name : "",
                    visiting_company_name: item?.company_name,
                    visiting_company_id: item?.company_id ? item?.company_id : "",
                    site_name: item?.site_name,
                    in_time: item?.in_time,
                    session_start_time: item?.in_time,
                    session_end_time: item?.out_time,
                    log_id: item?.id,
                    pre_register_id: 0,
                    out_time: item?.out_time,
                    status: item?.status,
                    qr_code: i?.qr_code ? i?.qr_code : "",
                    type1: item?.type1 ? item?.type1 : "CHECK_IN",
                    session_start_date: item?.in_time ? item?.in_time : ""
                }
                data1.push(obj);
            })
        }
    }).catch((err) => {
        console.log(err);
        logger.info(err)
        return res.status(401).json({
            success: false,
            message: `Internal Server Error + ${err}`
        })
    })

    await Visitor.find({ $or: [{ $and: [{ "pre_register.company_name": req.query.visiting_company_name }, { "pre_register.user_id": req.query.user_id }] }, { "pre_register.status": "INACTIVE" }, { "pre_register.status": "PENDING" }], raw: true }).then(async (data) => {
        for (let i of data) {
            let data3 = i?.pre_register?.filter((s) => s.company_name == req.query.visiting_company_name && (s.status == "INACTIVE" || s.status == "UPCOMING") && s.user_id == req.query.user_id);
            i.logs = [];
            data3.forEach((item) => {
                let obj = {
                    _id: i?._id,
                    image: i?.image,
                    name: i?.name,
                    phone: i?.phone,
                    company_name: i?.company_name,
                    company_id: i?.company_id,
                    purpose_of_visit: item?.purpose_of_visit ? item?.purpose_of_visit : "",
                    pre_register_id: item?.id,
                    contact_person_name: item?.contact_person_name ? item?.contact_person_name : "",
                    visiting_company_name: item?.company_name,
                    visiting_company_id: item?.company_id ? item?.company_id : "",
                    session_start_date: item?.session_start_date ? item?.session_start_date : "",
                    session_start_time: item?.session_start_time ? item?.session_start_time : "",
                    session_end_time: item?.session_end_time ? item?.session_end_time : "",
                    status: item?.status,
                    log_id: 0,
                    type1: "PRE_REGISTER",
                    qr_code: item?.qr_code ? item?.qr_code : ""
                }
                data2.push(obj);
            })
        }
    }).catch((err) => {
        console.log(err);
        logger.info(err)
        return res.status(401).json({
            success: false,
            message: `Internal Server Error + ${err}`
        })
    })

    let data = [...data1, ...data2]

    console.log(data)

    data.sort((a, b) => {
        const dateA = new Date(a.session_start_date);
        const dateB = new Date(b.session_start_date);

        return dateB - dateA; // Ascending order; for descending, use dateB - dateA
    });

    return res.status(200).json({
        success: true,
        data: data,
        message: "Successfully Sent Details"
    })
}

export const CountVisitors = async (req, res, next) => {

    let dec, act, upcm, his, cnt = 0;

    //Declined
    await Visitor.find({ $and: [{ "logs.company_name": req.query.visiting_company_name }, { "logs.status": "DECLINED" }, { "logs.user_id": req.query.user_id }, { "logs.user_id": req.query.user_id }], raw: true }).then(async (data) => {
        for (let i of data) {
            let data2 = i?.logs?.filter((s) => s.company_name == req.query.visiting_company_name && s.status == "DECLINED" && s.user_id == req.query.user_id);
            cnt += data2.length;
        }
    })

    await Visitor.find({ $and: [{ "pre_register.company_name": req.query.visiting_company_name }, { "pre_register.status": "DECLINED" }, { "pre_register.user_id": req.query.user_id }], raw: true }).then(async (data) => {
        for (let i of data) {
            let data3 = i?.pre_register?.filter((s) => s.company_name == req.query.visiting_company_name && s.status == "DECLINED" && s.user_id == req.query.user_id);
            cnt += data3.length;
        }
    })

    dec = cnt;

    //Active
    await Visitor.find({ $and: [{ "logs.company_name": req.query.visiting_company_name }, { "logs.user_id": req.query.user_id }, { "logs.status": "ACTIVE" }, { current_status: "ACTIVE" }, { "logs.user_id": req.query.user_id }], raw: true }).then(async (data) => {
        cnt = 0
        for (let i of data) {
            let data2 = i?.logs?.filter((s) => s.company_name == req.query.visiting_company_name && s.status == "ACTIVE" && s.user_id == req.query.user_id);
            cnt += data2.length;
        }
    })

    act = cnt

    //History
    const today = new Date(); // Get today's date

    await Visitor.find({
        $or: [{
            $and: [
                { "logs.company_name": req.query.visiting_company_name },
                { "logs.user_id": req.query.user_id },
                { "logs.status": "INACTIVE" },
            ]
        }, {
            $and: [
                { "logs.company_name": req.query.visiting_company_name },
                { "logs.user_id": req.query.user_id },
                { "logs.status": "UPCOMING" },
                { "logs.in_time": { $lt: today } }, // Check if in_time is less than today
            ],
        }]
    })
        .then(async (data) => {
            cnt = 0
            for (let i of data) {
                let data2 = i?.logs?.filter((s) => s.company_name == req.query.visiting_company_name && (s.status == "INACTIVE" || (s.status == "UPCOMING" && s.in_time < today)) && s.user_id == req.query.user_id);
                cnt += data2.length
            }
        })

    await Visitor.find({
        $or: [{
            $and: [
                { "pre_register.company_name": req.query.visiting_company_name },
                { "pre_register.user_id": req.query.user_id },
                { "pre_register.status": "INACTIVE" },
            ]
        }, {
            $and: [
                { "pre_register.company_name": req.query.visiting_company_name },
                { "pre_register.user_id": req.query.user_id },
                { "pre_register.status": "UPCOMING" },
                { "pre_register.session_start_date": { $lt: today } },
            ],
        }]
    }).then(async (data) => {
        for (let i of data) {
            let data2 = i?.pre_register?.filter((s) => s.company_name == req.query.visiting_company_name && (s.status == "INACTIVE" || (s.status == "UPCOMING" && s.session_start_date < today)) && s.user_id == req.query.user_id);
            cnt += data2.length
        }
    })

    his = cnt;

    //Upcoming
    await Visitor.find({ $and: [{ "logs.company_name": req.query.visiting_company_name }, { "logs.status": "UPCOMING" }, { "logs.user_id": req.query.user_id }, { "logs.in_time": { $gte: today } }], raw: true }).then(async (data) => {
        cnt = 0;
        for (let i of data) {
            let data2 = i?.logs?.filter((s) => s.company_name == req.query.visiting_company_name && s.status == "UPCOMING" && s.user_id == req.query.user_id && s.in_time >= today);
            cnt += data2.length
        }
    })

    await Visitor.find({ $and: [{ "pre_register.company_name": req.query.visiting_company_name }, { "pre_register.user_id": req.query.user_id }, { "pre_register.status": "UPCOMING" }, { "pre_register.session_start_date": { $gte: today } }], raw: true }).then(async (data) => {
        for (let i of data) {
            let data3 = i?.pre_register?.filter((s) => s.company_name == req.query.visiting_company_name && s.status == "UPCOMING" && s.user_id == req.query.user_id && s.session_start_date >= today);
            cnt += data3.length;
        }
    })

    upcm = cnt;

    let finalData = {
        history: his,
        declined: dec,
        active: act,
        upcoming: upcm,
        total: his + dec + act + upcm
    }
    return res.status(200).json({
        success: true,
        data: finalData,
        message: "Successfully Sent Details"
    })
}

export const getCompanyName = async (req, res, next) => {
    const name = req.query.name;
    console.log(name)
    await User.findOne({ organisationName: name }).then((data) => {
        return res.status(200).json({
            sucess: true,
            data: data,
            message: "Successfully Sent Company Id"
        })
    }).catch((err) => {
        console.log(err);
        logger.info(err)
        return res.status(401).json({
            success: false,
            message: "Internal Server Error"
        })
    })
}

export const sendMail1 = async (req, res, next) => {

    // await Visitor.find({
    //     news_letter_confirmation: 1
    // }).then(async (data) => {
    //     for (let i of data) {
    //         sendMail(i.email, "News Letter", mailTemp("Hello"));
    //     }
    // })

    return res.status(200).json({
        success: true,
        message: "Successfully Sent Mail"
    })
}

export const getVisitorCompanyNames = async (req, res, next) => {
    await Visitor.find({}).then(async (data) => {
        let data1 = [];
        let obj = {};
        await data?.forEach((ele) => {
            if (!obj[ele?.company_id]) {
                obj[ele?.company_id] = ele?.company_name
            }
        })
        data1.push(obj);
        return res.status(200).json({
            success: true,
            data: data1,
            message: "Successfully Sent Details"
        })
    })
}

export const createTemplate = async (req, res, next) => {
    const { template_id, name, image } = req.body;
    const obj = { template_id, name, is_selected: false, image };
    await sendGridMailTemplate.create(obj)
        .then((data) => {
            return res.status(200).json({
                sucess: true,
                message: "Successfully Created Template"
            })
        }).catch((err) => {
            console.log(err);
            logger.info(err)
            return res.status(401).json({
                success: false,
                message: "Internal Server Error"
            })
        })
}

export const getTemplate = bigPromise(async (req, res, next) => {
    await sendGridMailTemplate.find({}).then((data) => {
        return res.status(200).json({
            sucess: true,
            data: data,
            message: "Successfully Sent Template Details"
        })
    }).catch((err) => {
        console.log(err);
        logger.info(err)
        return res.status(401).json({
            success: false,
            message: "Internal Server Error"
        })
    })
})

export const updateTemplate = bigPromise(async (req, res, next) => {
    const old_id = req.body.old_id;
    const new_id = req.body.new_id;
    await sendGridMailTemplate.findByIdAndUpdate({ _id: old_id }, { $set: { is_selected: false } }).catch((err) => {
        console.log(err);
        logger.info(err)
        return res.status(401).json({
            success: false,
            message: "Internal Server Error"
        })
    })

    await sendGridMailTemplate.findByIdAndUpdate({ _id: new_id }, { $set: { is_selected: true } }).then(async (data) => {
        let data1 = await sendGridMailTemplate.findOne({ _id: data?._id }).catch((err) => {
            console.log(err);
            logger.info(err)
            return res.status(401).json({
                success: false,
                message: "Internal Server Error"
            })
        })
        return res.status(200).json({
            sucess: true,
            data: data1,
            message: "Successfully Updated Template Details"
        })
    }).catch((err) => {
        console.log(err);
        logger.info(err)
        return res.status(401).json({
            success: false,
            message: "Internal Server Error"
        })
    })
})

export const getUpcoming = bigPromise(async (req, res) => {

    let data1 = [], data2 = [];
    await Visitor.find({ $or: [{ $and: [{ "logs.company_name": req.query.visiting_company_name }, { "logs.status": "UPCOMING" }, { "logs.user_id": req.query.user_id }] }, { "pre_register.qr_expiry": false }] }).then(async (data) => {
        for (let i of data) {
            let data2 = i?.logs?.filter((s) => s.company_name == req.query.visiting_company_name && s.status == "UPCOMING" && s.user_id == req.query.user_id);
            i.logs = [];
            data2?.forEach((item) => {
                let obj = {
                    _id: i?._id,
                    image: i?.image,
                    name: i?.name,
                    phone: i?.phone,
                    company_name: i?.company_name,
                    company_id: i?.company_id,
                    purpose_of_visit: item.purpose_of_visit ? item?.purpose_of_visit : "",
                    log_id: item?.id,
                    contact_person_name: item?.contact_person_name ? item?.contact_person_name : "",
                    visiting_company_name: item?.company_name,
                    visiting_company_id: item?.company_id ? item?.company_id : "",
                    site_name: item?.site_name,
                    in_time: item?.in_time,
                    out_time: item?.out_time,
                    status: item?.status,
                    session_start_time: item?.in_time,
                    session_end_time: item?.out_time,
                    log_id: item?.id,
                    pre_register_id: 0,
                    qr_code: i?.qr_code ? i?.qr_code : "",
                    type1: item?.type1 ? item?.type1 : "CHECK_IN",
                    session_start_date: item?.in_time ? item?.in_time : ""
                }
                data1.push(obj);
            })
        }
    }).catch((err) => {
        console.log(err);
        logger.info(err)
        return res.status(401).json({
            success: false,
            message: `Internal Server Error + ${err}`
        })
    })

    await Visitor.find({ $and: [{ "pre_register.company_name": req.query.visiting_company_name }, { "pre_register.status": "UPCOMING" }, { "pre_register.user_id": req.query.user_id }], raw: true }).then(async (data) => {
        for (let i of data) {
            let data3 = i?.pre_register?.filter((s) => s.company_name == req.query.visiting_company_name && s.status == "UPCOMING" && s.user_id == req.query.user_id);
            i.logs = [];
            data3.forEach((item) => {
                let obj = {
                    _id: i?._id,
                    image: i?.image,
                    name: i?.name,
                    phone: i?.phone,
                    company_name: i?.company_name,
                    company_id: i?.company_id,
                    purpose_of_visit: item?.purpose_of_visit ? item?.purpose_of_visit : "",
                    pre_register_id: item?.id,
                    contact_person_name: item?.contact_person_name ? item?.contact_person_name : "",
                    visiting_company_name: item?.company_name,
                    visiting_company_id: item?.company_id ? item?.company_id : "",
                    session_start_date: item?.session_start_date ? item?.session_start_date : "",
                    session_start_time: item?.session_start_time ? item?.session_start_time : "",
                    session_end_time: item?.session_end_time ? item?.session_end_time : "",
                    status: item?.status,
                    log_id: 0,
                    type1: "PRE_REGISTER",
                    qr_code: item?.qr_code ? item?.qr_code : ""
                }
                data2.push(obj);
            })
        }
    }).catch((err) => {
        console.log(err);
        logger.info(err)
        return res.status(401).json({
            success: false,
            message: `Internal Server Error + ${err}`
        })
    })

    let data = [...data1, ...data2]

    data.sort((a, b) => {
        const dateA = new Date(a.session_start_date);
        const dateB = new Date(b.session_start_date);

        return dateA - dateB;
    });

    const today = new Date();
    const filteredData = data.filter(record => {
        const sessionStartDate = new Date(record.session_start_date);
        return sessionStartDate >= today || sessionStartDate.toDateString() === today.toDateString();
    });
    return res.status(200).json({
        success: true,
        data: filteredData,
        message: "Successfully Sent Details"
    })
})

export const getActive = async (req, res, next) => {
    let data1 = []
    await Visitor.find({ $and: [{ "logs.company_name": req.query.visiting_company_name }, { "logs.status": "ACTIVE" }, { "status": { $ne: "CHECKEDOUT" } }, { current_status: "ACTIVE" }, { "logs.user_id": req.query.user_id }], raw: true }).then(async (data) => {
        for (let i of data) {
            let data2 = i?.logs?.filter((s) => s.company_name == req.query.visiting_company_name && s.status == "ACTIVE" && s.user_id == req.query.user_id);
            i.logs = [];
            data2.forEach((item) => {
                let obj = {
                    _id: i?._id,
                    image: i?.image,
                    name: i?.name,
                    phone: i?.phone,
                    company_name: i?.company_name,
                    company_id: i?.company_id,
                    purpose_of_visit: item.purpose_of_visit ? item?.purpose_of_visit : "",
                    log_id: item?.id,
                    contact_person_name: item?.contact_person_name ? item?.contact_person_name : "",
                    visiting_company_name: item?.company_name,
                    visiting_company_id: item?.company_id ? item?.company_id : "",
                    site_name: item?.site_name,
                    in_time: item?.in_time,
                    out_time: item?.out_time,
                    status: i?.status,
                    session_start_time: item?.in_time,
                    session_end_time: item?.out_time,
                    pre_register_id: 0,
                    type1: item?.type1 ? item?.type1 : "TAB",
                    log_id: item?.id,
                    qr_code: i?.qr_code ? i?.qr_code : "",
                    session_start_date: item?.in_time ? item?.in_time : ""
                }
                data1.push(obj);
            })
        }
    }).catch((err) => {
        console.log(err);
        logger.info(err)
        return res.status(401).json({
            success: false,
            message: `Internal Server Error + ${err}`
        })
    })

    let data = [...data1]
    data.sort((a, b) => {
        const dateA = new Date(a.in_time);
        const dateB = new Date(b.out_time);

        return dateA - dateB; // Ascending order; for descending, use dateB - dateA
    });
    return res.status(200).json({
        success: true,
        data: data,
        message: "Successfully Sent Details"
    })
}

export const getDeclined = bigPromise(async (req, res) => {
    let data1 = [], data2 = [];
    await Visitor.find({ $and: [{ "logs.company_name": req.query.visiting_company_name }, { "logs.company_name": req.query.visiting_company_name }, { "logs.status": "DECLINED" }, { "logs.user_id": req.query.user_id }], raw: true }).then(async (data) => {
        for (let i of data) {
            let data2 = i?.logs?.filter((s) => s.company_name == req.query.visiting_company_name && s.status == "DECLINED" && s.user_id == req.query.user_id);
            i.logs = [];
            data2.forEach((item) => {
                let obj = {
                    _id: i?._id,
                    image: i?.image,
                    name: i?.name,
                    phone: i?.phone,
                    company_name: i?.company_name,
                    company_id: i?.company_id,
                    purpose_of_visit: item.purpose_of_visit ? item?.purpose_of_visit : "",
                    log_id: item?.id,
                    contact_person_name: item?.contact_person_name ? item?.contact_person_name : "",
                    visiting_company_name: item?.company_name,
                    visiting_company_id: item?.company_id ? item?.company_id : "",
                    site_name: item?.site_name,
                    in_time: item?.in_time,
                    out_time: item?.out_time,
                    status: item?.status,
                    pre_register_id: 0,
                    qr_code: i?.qr_code ? i?.qr_code : "",
                    session_start_time: item?.in_time,
                    session_end_time: item?.out_time,
                    log_id: item?.id,
                    type1: item?.type1 ? item?.type1 : "CHECK_IN",
                    session_start_date: item?.in_time ? item?.in_time : ""
                }
                data1.push(obj);
            })
        }
    }).catch((err) => {
        console.log(err);
        logger.info(err)
        return res.status(401).json({
            success: false,
            message: `Internal Server Error + ${err}`
        })
    })

    await Visitor.find({ $and: [{ "pre_register.company_name": req.query.visiting_company_name }, { "pre_register.status": "DECLINED" }, { "pre_register.user_id": req.query.user_id }], raw: true }).then(async (data) => {
        for (let i of data) {
            let data3 = i?.pre_register?.filter((s) => s.company_name == req.query.visiting_company_name && s.status == "DECLINED" && s.user_id == req.query.user_id);
            i.logs = [];
            data3.forEach((item) => {
                let obj = {
                    _id: i?._id,
                    image: i?.image,
                    name: i?.name,
                    phone: i?.phone,
                    company_name: i?.company_name,
                    company_id: i?.company_id,
                    purpose_of_visit: item?.purpose_of_visit ? item?.purpose_of_visit : "",
                    pre_register_id: item?.id,
                    contact_person_name: item?.contact_person_name ? item?.contact_person_name : "",
                    visiting_company_name: item?.company_name,
                    visiting_company_id: item?.company_id ? item?.company_id : "",
                    session_start_date: item?.session_start_date ? item?.session_start_date : "",
                    session_start_time: item?.session_start_time ? item?.session_start_time : "",
                    session_end_time: item?.session_end_time ? item?.session_end_time : "",
                    status: item?.status,
                    log_id: 0,
                    type1: "PRE_REGISTER",
                    qr_code: item?.qr_code ? item?.qr_code : ""
                }
                data2.push(obj);
            })
        }
    }).catch((err) => {
        console.log(err);
        logger.info(err)
        return res.status(401).json({
            success: false,
            message: `Internal Server Error + ${err}`
        })
    })

    let data = [...data1, ...data2]

    const today = new Date();

    data.sort((a, b) => {
        const dateA = new Date(a.session_start_date);
        const dateB = new Date(b.session_start_date);

        // Calculate the differences in milliseconds
        const differenceA = Math.abs(today - dateA);
        const differenceB = Math.abs(today - dateB);

        return differenceA - differenceB; // Sort by the difference in milliseconds
    });
    return res.status(200).json({
        success: true,
        data: data,
        message: "Successfully Sent Details"
    })
})
