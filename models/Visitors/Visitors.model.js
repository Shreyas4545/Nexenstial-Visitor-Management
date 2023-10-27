import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    email: {
        type: String
    },
    company_name: {
        type: String,
        required: true
    },
    company_id: {
        type: String,
    },
    purpose_of_visit: {
        type: String
    },
    visiting_company_name: {
        type: String
    },
    contact_person_name: {
        type: String
    },
    contact_person_email: {
        type: String
    },
    image: {
        type: String
    },
    status: {
        type: String,
        enum: ["PENDING", "APPROVED", "DECLINED", "CHECKEDOUT"]
    },
    current_status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE"]
    },
    qr_code: {
        type: String,
    },
    user_id: {
        type: String,
    },
    news_letter_confirmation: {
        type: Boolean
    },
    active_pre_register_id: {
        type: Number,
    },
    active_log_id: {
        type: Number
    },
    pre_register: [{
        id: Number,
        company_id: String,
        company_name: String,
        qr_code: String,
        contact_person_name: String,
        contact_person_email: String,
        purpose_of_visit: String,
        session_start_date: Date,
        session_start_time: String,
        user_id: String,
        session_end_time: String,
        qr_expiry: Boolean,
        status: String,
        type1: String,
        _id: false
    }],
    logs: [{
        id: Number,
        company_id: String,
        user_id: String,
        company_name: String,
        contact_person_name: String,
        contact_person_email: String,
        purpose_of_visit: String,
        site_name: String,
        in_time: Date,
        out_time: Date,
        status: String,
        type1: String,
        _id: false
    }]
})

const Visitor = mongoose.model("Visitor", visitorSchema);
export default Visitor;