const daysAvailableController = require("../../../../src/controllers/doctors/daysAvailable.controller");
const service = require("../../../../src/services/doctors/days-available.services");
const logger = require("../../../../src/middlewares/logger.middleware");

jest.mock("../../../../src/services/doctors/days-available.services");
jest.mock("../../../../src/middlewares/logger.middleware");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe("daysAvailable.controller", () => {
  const userId = 123;
  const reqUser = { user: { id: userId.toString() } };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GetDoctorAvailableDaysController", () => {
    it("should return available days with correct status", async () => {
      const req = { ...reqUser };
      const res = mockRes();
      const response = { statusCode: 200, data: ["Monday"] };
      service.getDoctorAvailableDays.mockResolvedValue(response);

      await daysAvailableController.GetDoctorAvailableDaysController(
        req,
        res,
        mockNext,
      );

      expect(service.getDoctorAvailableDays).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should call next with error on failure", async () => {
      const req = { ...reqUser };
      const res = mockRes();
      const error = new Error("fail");
      service.getDoctorAvailableDays.mockRejectedValue(error);

      await daysAvailableController.GetDoctorAvailableDaysController(
        req,
        res,
        mockNext,
      );

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("GetDoctorSpecificDayAvailabilityController", () => {
    it("should return specific day availability", async () => {
      const req = { ...reqUser, params: { day: "Monday" } };
      const res = mockRes();
      const response = { statusCode: 200, data: { day: "Monday" } };
      service.getDoctorSpecifyDayAvailabilty.mockResolvedValue(response);

      await daysAvailableController.GetDoctorSpecificDayAvailabilityController(
        req,
        res,
        mockNext,
      );

      expect(service.getDoctorSpecifyDayAvailabilty).toHaveBeenCalledWith(
        userId,
        "Monday",
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });
  });

  describe("GetDoctorsAvailableOnSpecificDayController", () => {
    it("should return doctors available on a specific day", async () => {
      const req = { params: { day: "Tuesday" } };
      const res = mockRes();
      const response = { statusCode: 200, data: [{ id: 1 }] };
      service.getDoctorsAvailableOnSpecifyDay.mockResolvedValue(response);

      await daysAvailableController.GetDoctorsAvailableOnSpecificDayController(
        req,
        res,
        mockNext,
      );

      expect(service.getDoctorsAvailableOnSpecifyDay).toHaveBeenCalledWith(
        "Tuesday",
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });
  });

  describe("CreateDoctorAvailableDaysController", () => {
    it("should create multiple days availability", async () => {
      const req = { ...reqUser, body: { days: ["Monday", "Tuesday"] } };
      const res = mockRes();
      const response = { statusCode: 201, data: {} };
      service.createDoctorMultipleDaysAvailability.mockResolvedValue(response);

      await daysAvailableController.CreateDoctorAvailableDaysController(
        req,
        res,
        mockNext,
      );

      expect(service.createDoctorMultipleDaysAvailability).toHaveBeenCalledWith(
        {
          userId,
          days: ["Monday", "Tuesday"],
        },
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(response);
    });
  });

  describe("CreateDoctorSingleDayAvailabilityController", () => {
    it("should create single day availability", async () => {
      const req = {
        ...reqUser,
        body: {
          day: "Wednesday",
          startTime: "09:00",
          endTime: "17:00",
          isAvailable: true,
        },
      };
      const res = mockRes();
      const response = { statusCode: 201, data: {} };
      service.createDoctorSingleDayAvailability.mockResolvedValue(response);

      await daysAvailableController.CreateDoctorSingleDayAvailabilityController(
        req,
        res,
        mockNext,
      );

      expect(service.createDoctorSingleDayAvailability).toHaveBeenCalledWith(
        userId,
        "Wednesday",
        "09:00",
        "17:00",
        true,
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(response);
    });
  });

  describe("UpdateDoctorWeekendAvailabilityController", () => {
    it("should update weekend availability", async () => {
      const req = {
        ...reqUser,
        body: {
          saturdayStartTime: "10:00",
          saturdayEndTime: "14:00",
          isAvailableOnSaturday: true,
          sundayStartTime: "11:00",
          sundayEndTime: "15:00",
          isAvailableOnSunday: false,
        },
      };
      const res = mockRes();
      const response = { statusCode: 200, data: {} };
      service.updateDoctorWeekendAvailability.mockResolvedValue(response);

      await daysAvailableController.UpdateDoctorWeekendAvailabilityController(
        req,
        res,
        mockNext,
      );

      expect(service.updateDoctorWeekendAvailability).toHaveBeenCalledWith(
        userId,
        "10:00",
        "14:00",
        true,
        "11:00",
        "15:00",
        false,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });
  });

  describe("UpdateDoctorWorkHoursController", () => {
    it("should update work hours for a day", async () => {
      const req = {
        ...reqUser,
        body: { day: "Thursday", startTime: "08:00", endTime: "16:00" },
      };
      const res = mockRes();
      const response = { statusCode: 200, data: {} };
      service.updateDoctorWorkHoursAvailability.mockResolvedValue(response);

      await daysAvailableController.UpdateDoctorWorkHoursController(
        req,
        res,
        mockNext,
      );

      expect(service.updateDoctorWorkHoursAvailability).toHaveBeenCalledWith(
        userId,
        "Thursday",
        "08:00",
        "16:00",
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });
  });

  describe("UpdateDoctorMultipleWorkHoursController", () => {
    it("should update multiple work hours", async () => {
      const req = {
        ...reqUser,
        body: { startTime: "07:00", endTime: "15:00" },
      };
      const res = mockRes();
      const response = { statusCode: 200, data: {} };
      service.updateDoctorMultipleWorkHoursAvailability.mockResolvedValue(
        response,
      );

      await daysAvailableController.UpdateDoctorMultipleWorkHoursController(
        req,
        res,
        mockNext,
      );

      expect(
        service.updateDoctorMultipleWorkHoursAvailability,
      ).toHaveBeenCalledWith(userId, "07:00", "15:00");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });
  });

  describe("UpdateDoctorDayAvailabilityController", () => {
    it("should update day availability", async () => {
      const req = {
        ...reqUser,
        body: { day: "Friday", isAvailable: false },
      };
      const res = mockRes();
      const response = { statusCode: 200, data: {} };
      service.updateDoctorDayAvailability.mockResolvedValue(response);

      await daysAvailableController.UpdateDoctorDayAvailabilityController(
        req,
        res,
        mockNext,
      );

      expect(service.updateDoctorDayAvailability).toHaveBeenCalledWith(
        userId,
        "Friday",
        false,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });
  });

  describe("DeleteDoctorSingleDayAvailabilityController", () => {
    it("should delete single day availability", async () => {
      const req = { ...reqUser, params: { day: "Saturday" } };
      const res = mockRes();
      const response = { statusCode: 200, data: {} };
      service.deleteDoctorSpecificDayAvailability.mockResolvedValue(response);

      await daysAvailableController.DeleteDoctorSingleDayAvailabilityController(
        req,
        res,
        mockNext,
      );

      expect(service.deleteDoctorSpecificDayAvailability).toHaveBeenCalledWith(
        userId,
        "Saturday",
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });
  });

  describe("DeleteDoctorAllDaysAvailabilityController", () => {
    it("should delete all days availability", async () => {
      const req = { ...reqUser };
      const res = mockRes();
      const response = { statusCode: 200, data: {} };
      service.deleteDoctorAllDaysAvailability.mockResolvedValue(response);

      await daysAvailableController.DeleteDoctorAllDaysAvailabilityController(
        req,
        res,
        mockNext,
      );

      expect(service.deleteDoctorAllDaysAvailability).toHaveBeenCalledWith(
        userId,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });
  });
});
