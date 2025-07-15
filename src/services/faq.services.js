const repo = require("../repository/faqs.repository");
const Response = require("../utils/response.utils");
const { mapSpecializationRow } = require("../utils/db-mapper.utils");
const logger = require("../middlewares/logger.middleware");

exports.getSpecialties = async () => {
  try {
    const rawData = await repo.getAllSpecialization();

    if (!rawData?.length) {
      logger.warn("Specializations Not Found");
      return Response.NOT_FOUND({ message: "Specializations Not Found" });
    }

    const specializations = rawData.map(mapSpecializationRow);
    return Response.SUCCESS({ data: specializations });
  } catch (error) {
    logger.error("getSpecialties: ", error);
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
    logger.error("getSpecialtyByName: ", error);
    throw error;
  }
};

exports.getSpecialtyById = async (id) => {
  try {
    const rawData = await repo.getSpecializationById(id);

    if (!rawData) {
      logger.warn(`Specialization Not Found for ID ${id}`);
      return Response.NOT_FOUND({ message: "Specialization Not Found" });
    }
    return Response.SUCCESS({ data: mapSpecializationRow(rawData) });
  } catch (error) {
    logger.error("getSpecialtyById: ", error);
    throw error;
  }
};

exports.createSpecialty = async ({ name, description, imageUrl }) => {
  try {
    const rawData = await repo.getSpecializationByName(name);
    if (rawData) {
      logger.warn(`Specialization Name already exists: ${name}`);
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
    const { insertId } = await repo.createNewSpecialization(specialization);

    if (!insertId) {
      logger.warn("Failed to create specialization");
      return Response.BAD_REQUEST({
        message: "Failed to create specialization",
      });
    }

    return Response.CREATED({ message: "Specialization Created Successfully" });
  } catch (error) {
    logger.error("createSpecialty: ", error);
    throw error;
  }
};

exports.updateSpecialty = async ({ specializationId, specialization }) => {
  try {
    const rawData = await repo.getSpecializationById(specializationId);

    if (!rawData) {
      logger.warn(`Specialization Not Found for ID ${specializationId}`);
      return Response.NOT_FOUND({ message: "Specialization Not Found" });
    }

    const { affectedRows } = await repo.updateSpecializationById({
      id: specializationId,
      specialization,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.warn(`Failed to update Specialization for ID ${specializationId}`);
      return Response.NOT_MODIFIED({});
    }

    return Response.SUCCESS({ message: "Specialization Updated Successfully" });
  } catch (error) {
    logger.error("updateSpecialty: ", error);
    throw error;
  }
};
exports.updateSpecialtyStatus = async ({ specializationId, status }) => {
  try {
    const rawData = await repo.getSpecializationById(specializationId);

    if (!rawData) {
      logger.warn(`Specialization Not Found for ID ${specializationId}`);
      return Response.NOT_FOUND({ message: "Specialization Not Found" });
    }

    if (!Number.isInteger(status) || status < 0 || status > 1) {
      logger.warn(`Invalid Status Code: ${status}`);
      return Response.BAD_REQUEST({ message: "Invalid Status Code" });
    }

    const { affectedRows } = await repo.updateSpecializationStatusById({
      specializationId,
      status,
    });

    if (!affectedRows || affectedRows < 1) {
      logger.warn(
        `Failed to update Specialization Status for ID ${specializationId}`,
      );
      return Response.NOT_MODIFIED({});
    }

    return Response.SUCCESS({
      message: "Specialization Status Updated Successfully",
    });
  } catch (error) {
    logger.error("updateSpecialtyStatus: ", error);
    throw error;
  }
};

exports.deleteSpecialty = async (specializationId) => {
  try {
    const rawData = await repo.getSpecializationById(specializationId);

    if (!rawData) {
      logger.warn(`Specialization Not Found for ID ${specializationId}`);
      return Response.NOT_FOUND({ message: "Specialization Not Found" });
    }

    const { affectedRows } =
      await repo.deleteSpecializationById(specializationId);

    if (!affectedRows || affectedRows < 1) {
      logger.warn(`Failed to delete Specialization for ID ${specializationId}`);
      return Response.NOT_MODIFIED({});
    }

    return Response.SUCCESS({ message: "Specialization Deleted Successfully" });
  } catch (error) {
    logger.error("deleteSpecialty: ", error);
    throw error;
  }
};
