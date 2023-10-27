// const nodemailer = require("nodemailer"); // Require the Nodemailer package
import AWS from "aws-sdk"

const configure = {
    accessKeyId: process.env.AWS_MAIL_ID,
    secretAccessKey: process.env.AWS_MAIL_KEY,
    apiVersion: "2010-12-01",
    region: "ap-south-1",
};

export const sendMail = async (to, subject, html) => {

    const params = {
        Destination: {
            ToAddresses: [to],
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: html,
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: subject,
            },
        },
        Source: "tech@2gethr.co.in",
    };

    var sendPromise = new AWS.SES(configure).sendEmail(params).promise();

    // Handle promise's fulfilled/rejected states
    return sendPromise
        .then(function (data) {
            return true;
        })
        .catch(function (err) {
            console.error(err, err.stack);
            return false;
        });
};

export const apiKey = process.env.SEND_GRID_API_KEY;
export const url = 'https://api.sendgrid.com/v3/mail/send';
