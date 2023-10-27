import { generateUrl, uploadFile, getFile } from "../../utils/s3.js";

const allowedKeyTypes = {
    IMAGE: {
        bucket: process.env.AWS_BUCKET,
        keyPrefix: "2gethrImageCapture",
    },
}

export const create = async (req, res) => {
    console.log(req.body);
    if (
        !Object.keys(allowedKeyTypes).includes(req.body.referenceType) ||
        !req.body.referenceId ||
        !req.body.fileExtension ||
        !req.body.fileType
    ) {
        return res.status(400).json({ message: "Bad Request" });
    }

    const bucket = allowedKeyTypes[req.body.referenceType].bucket;
    const key = `${allowedKeyTypes[req.body.referenceType].keyPrefix}/${req.body.referenceId
        }/${req.body.fileName}_${Date.now()}.${req.body.fileExtension}`;

    const url = generateUrl(bucket, key, "UPLOAD", req.body.fileType);

    return res.status(201).json({ url });
};

export const uploadFileToS3 = (type, fileName, fileBuffer) => {
    if (!allowedKeyTypes[type]) {
        return null;
    }

    const bucket = allowedKeyTypes[type].bucket;
    const key = `${allowedKeyTypes[type].keyPrefix}/${fileName}`;

    return uploadFile(bucket, key, fileBuffer);
};

// Upload file to s3

export const createFile = async (req, res) => {
    console.log(req.body);

    if (
        !Object.keys(allowedKeyTypes).includes(req.body.referenceType) ||
        !req.body.referenceId ||
        !req.body.file
    ) {
        return res.status(400).json({ message: "Bad Request" });
    }

    // if (!req.user.id) {
    //     return res.status(401).json({ message: "Unauthorised" });
    // }

    const bucket = allowedKeyTypes[req.body.referenceType].bucket;

    const uploadFileToS3 = (type, fileName, fileBuffer) => {
        if (!allowedKeyTypes[type]) {
            return null;
        }

        const bucket = allowedKeyTypes[type].bucket;
        const key = `${allowedKeyTypes[type].keyPrefix}/${fileName}`;

        return uploadFile(bucket, key, fileBuffer);
    };

    return uploadFileToS3(
        req.body.referenceType,
        req.body.referenceId,
        req.body.file
    )
        .then((data) => {
            return res.status(200).json({
                message: "file uploaded successfully",
                data,
            });
        })
        .catch((err) => {
            console.log(`error uploading file :: ${err}`);
            return res.status(500).json({
                message: "Internal server error",
            });
        });
};

export const getFile1 = async (req, res) => {
    if (
        !Object.keys(allowedKeyTypes).includes(req.body.referenceType) ||
        !req.body.referenceId
    ) {
        return res.status(400).json({ message: "Bad Request" });
    }

    const getFileFromS3 = (type, key) => {
        if (!allowedKeyTypes[type]) {
            return null;
        }

        return getFile(allowedKeyTypes[type].bucket, key);
    };

    return getFileFromS3(req.body.referenceType, req.body.referenceId)
        .then((data) => {
            return res.status(200).json({
                data,
            });
        })
        .catch((err) => {
            console.log(`Error getting file :: ${err}`);
            return res.status(500).json({
                message: "Internal server error",
            });
        });
};

export const getUrl = (type, key, permission) => {
    return generateUrl(allowedKeyTypes[type].bucket, key, permission);
};

export const getFileFromS3 = (type, key) => {
    if (!allowedKeyTypes[type]) {
        return null;
    }

    return getFile(allowedKeyTypes[type].bucket, key);
};