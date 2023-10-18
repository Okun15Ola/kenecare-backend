const dbObject = require("../db/db.doctors");

exports.getAllDoctors = async () => {
  try {
    const rawData = await dbObject.getAllDoctors();
    console.log(rawData);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
