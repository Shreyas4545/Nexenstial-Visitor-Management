import AWS from "aws-sdk"
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ap-south-1',
    signatureVersion: 'v4'
});

const s3 = new AWS.S3();

const permissionType = {
    UPLOAD: 'putObject',
    VIEW: 'getObject',
}

export const generateUrl = (bucket, key, permission, fileType) => {

    const url = s3.getSignedUrl(permissionType[permission], {
        Bucket: bucket,
        Key: key,
        Expires: 60 * 5, // 5 mins
        ContentType: fileType,
        // ContentEncoding: '7bit',
    });

    return url;
}

export const uploadFile = async (bucket, key, fileBuffer) => {
    return s3.putObject({
        Bucket: bucket,
        Key: key,
        Body: fileBuffer,
    }).promise().then(() => {
        return key;
    }).catch(err => {
        console.error(`Error Uploading File To S3 :: ${bucket} :: ${key} :: ${err}`);
        return null;
    });
}

export const getFile = async (bucket, key) => {
    return s3.getObject({
        Bucket: bucket,
        Key: key,
    }).promise().then(data => {
        return data.Body;
    }).catch(err => {
        console.error(`Error Getting File From S3 :: ${bucket} :: ${key} :: ${err}`);
        return null;
    });
}