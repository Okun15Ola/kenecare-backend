const router = require("express").Router();
const { body, check, checkSchema } = require("express-validator");
const { Validate } = require("../../../validations/validate");
const {
  GetCommonSymptomsController,
  GetCommonSymptomByIDController,
  CreateCommonSymptomController,
  UpdateCommonSymptomByIdController,
  UpdateCommonSymptomStatusController,
  DeleteCommonSymptomByIdController,
} = require("../../../controllers/admin/common-symptoms.controller");

const {
  localMediaUploader: mediaUploaded,
  localMediaUploader,
} = require("../../../utils/file-upload.utils");
const {
  CreateSymptomValidation,
} = require("../../../validations/symptoms.validations");

router.get("/", GetCommonSymptomsController);

router.get("/:id", GetCommonSymptomByIDController);

/**
 * @swagger
 * /api/v1/auth/authenticate:
 *    get:
 *      tags:
 *        - Auth
 *      produces:
 *        - application/json
 *      description: Authenticate
 *      responses:
 *        200:
 *          description: Success
 */
router.get("/authenticate", (req, res, next) => {
  try {
    console.log("Authenticated");
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
});

/**
 * @swagger
 *  /api/v1/admin/common-symptoms:
 *    post:
 *       tags:
 *          - Common Symptoms
 *       produces:
 *          - application/json
 *       requestBody:
 *          required: true
 *          description: Common Symptoms
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  name:
 *                    type: string
 *                    required: true
 *                  description:
 *                    type: string
 *                    required: true
 *                  specialtyId:
 *                    type: number
 *                    required: true
 *                  image:
 *                    type: file
 *                    required: true
 *                  consultationFee:
 *                    type: number
 *                    required: true
 *                  tags:
 *                    type: string
 *                    required: false
 *       responses:
 *          201:
 *            description: Common Symptom Created Successfully
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    status:
 *                      type: string
 *                      example: success
 *                    statusCode:
 *                       type: number
 *                       example: 201
 *                    timestamp:
 *                        type: string
 *                        example: 2023-11-09T11:02:14.952Z
 *                    message:
 *                        type: string
 *                        example: Common Symptom Created Successfully
 *          400:
 *            description: Bad Request
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    status:
 *                      type: string
 *                    statusCode:
 *                       type: number
 *                    timestamp:
 *                        type: string
 *                    message:
 *                        type: string
 *                    errors:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                              msg:
 *                                type: string
 *                                example: Name is required
 *          500:
 *            description: Internal Server Error
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    status:
 *                      type: string
 *                      example: error
 *                    statusCode:
 *                       type: number
 *                       example: 500
 *                    timestamp:
 *                        type: string
 *                    message:
 *                        type: string
 *                    error:
 *                        type: string
 *                        example: Internal Server Error
 */
router.post(
  "/",
  mediaUploaded.single("image"),
  CreateSymptomValidation,
  Validate,
  CreateCommonSymptomController
);

router.put("/:id", UpdateCommonSymptomByIdController);

router.patch("/:id/", UpdateCommonSymptomStatusController);

router.delete("/:id", DeleteCommonSymptomByIdController);

module.exports = router;
