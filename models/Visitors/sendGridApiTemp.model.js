import mongoose from "mongoose";

const sendGridSchema = new mongoose.Schema({
    template_id: {
        type: String
    },
    name: {
        type: String
    },
    is_selected: {
        type: Boolean
    },
    image: {
        type: String
    }
})

const sendGridMailTemplate = mongoose.model("sendGridMailTemplate", sendGridSchema);
export default sendGridMailTemplate;