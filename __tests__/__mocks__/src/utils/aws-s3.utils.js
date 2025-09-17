module.exports = {
  uploadFileToS3Bucket: jest.fn(),
  getFileUrlFromS3Bucket: jest
    .fn()
    .mockResolvedValue("https://dummy-url.com/user-profile/pic.jpg"),
  getObjectFromS3Bucket: jest.fn(),
  deleteFileFromS3Bucket: jest.fn(),
};
