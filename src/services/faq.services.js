const repo = require("../repository/faqs.repository");
const Response = require("../utils/response.utils");
const { mapSpecializationRow } = require("../utils/db-mapper.utils");

exports.getSpecialties = async () => {
  try {
    const rawData = await repo.getAllSpecialization(); // TODO: revisit this to use pagination
    const specializations = rawData.map(mapSpecializationRow);
    return Response.SUCCESS({ data: specializations });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getSpecialtyByName = async (name) => {
  try {
    const rawData = await repo.getSpecializationByName(name);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Specialization Not Found" });
    }
    return Response.SUCCESS({ data: mapSpecializationRow(rawData) });
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
    return Response.SUCCESS({ data: mapSpecializationRow(rawData) });
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
