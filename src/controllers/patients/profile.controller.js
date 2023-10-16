const Response = require("../utils/response.utils");
const logger = require("../middlewares/logger.middleware");

exports.GetProfileByUserIdController = async (req, res, next) => {
  try {
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
};
// exports.GetTestimonialByIDController = async (req, res, next) => {
//   try {
//   } catch (error) {
//     console.error(error);
//     logger.error(error);
//     next(error);
//   }
// };
// exports.CreateTestimonialController = async (req, res, next) => {
//   try {
//   } catch (error) {
//     console.error(error);
//     logger.error(error);
//     next(error);
//   }
// };
// exports.UpdateTestimonialByIdController = async (req, res, next) => {
//   try {
//   } catch (error) {
//     console.error(error);
//     logger.error(error);
//     next(error);
//   }
// };
// exports.UpdateTestimonialStatusController = async (req, res, next) => {
//   try {
//   } catch (error) {
//     console.error(error);
//     logger.error(error);
//     next(error);
//   }
// };
// exports.DeleteTestimonialByIdController = async (req, res, next) => {
//   try {
//   } catch (error) {
//     console.error(error);
//     logger.error(error);
//     next(error);
//   }
// };
