// const fs = require("fs");
// const crypto = require("crypto");
// const AWS = require("aws-sdk");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const {
  awsAccessSecretKey,
  awsAccessKeyId,
  awsRegion,
  awsBucketName,
} = require("../config/default.config");

const s3Client = new S3Client({
  credentials: {
    secretAccessKey: awsAccessSecretKey,
    accessKeyId: awsAccessKeyId,
  },
  region: awsRegion,
});

const uploadFileToS3Bucket = async ({ fileName, buffer, mimetype }) => {
  try {
    if (fileName && buffer && mimetype) {
      const params = {
        Bucket: awsBucketName,
        Key: fileName,
        Body: buffer,
        ContentType: mimetype,
      };

      const command = new PutObjectCommand(params);
      return await s3Client.send(command);
    }
    return null;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getFileFromS3Bucket = async (fileName) => {
  try {
    const params = {
      Bucket: awsBucketName,
      Key: fileName,
    };
    const command = new GetObjectCommand(params);
    return await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
const getObjectFromS3Bucket = async (fileName) => {
  try {
    const params = {
      Bucket: awsBucketName,
      Key: fileName,
    };
    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);

    return await response.Body.transformToByteArray();
  } catch (error) {
    console.log(error);
    throw error;
  }
};
const deleteFileFromS3Bucket = async (fileName) => {
  try {
    const params = {
      Bucket: awsBucketName,
      Key: fileName,
    };
    const command = new DeleteObjectCommand(params);
    return await s3Client.send(command);
  } catch (error) {
    return error;
  }
};

module.exports = {
  uploadFileToS3Bucket,
  getFileFromS3Bucket,
  getObjectFromS3Bucket,
  deleteFileFromS3Bucket,
};
