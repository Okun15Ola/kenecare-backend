const router = require("express").Router();
const logger = require("../../middlewares/logger.middleware");
const rateLimit = require("../../utils/rate-limit.utils");
const { Validate } = require("../../validations/validate");
const {
  LoginController,
  RegisterController,
  VerifyRegisterOTPController,
  RequestLoginOTPController,
  VerifyLoginOTPController,
  ForgotPasswordController,
  ResendVerificationOTPController,
  SendVerificationOTPController,
  VerifyRequestedOTPController,
} = require("../../controllers/auth.controller");
const {
  LoginValidations,
  RegisterValidations,
  OTPLoginValidation,
  VerifyTokenValidations,
} = require("../../validations/auth.validations");
const { requireUserAuth } = require("../../middlewares/auth.middleware");
const { body } = require("express-validator");
const { getUserByMobileNumber } = require("../../db/db.users");

// rateLimit(router);
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
router.get("/authenticate", requireUserAuth, (req, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    logger.error(error);
    next(error);
  }
});

/**
 * @swagger
 *  /api/v1/auth/login:
 *    post:
 *       tags:
 *          - Auth
 *       produces:
 *          - application/json
 *       requestBody:
 *          required: true
 *          description: User's login credentials
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  mobileNumber:
 *                    type: string
 *                    required: true
 *                  password:
 *                    type: string
 *                    required: true
 *       responses:
 *          200:
 *            description: Successful Login
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
 *                       example: 200
 *                    timestamp:
 *                        type: string
 *                        example: 2023-11-09T11:02:14.952Z
 *                    message:
 *                        type: string
 *                        example: Login Successful
 *                    data:
 *                        type: string
 *                        example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTY5OTUyNzczNCwiZXhwIjoxNjk5NjE0MTM0LCJhdWQiOiJrZW5lY2FyZS5jb20iLCJpc3MiOiJhdXRoLmtlbmVjYXJlLmNvbSJ9.MKmB5oYu-XtCmYHqn2tyZGjH3vwVxjEfRCycE83nmRI
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
 *                                example: Mobile number or passoword is incorrect
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
router.post("/login", LoginValidations, Validate, LoginController);

/**
 * @swagger
 *  /api/v1/auth/login/otp:
 *    post:
 *       tags:
 *          - Auth
 *       produces:
 *          - application/json
 *       requestBody:
 *          required: true
 *          description: User wants to Login with OTP instead of password
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  mobileNumber:
 *                    type: string
 *                    required: true
 *                    example: +23278121212
 *
 *       responses:
 *          200:
 *            description: Registration Successful
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
 *                       example: 200
 *                    timestamp:
 *                        type: string
 *                        example: 2023-11-09T11:02:14.952Z
 *                    message:
 *                        type: string
 *                        example: Login OTP Sent successfully
 *                    data:
 *                        type: null
 *
 *          400:
 *            description: Bad Request
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
 *                       example: 400
 *                    timestamp:
 *                        type: string
 *                        example: 2023-11-09T11:02:14.952Z
 *                    message:
 *                        type: string
 *                        example: Validation Error
 *                    errors:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                              msg:
 *                                type: string
 *                                example: Mobile number does not exist
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
 *                        example: 2023-11-09T11:02:14.952Z
 *                    message:
 *                        type: string
 *                        example: Internal Server Error
 *                    error:
 *                        type: null
 *
 */
router.post(
  "/login/otp",
  OTPLoginValidation,
  Validate,
  RequestLoginOTPController
);

/**
 * @swagger
 *  /api/v1/auth/login/{token}:
 *    post:
 *       tags:
 *          - Auth
 *       produces:
 *          - application/json
 *       requestBody:
 *          required: true
 *          description: This route is used to verify the login OTP that was sent to the user
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  mobileNumber:
 *                    type: string
 *                    required: true
 *                    example: +23278121212
 *                  password:
 *                    type: string
 *                    required: true
 *                    example: $trongPa$$w0rd
 *                  confirmPassword:
 *                    type: string
 *                    required: true
 *                    example: $trongPa$$w0rd
 *                  userType:
 *                    type: string
 *                    required: true
 *                    example: patient | doctor
 *
 *       responses:
 *          200:
 *            description: Registration Successful
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
 *                       example: 200
 *                    timestamp:
 *                        type: string
 *                        example: 2023-11-09T11:02:14.952Z
 *                    message:
 *                        type: string
 *                        example: Registration Successful
 *                    data:
 *                        type: string
 *                        example:
 *          400:
 *            description: Bad Request
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
 *                       example: 400
 *                    timestamp:
 *                        type: string
 *                        example: 2023-11-09T11:02:14.952Z
 *                    message:
 *                        type: string
 *                        example: Validation Error
 *                    errors:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                              msg:
 *                                type: string
 *                                example: Mobile number already exist
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
  "/login/:token",
  VerifyTokenValidations,
  Validate,
  VerifyLoginOTPController
);

/**
 * @swagger
 *  /api/v1/auth/register:
 *    post:
 *       tags:
 *          - Auth
 *       produces:
 *          - application/json
 *       requestBody:
 *          required: true
 *          description: User registration data
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  mobileNumber:
 *                    type: string
 *                    required: true
 *                    example: +23278121212
 *                  password:
 *                    type: string
 *                    required: true
 *                    example: $trongPa$$w0rd
 *                  confirmPassword:
 *                    type: string
 *                    required: true
 *                    example: $trongPa$$w0rd
 *                  userType:
 *                    type: string
 *                    required: true
 *                    example: patient | doctor
 *
 *       responses:
 *          200:
 *            description: Registration Successful
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
 *                       example: 200
 *                    timestamp:
 *                        type: string
 *                        example: 2023-11-09T11:02:14.952Z
 *                    message:
 *                        type: string
 *                        example: Registration Successful
 *                    data:
 *                        type: string
 *                        example:
 *          400:
 *            description: Bad Request
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
 *                       example: 400
 *                    timestamp:
 *                        type: string
 *                        example: 2023-11-09T11:02:14.952Z
 *                    message:
 *                        type: string
 *                        example: Validation Error
 *                    errors:
 *                        type: array
 *                        items:
 *                          type: object
 *                          properties:
 *                              msg:
 *                                type: string
 *                                example: Mobile number already exist
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
router.post("/register", RegisterValidations, Validate, RegisterController);


router.put(
  "/verify/:token",
  VerifyTokenValidations,
  Validate,
  VerifyRegisterOTPController
);


router.post("/forgot-password", ForgotPasswordController);

router.post(
  "/otp-resend",
  [
    body("phoneNumber")
      .notEmpty()
      .withMessage("Phone Number is required")
      .trim()
      .escape()
      .custom(async (value, { req }) => {
        const data = await getUserByMobileNumber(value);

        if (!data) {
          throw new Error(
            "BAD_REQUEST. Error Resending OTP. Please check mobile number"
          );
        }

        req.user = data;
        return true;
      }),
  ],
  Validate,
  ResendVerificationOTPController
);
router.post("/otp-request", requireUserAuth, SendVerificationOTPController);
router.post("/otp-request", requireUserAuth, VerifyRequestedOTPController);

module.exports = router;
