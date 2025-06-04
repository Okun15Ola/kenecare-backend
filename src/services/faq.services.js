const repo = require("../repository/faqs.repository");
const Response = require("../utils/response.utils");

exports.getSpecialties = async () => {
  const rawData = await repo.getAllSpecialization();

  const specializations = rawData.map(
    ({
      specialization_id: specializationId,
      specialization_name: specializationName,
      description,
      image_url: imageUrl,
      is_active: isActive,
      inputted_by: inputtedBy,
    }) => ({
      specializationId,
      specializationName,
      description,
      imageUrl,
      isActive,
      inputtedBy,
    }),
  );
  return Response.SUCCESS({ data: specializations });
};

exports.getSpecialtyByName = async (name) => {
  try {
    const rawData = await repo.getSpecializationByName(name);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Specialization Not Found" });
    }
    const {
      specialization_id: specializationId,
      specialization_name: specializationName,
      description,
      image_url: imageUrl,
      is_active: isActive,
      inputted_by: inputtedBy,
    } = rawData;

    const specialization = {
      specializationId,
      specializationName,
      description,
      imageUrl,
      isActive,
      inputtedBy,
    };
    return Response.SUCCESS({ data: specialization });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getSpecialtyById = async (id) => {
  try {
    const rawData = await repo.getSpecializationById(id);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Specialization Not Found" });
    }
    const {
      specialization_id: specializationId,
      specialization_name: specializationName,
      description,
      image_url: imageUrl,
      is_active: isActive,
      inputted_by: inputtedBy,
    } = rawData;

    const specialization = {
      specializationId,
      specializationName,
      description,
      imageUrl,
      isActive,
      inputtedBy,
    };
    return Response.SUCCESS({ data: specialization });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.createSpecialty = async ({ name, description, imageUrl }) => {
  try {
    const rawData = await repo.getSpecializationByName(name);
    if (rawData) {
      return Response.BAD_REQUEST({
        message: "Specialization Name already exists",
      });
    }
    // create new object
    const specialization = {
      name,
      description,
      imageUrl,
      inputtedBy: 1,
    };

    // save to database
    await repo.createNewSpecialization(specialization);

    return Response.CREATED({ message: "Specialization Created Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.updateSpecialty = async ({ specializationId, specialization }) => {
  try {
    const rawData = await repo.getSpecializationById(specializationId);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Specialization Not Found" });
    }
    await repo.updateSpecializationById({
      id: specializationId,
      specialization,
    });

    return Response.SUCCESS({ message: "Specialization Updated Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.updateSpecialtyStatus = async ({ specializationId, status }) => {
  try {
    const rawData = await repo.getSpecializationById(specializationId);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Specialization Not Found" });
    }

    if (!Number.isInteger(status) || status < 0 || status > 1) {
      return Response.BAD_REQUEST({ message: "Invalid Status Code" });
    }

    await repo.updateSpecializationStatusById({
      specializationId,
      status,
    });

    return Response.SUCCESS({
      message: "Specialization Status Updated Successfully",
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.deleteSpecialty = async (specializationId) => {
  try {
    const rawData = await repo.getSpecializationById(specializationId);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Specialization Not Found" });
    }

    await repo.deleteSpecializationById(specializationId);

    return Response.SUCCESS({ message: "Specialization Deleted Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
