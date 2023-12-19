const dbObject = require("../db/db.common-symptoms");
const Response = require("../utils/response.utils");
exports.getCommonSymptoms = async () => {
  try {
    const rawData = await dbObject.getAllCommonSymptoms();

    const symptoms = rawData.map(
      ({
        symptom_id: symptomId,
        symptom_name: name,
        symptom_description: description,
        specialty_id: specialty,
        image_url: imageUrl,
        general_consultation_fee: consultationFee,
        tags,
        is_active: isActive,
        inputted_by: inputtedBy,
      }) => {
        return {
          symptomId,
          name,
          description,
          specialty,
          imageUrl,
          consultationFee,
          tags,
          isActive,
          inputtedBy,
        };
      }
    );

    return Response.SUCCESS({ data: symptoms });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getCommonSymptom = async (id) => {
  try {
    const rawData = await dbObject.getCommonSymptomById(id);
    if (!rawData) {
      return Response.NOT_FOUND({ message: "Common Symptom Not Found" });
    }
    const {
      symptom_id: symptomId,
      symptom_name: name,
      symptom_description: description,
      specialty_id: specialty,
      image_url: imageUrl,
      general_consultation_fee: consultationFee,
      tags,
      is_active: isActive,
      inputted_by: inputtedBy,
    } = rawData;

    const symptom = {
      symptomId,
      name,
      description,
      specialty,
      imageUrl,
      consultationFee,
      tags,
      isActive,
      inputtedBy,
    };

    return Response.SUCCESS({ data: symptom });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.createCommonSymptom = async ({
  name,
  description,
  specialtyId,
  image,
  consultationFee,
  tags,
  inputtedBy,
}) => {
  try {
    await dbObject.createNewCommonSymptom({
      name,
      description,
      specialtyId,
      image,
      consultationFee,
      tags,
      inputtedBy,
    });

    return Response.CREATED({ message: "Common Symptom Created Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.updateCommonSymptom = async ({
  id,
  name,
  description,
  specialtyId,
  image,
  consultationFee,
  tags,
  inputtedBy,
}) => {
  try {
    const rawData = await dbObject.getCommonSymptomById(id);
    if (!rawData) {
      return Response.NOT_FOUND({ message: "Common Symptom Not Found" });
    }
    await dbObject.updateCommonSymptomById({ id, symptom });
    return Response.SUCCESS({ message: "Blog Updated Succcessfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.updateCommonSymptomStatus = async ({ id, status }) => {
  try {
    const rawData = await dbObject.getBlogById(id);
    if (!rawData) {
      return Response.NOT_FOUND({ message: "Bog Not Found" });
    }
    await dbObject.updateBlogStatusById({ id, status });
    return Response.SUCCESS({ message: "Blog Status Updated Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.deleteCommonSymptom = async (id) => {
  try {
    const result = await isSymptomExists(id);
    if (!result) {
      return Response.NOT_FOUND({ message: "Common Symptom Not Found" });
    }

    await dbObject.deleteCommonSymptomById(id);
    return Response.SUCCESS({ message: "Common Symptom Deleted Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const isSymptomExists = async (id) => {
  const rawData = await dbObject.getCommonSymptomById(id);
  return !!rawData;
};
