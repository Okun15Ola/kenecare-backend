const logger = require("../../../../src/middlewares/logger.middleware");
const service = require("../../../../src/services/patients/appointment-followup.services");
const followUpController = require("../../../../src/controllers/patients/follow-up.controller");

jest.mock("../../../../src/services/patients/appointment-followup.services");
jest.mock("../../../../src/middlewares/logger.middleware");

describe("follow-up controller", () => {
  let res;
  let req;
  let next;
  let error;
  let response;

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    req = {
      params: { id: 1 },
      user: { id: 1 },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      sendStatus: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    error = new Error("error");
    response = { statusCode: 200, data: {} };
    jest.clearAllMocks();
  });

  describe("getPatientAppointmentFollowUpController", () => {
    it("should fetch patient appointment followups and return 200", async () => {
      service.getPatientAppointmentFollowupService.mockResolvedValue(response);
      await followUpController.getPatientAppointmentFollowUpController(
        req,
        res,
        next,
      );
      expect(service.getPatientAppointmentFollowupService).toHaveBeenCalledWith(
        {
          appointmentId: 1,
        },
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should call next on error", async () => {
      service.getPatientAppointmentFollowupService.mockRejectedValue(error);
      await followUpController.getPatientAppointmentFollowUpController(
        req,
        res,
        next,
      );
      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
