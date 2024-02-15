const dbObject = require("../db/db.specialities");
const Response = require("../utils/response.utils");
const { STATUS } = require("../utils/enum.utils");
const fs = require("fs");
const path = require("path");
const he = require("he");
const { deleteFile } = require("../utils/file-upload.utils");
const { appBaseURL } = require("../config/default.config");

exports.getSpecialties = async () => {
  const rawData = await dbObject.getAllSpecialties();

  const specialties = rawData.map(
    ({
      speciality_id: specialtyId,
      speciality_name: specialtyName,
      speciality_description: description,
      tags,
      image_url: imageUrl,
      is_active: isActive,
      inputted_by: inputtedBy,
    }) => {
      return {
        specialtyId,
        specialtyName: he.decode(specialtyName),
        description: he.decode(description),
        tags,
        imageUrl: imageUrl ? `${appBaseURL}/images/${imageUrl}` : "",
        isActive,
        inputtedBy,
      };
    }
  );
  return Response.SUCCESS({ data: specialties });
};

exports.getSpecialtyByName = async (name) => {
  try {
    const rawData = await dbObject.getSpecialtyByName(name);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Specialty Not Found" });
    }
    const {
      speciality_id: specialtyId,
      speciality_name: specialtyName,
      speciality_description: description,
      image_url: imageUrl,
      tags,
      is_active: isActive,
      inputted_by: inputtedBy,
    } = rawData;

    const specialty = {
      specialtyId,
      specialtyName: he.decode(specialtyName),
      description: he.decode(description),
      tags,
      imageUrl: imageUrl ? `${appBaseURL}/images/${imageUrl}` : "",
      isActive,
      inputtedBy,
    };
    return Response.SUCCESS({ data: specialty });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getSpecialtyById = async (id) => {
  try {
    const rawData = await dbObject.getSpecialtiyById(id);

    if (!rawData) {
      return Response.NOT_FOUND({ message: "Specialty Not Found" });
    }
    const {
      speciality_id: specialtyId,
      speciality_name: specialtyName,
      speciality_description: description,
      image_url: imageUrl,
      is_active: isActive,
      inputted_by: inputtedBy,
    } = rawData;

    const specialty = {
      specialtyId,
      specialtyName: he.decode(specialtyName),
      description: he.decode(description),
      imageUrl: imageUrl ? `${appBaseURL}/images/${imageUrl}` : "",
      isActive,
      inputtedBy,
    };
    return Response.SUCCESS({ data: specialty });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.createSpecialty = async ({ name, description, image, inputtedBy }) => {
  try {
    //save to database
    await dbObject.createNewSpecialty({
      name,
      description,
      image,
      inputtedBy,
    });

    return Response.CREATED({ message: "Specialty Created Successfully" });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.updateSpecialty = async ({ id, name, image, description }) => {
  try {
    const rawData = await dbObject.getSpecialtiyById(id);
    if (rawData) {
      console.log(rawData);
      const { image_url } = rawData;

      if (image_url) {
        const file = path.join(__dirname, "../public/upload/media/", image_url);
        await deleteFile(file);
      }
      await dbObject.updateSpecialtiyById({
        id,
        name,
        image,
        description,
      });

      return Response.SUCCESS({ message: "Specialty Updated Successfully" });
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
exports.updateSpecialtyStatus = async ({ id, status }) => {
  try {
    if (!Number.isInteger(status) || status < 0 || status > 1) {
      return Response.BAD_REQUEST({ message: "Invalid Status Code" });
    }

    await dbObject.updateSpecialtiyStatusById({
      id,
      status,
    });

    return Response.SUCCESS({
      message: "Specialty Status Updated Successfully",
    });
  } catch (error) {
    console.error("Error updating specialty status: ", error);
    throw error;
  }
};

exports.deleteSpecialty = async (id) => {
  try {
    const { image_url } = await dbObject.getSpecialtiyById(id);
    if (image_url) {
      const file = path.join(__dirname, "../public/upload/media/", image_url);
      fs.unlinkSync(file);
    }

    await dbObject.deleteSpecialtieById(id);

    return Response.SUCCESS({ message: "Specialty Deleted Successfully" });
  } catch (error) {
    console.error("Error deleting specialty: ", error);
    throw error;
  }
};
