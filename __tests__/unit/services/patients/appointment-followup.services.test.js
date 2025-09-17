const followUpRepo = require("../../../../src/repository/follow-up.repository");
const Response = require("../../../../src/utils/response.utils");
const { redisClient } = require("../../../../src/config/redis.config");
const service = require("../../../../src/services/patients/appointment-followup.services");

jest.mock("../../../../src/repository/follow-up.repository");
jest.mock("../../../../src/utils/response.utils");
jest.mock("../../../../src/config/redis.config");
jest.mock("../../../../src/utils/db-mapper.utils");
jest.mock("../../../../src/middlewares/logger.middleware");

describe("Appointment-followup.services ", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getPatientAppointmentFollowupService", () => {
    it("should fetch all appointment follow ups and return SUCCESS", async () => {
      const id = 1;
      redisClient.get.mockResolvedValue();
      followUpRepo.getAppointmentFollowUps.mockResolvedValue();
      Response.SUCCESS.mockReturnValue({ status: 200 });

      await service.getPatientAppointmentFollowupService({ appointmentId: id });

      expect(redisClient.get).toHaveBeenCalled();
      expect(followUpRepo.getAppointmentFollowUps).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalled();
    });
  });
});
