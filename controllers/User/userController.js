// Import Model
import User from "../../models/User/User.model.js"

// Making Promise
import bigPromise from "../../middlewares/bigPromise.js"

export const createUser = bigPromise(async (req, res, next) => {
})

export const getUser = bigPromise(async (req, res, next) => {

    const { id } = req.params;
    const obj = {}
    if (id) {
        obj.accessId = id;
    }

    if (req.query.company_name) {
        obj.organisationName = req.query.company_name;
    }

    await User.find(obj).then((data) => {
        return res.status(200).json({
            success: true,
            data: data,
            message: "Successfully Sent Details"
        })
    }).catch((err) => {
        console.log(err);
        return res.status(401).json({
            success: false,
            message: "Internal Server Error"
        })
    })

})

export const getAllUsers = bigPromise(async (req, res, next) => {

    let data = await User.aggregate([
        {
            $lookup: {
                from: "memberships",
                localField: "accessId",
                foreignField: "uniqueIdentifier",
                as: "info"
            }
        },
        {
            $match: {
                $and: [{
                    $or: [{
                        "info.status": "ACTIVE",
                    },
                    {
                        "info.status": "RENEW"
                    }],
                },
                { "info.isDeleted": false },
                { "isDeleted": false },
                { "isDeactivated": false }
                ]
            }
        }
    ]);

    return res.status(200).json({
        success: true,
        data: data,
        message: "Successfully Sent Details"
    })

})

export const getAllCompanies = bigPromise(async (req, res, next) => {

    let data = await User.aggregate([
        {
            $lookup: {
                from: "memberships",
                localField: "accessId",
                foreignField: "uniqueIdentifier",
                as: "info"
            }
        },
        {
            $match: {
                $and: [
                    {
                        $or: [
                            { "info.status": "ACTIVE" },
                            { "info.status": "RENEW" }
                        ]
                    },
                    { "info.isDeleted": false }
                ]
            }
        }
    ])

    let data1 = [];
    let obj = {};
    let cnt = 0;
    await data?.forEach((ele) => {
        if (!obj[ele?.accessId]) {
            obj[ele?.accessId] = ele?.organisationName
            cnt++;
        }
    })
    console.log(cnt);
    data1.push(obj);
    return res.status(200).json({
        success: true,
        data: data1,
        message: "Successfully Sent Details"
    })
})