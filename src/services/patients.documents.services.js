const dbObject = require("../db/db.appointments.patients");
const { getPatientByUserId } = require("../db/db.patients");
const Response = require("../utils/response.utils");
const { awsBucketName } = require("../config/default.config");
const { uploadFileToS3Bucket } = require("../utils/aws-s3.utils");
const { generateFileName } = require("../utils/file-upload.utils");

exports.getMedicalDocuments = async (userId) => {
  try {
    const rawData = await dbObject.getAllAppointments();
    console.log(rawData);

    return {};

    return Response.SUCCESS({ data: appointments });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getMedicalDocument = async ({ userId, documentId }) => {
  try {
    const rawData = await dbObject.getAppointmentById(id);

    //TODO Check if the requesting user is the owner of the appointment
    if (!rawData) {
      return Response.NOT_FOUND({ message: "Appointment Not Found" });
    }

    return Response.SUCCESS({ data: appointment });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.createMedicalDocument = async ({ userId, file }) => {
  try {
    const { patient_id: patientId } = await getPatientByUserId(userId);
    const uuid = "uuid";

    if (file) {
      const newFileName = generateFileName(file);
      file.originalname = newFileName;

      await uploadFileToS3Bucket(file);

      return Response.CREATED({
        message: "Medical Document Saved Successfully",
      });
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.updateBlog = async ({ id, blog }) => {
  try {
    const result = await isBlogExist(id);

    if (!result) {
      return Response.NOT_FOUND({ message: "Blog Not Found" });
    }
    await dbObject.updateBlogById({ id, blog });
    return Response.SUCCESS({ message: "Blog Updated Succcessfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.updateBlogStatus = async ({ id, status }) => {
  try {
    const result = await isBlogExist(id);
    if (!result) {
      return Response.NOT_FOUND({ message: "Blog Not Found" });
    }
    await dbObject.updateBlogStatusById({ id, status });
    return Response.SUCCESS({ message: "Blog Status Updated Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.updateBlogFeaturedStatus = async ({ id, status }) => {
  try {
    const result = await isBlogExist(id);
    if (!result) {
      return Response.NOT_FOUND({ message: "Blog Not Found" });
    }
    await dbObject.updateBlogFeaturedById({ id, status });
    return Response.SUCCESS({
      message: "Blog Featured Status Updated Successfully",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.deleteBlog = async (id) => {
  try {
    const result = await isBlogExist(id);
    if (!result) {
      return Response.NOT_FOUND({ message: "Blog Not Found" });
    }
    await dbObject.deleteBlogById(id);
    return Response.SUCCESS({ message: "Blog Deleted Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const isBlogExist = async (id) => {
  const rawData = await dbObject.getBlogById(id);
  return !!rawData;
};
