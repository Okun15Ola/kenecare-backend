const dbObject = require("../../db/db.specializations");
const Response = require("../../utils/response.utils");
const redisClient = require("../../config/redis.config");

/**
 * Retrieve a list of specializations from the database and transform the data.
 *
 * @async
 * @function getSpecializations
 * @returns {Promise<Array>} An array of objects, each representing a specialization.
 * @throws {Error} If there's an issue retrieving the data from the database.
 *
 * @example
 * const specializations = await getSpecializations();
 * // Returns an array of specialization objects.
 */
exports.getSpecializations = async () => {
  const cacheKey = "specializations:all";
  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    return Response.SUCCESS({ data: JSON.parse(cachedData) });
  }
  const rawData = await dbObject.getAllSpecialization();

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
  await redisClient.set({
    key: cacheKey,
    value: JSON.stringify(specializations),
  });
  return Response.SUCCESS({ data: specializations });
};

/**
 * Retrieve a specialization by its unique name from the database and transform the data.
 *
 * @async
 * @function getSpecializationByName
 * @param {string} name - The unique name of the specialization to retrieve.
 * @returns {Promise<object>} An object representing the specialization with the provided Name.
 * @throws {Error} If there's an issue retrieving the data from the database.
 *
 * @example
 * const specialization = await getSpecializationByName("dermatologist");
 * // Returns an object representing the specialization with Name "dermatologist".
 */
exports.getSpecializationByName = async (name) => {
  try {
    const cacheKey = `specializations:${name}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await dbObject.getSpecializationByName(name);

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
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(specialization),
    });
    return Response.SUCCESS({ data: specialization });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Retrieve a specialization by its unique identifier from the database and transform the data.
 *
 * @async
 * @function getSpecializationById
 * @param {number} id - The unique identifier of the specialization to retrieve.
 * @returns {Promise<object>} An object representing the specialization with the provided ID.
 * @throws {Error} If there's an issue retrieving the data from the database.
 *
 * @example
 * const specialization = await getSpecializationById(123);
 * // Returns an object representing the specialization with ID 123.
 */
exports.getSpecializationById = async (id) => {
  try {
    const cacheKey = `specializations:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return Response.SUCCESS({ data: JSON.parse(cachedData) });
    }
    const rawData = await dbObject.getSpecializationById(id);

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
    await redisClient.set({
      key: cacheKey,
      value: JSON.stringify(specialization),
    });
    return Response.SUCCESS({ data: specialization });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Create a new specialization in the database.
 *
 * @async
 * @function createSpecialization
 * @param {Object} specializationData - The data for the new specialization.
 * @param {string} specializationData.name - The name of the specialization.
 * @param {string} [specializationData.description=""] - Optional description for the specialization.
 * @param {string} specializationData.image_url - The URL of the image associated with the specialization.
 * @returns {Promise<void>} A promise that resolves when the specialization is successfully created.
 * @throws {Error} If there's an issue with the database operation.
 *
 * @example
 * const specializationData = {
 *   name: "Cardiology",
 *   description: "Dealing with heart-related issues",
 *   image_url: "https://example.com/cardiology.jpg"
 * };
 *
 * try {
 *   await createSpecialization(specializationData);
 * } catch (error) {
 *   console.error("Error creating specialization:", error);
 * }
 */
exports.createSpecialization = async ({ name, description, imageUrl }) => {
  try {
    const rawData = await dbObject.getSpecializationByName(name);
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
    await dbObject.createNewSpecialization(specialization);

    return Response.CREATED({ message: "Specialization Created Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.updateSpecialization = async ({ specializationId, specialization }) => {
  try {
    const rawData = await dbObject.getSpecializationById(specializationId);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Specialization Not Found" });
    }
    await dbObject.updateSpecializationById({
      id: specializationId,
      specialization,
    });

    return Response.SUCCESS({ message: "Specialization Updated Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.updateSpecializationStatus = async ({ specializationId, status }) => {
  try {
    const rawData = await dbObject.getSpecializationById(specializationId);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Specialization Not Found" });
    }

    if (!Number.isInteger(status) || status < 0 || status > 1) {
      return Response.BAD_REQUEST({ message: "Invalid Status Code" });
    }

    await dbObject.updateSpecializationStatusById({
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

exports.deleteSpecialization = async (specializationId) => {
  try {
    const rawData = await dbObject.getSpecializationById(specializationId);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Specialization Not Found" });
    }

    await dbObject.deleteSpecializationById(specializationId);

    return Response.SUCCESS({ message: "Specialization Deleted Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
