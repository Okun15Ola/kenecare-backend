const fs = require("fs");
const crypto = require("crypto");
const AWS = require("aws-sdk");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const {
  awsAccessSecretKey,
  awsAccessKeyId,
  awsRegion,
  awsBucketName,
} = require("../config/default.config");



const S3 = new S3Client({
  credentials: {
    secretAccessKey: awsAccessSecretKey,
    accessKeyId: awsAccessKeyId,
  },
  region: awsRegion,
});

const uploadFileToS3Bucket = async (file) => {
  if (file) {
    const params = {
      Bucket: awsBucketName,
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimitype,
    };

    const command = new PutObjectCommand(params);
    return await S3.send(command);
  }
};

module.exports = {
  uploadFileToS3Bucket,
};
