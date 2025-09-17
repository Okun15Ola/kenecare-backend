const daysAvailableService = require("../../../../src/services/doctors/days-available.services");
const db = require("../../../../src/repository/doctorAvailableDays.repository");
const Response = require("../../../../src/utils/response.utils");
const logger = require("../../../../src/middlewares/logger.middleware");
const { redisClient } = require("../../../../src/config/redis.config");
const {
  getDoctorByUserId,
} = require("../../../../src/repository/doctors.repository");

jest.mock("../../../../src/repository/doctorAvailableDays.repository");
jest.mock("../../../../src/utils/response.utils");
jest.mock("../../../../src/middlewares/logger.middleware");
jest.mock("../../../../src/config/redis.config", () => ({
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clearCacheByPattern: jest.fn(),
  },
}));
jest.mock("../../../../src/repository/doctors.repository");
jest.mock("../../../../src/utils/time.utils.js", () => ({
  generateDoctorTimeSlotsForAvailableDay: jest.fn(() => ({
    success: true,
  })),
}));
jest.mock(
  "../../../../src/repository/doctorAppointments.repository.js",
  () => ({
    getDoctorTodayAppointments: jest.fn(),
    getDoctorAppointmentsDateRange: jest.fn(),
  }),
);
jest.mock("../../../../src/repository/doctorTimeSlot.repository.js", () => ({
  bulkMarkDayUnavailable: jest.fn(),
  deleteSlotsForDoctor: jest.fn(),
  deleteSlotsForDay: jest.fn(),
}));

describe("days-available.services", () => {
  const userId = 1;
  const doctorId = 10;
  const fakeDoctor = { doctor_id: doctorId };
  const fakeDays = [
    {
      day: "Monday",
      dayId: 1,
      startTime: "09:00",
      endTime: "17:00",
      isAvailable: true,
    },
  ];
  const fakeDay = "Monday";

  beforeEach(() => {
    jest.clearAllMocks();
    Response.NOT_FOUND.mockImplementation((data) => ({ status: 404, ...data }));
    Response.SUCCESS.mockImplementation((data) => ({ status: 200, ...data }));
    Response.INTERNAL_SERVER_ERROR.mockImplementation((data) => ({
      status: 500,
      ...data,
    }));
    Response.NOT_MODIFIED.mockImplementation((data) => ({
      status: 304,
      ...data,
    }));
  });

  describe("getDoctorAvailableDays", () => {
    it("should return NOT_FOUND if doctor not found", async () => {
      getDoctorByUserId.mockResolvedValue({});
      const res = await daysAvailableService.getDoctorAvailableDays(userId);
      expect(res.status).toBe(404);
      expect(logger.error).toHaveBeenCalledWith(
        "Doctor not found for the given user ID",
      );
    });

    it("should return cached data if present", async () => {
      getDoctorByUserId.mockResolvedValue(fakeDoctor);
      redisClient.get.mockResolvedValue(JSON.stringify(fakeDays));
      const res = await daysAvailableService.getDoctorAvailableDays(userId);
      expect(res.status).toBe(200);
      expect(res.data).toEqual(fakeDays);
    });

    it("should return NOT_FOUND if no available days found", async () => {
      getDoctorByUserId.mockResolvedValue(fakeDoctor);
      redisClient.get.mockResolvedValue(null);
      db.getDoctorsAvailableDays.mockResolvedValue([]);
      const res = await daysAvailableService.getDoctorAvailableDays(userId);
      expect(res.status).toBe(200);
    });

    it("should fetch from db and cache result if not cached", async () => {
      getDoctorByUserId.mockResolvedValue(fakeDoctor);
      redisClient.get.mockResolvedValue(null);
      db.getDoctorsAvailableDays.mockResolvedValue(fakeDays);
      redisClient.set.mockResolvedValue();
      const res = await daysAvailableService.getDoctorAvailableDays(userId);
      expect(res.status).toBe(200);
      expect(redisClient.set).toHaveBeenCalled();
    });
  });

  describe("getDoctorSpecifyDayAvailabilty", () => {
    it("should return NOT_FOUND if doctor not found", async () => {
      getDoctorByUserId.mockResolvedValue({});
      const res = await daysAvailableService.getDoctorSpecifyDayAvailabilty(
        userId,
        fakeDay,
      );
      expect(res.status).toBe(404);
    });

    it("should return cached data if present", async () => {
      getDoctorByUserId.mockResolvedValue(fakeDoctor);
      redisClient.get.mockResolvedValue(JSON.stringify(fakeDays[0]));
      const res = await daysAvailableService.getDoctorSpecifyDayAvailabilty(
        userId,
        fakeDay,
      );
      expect(res.status).toBe(200);
      expect(res.data).toEqual(fakeDays[0]);
    });

    it("should return NOT_FOUND if no availability found", async () => {
      getDoctorByUserId.mockResolvedValue(fakeDoctor);
      redisClient.get.mockResolvedValue(null);
      db.getSpecificDayAvailability.mockResolvedValue(null);
      const res = await daysAvailableService.getDoctorSpecifyDayAvailabilty(
        userId,
        fakeDay,
      );
      expect(res.status).toBe(404);
    });

    it("should fetch from db and cache result if not cached", async () => {
      getDoctorByUserId.mockResolvedValue(fakeDoctor);
      redisClient.get.mockResolvedValue(null);
      const specificDay = {
        day: "Monday",
        dayId: 1,
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: true,
      };
      db.getSpecificDayAvailability.mockResolvedValue(specificDay);
      redisClient.set.mockResolvedValue();
      const res = await daysAvailableService.getDoctorSpecifyDayAvailabilty(
        userId,
        fakeDay,
      );
      expect(res.status).toBe(200);
      expect(redisClient.set).toHaveBeenCalled();
    });
  });

  describe("getDoctorsAvailableOnSpecifyDay", () => {
    it("should return cached data if present", async () => {
      redisClient.get.mockResolvedValue(JSON.stringify(fakeDays));
      const res =
        await daysAvailableService.getDoctorsAvailableOnSpecifyDay(fakeDay);
      expect(res.status).toBe(200);
      expect(res.data).toEqual(fakeDays);
    });

    it("should return NOT_FOUND if no doctors found", async () => {
      redisClient.get.mockResolvedValue(null);
      db.getDoctorsAvailableOnDay.mockResolvedValue([]);
      const res =
        await daysAvailableService.getDoctorsAvailableOnSpecifyDay(fakeDay);
      expect(res.status).toBe(200);
    });

    it("should fetch from db and cache result if not cached", async () => {
      redisClient.get.mockResolvedValue(null);
      db.getDoctorsAvailableOnDay.mockResolvedValue(fakeDays);
      redisClient.set.mockResolvedValue();
      const res =
        await daysAvailableService.getDoctorsAvailableOnSpecifyDay(fakeDay);
      expect(res.status).toBe(200);
      expect(redisClient.set).toHaveBeenCalled();
    });
  });

  describe("createDoctorSingleDayAvailability", () => {
    it("should return NOT_FOUND if doctor not found", async () => {
      getDoctorByUserId.mockResolvedValue({});
      const res = await daysAvailableService.createDoctorSingleDayAvailability(
        userId,
        fakeDay,
        "09:00",
        "17:00",
        true,
      );
      expect(res.status).toBe(404);
    });

    it("should return INTERNAL_SERVER_ERROR if insert fails", async () => {
      getDoctorByUserId.mockResolvedValue(fakeDoctor);
      db.insertSingleDay.mockResolvedValue({ insertId: null });
      const res = await daysAvailableService.createDoctorSingleDayAvailability(
        userId,
        fakeDay,
        "09:00",
        "17:00",
        true,
      );
      expect(res.status).toBe(500);
    });

    it("should create availability and clear cache", async () => {
      getDoctorByUserId.mockResolvedValue(fakeDoctor);
      db.insertSingleDay.mockResolvedValue({ insertId: 1 });
      redisClient.clearCacheByPattern.mockResolvedValue();
      const res = await daysAvailableService.createDoctorSingleDayAvailability(
        userId,
        fakeDay,
        "09:00",
        "17:00",
        true,
      );
      expect(res.status).toBe(200);
      expect(redisClient.clearCacheByPattern).toHaveBeenCalled();
    });
  });

  describe("createDoctorMultipleDaysAvailability", () => {
    it("should return NOT_FOUND if doctor not found", async () => {
      getDoctorByUserId.mockResolvedValue({});
      const res =
        await daysAvailableService.createDoctorMultipleDaysAvailability({
          userId,
          days: fakeDays,
        });
      expect(res.status).toBe(404);
    });

    it("should return INTERNAL_SERVER_ERROR if insert fails", async () => {
      getDoctorByUserId.mockResolvedValue(fakeDoctor);
      db.insertMultipleDays.mockResolvedValue({ insertId: null });
      const res =
        await daysAvailableService.createDoctorMultipleDaysAvailability({
          userId,
          days: fakeDays,
        });
      expect(res.status).toBe(500);
    });

    it("should create multiple days availability and clear cache", async () => {
      getDoctorByUserId.mockResolvedValue(fakeDoctor);
      db.insertMultipleDays.mockResolvedValue({ insertId: 1 });
      redisClient.clearCacheByPattern.mockResolvedValue();
      const res =
        await daysAvailableService.createDoctorMultipleDaysAvailability({
          userId,
          days: fakeDays,
        });
      expect(res.status).toBe(200);
      expect(redisClient.clearCacheByPattern).toHaveBeenCalled();
    });
  });

  describe("updateDoctorWeekendAvailability", () => {
    it("should return NOT_FOUND if doctor not found", async () => {
      getDoctorByUserId.mockResolvedValue({});
      const res = await daysAvailableService.updateDoctorWeekendAvailability(
        userId,
        "09:00",
        "17:00",
        true,
        "10:00",
        "18:00",
        false,
      );
      expect(res.status).toBe(404);
    });

    it("should return INTERNAL_SERVER_ERROR if update fails", async () => {
      getDoctorByUserId.mockResolvedValue(fakeDoctor);
      db.updateWeekendAvailability.mockResolvedValue({ insertId: null });
      const res = await daysAvailableService.updateDoctorWeekendAvailability(
        userId,
        "09:00",
        "17:00",
        true,
        "10:00",
        "18:00",
        false,
      );
      expect(res.status).toBe(500);
    });

    it("should update weekend availability and clear cache", async () => {
      getDoctorByUserId.mockResolvedValue(fakeDoctor);
      db.updateWeekendAvailability.mockResolvedValue({ insertId: 1 });
      redisClient.clearCacheByPattern.mockResolvedValue();
      const res = await daysAvailableService.updateDoctorWeekendAvailability(
        userId,
        "09:00",
        "17:00",
        true,
        "10:00",
        "18:00",
        false,
      );
      expect(res.status).toBe(200);
      expect(redisClient.clearCacheByPattern).toHaveBeenCalled();
    });
  });

  describe("updateDoctorWorkHoursAvailability", () => {
    it("should return NOT_FOUND if doctor not found", async () => {
      getDoctorByUserId.mockResolvedValue({});
      const res = await daysAvailableService.updateDoctorWorkHoursAvailability(
        userId,
        fakeDay,
        "09:00",
        "17:00",
      );
      expect(res.status).toBe(404);
    });

    it("should return NOT_MODIFIED if update fails", async () => {
      getDoctorByUserId.mockResolvedValue(fakeDoctor);
      db.updateWorkingHours.mockResolvedValue({ affectedRows: 0 });
      const res = await daysAvailableService.updateDoctorWorkHoursAvailability(
        userId,
        fakeDay,
        "09:00",
        "17:00",
      );
      expect(res.status).toBe(304);
    });

    it("should update work hours and clear cache", async () => {
      getDoctorByUserId.mockResolvedValue(fakeDoctor);
      db.updateWorkingHours.mockResolvedValue({ affectedRows: 1 });
      redisClient.clearCacheByPattern.mockResolvedValue();
      const res = await daysAvailableService.updateDoctorWorkHoursAvailability(
        userId,
        fakeDay,
        "09:00",
        "17:00",
      );
      expect(res.status).toBe(200);
      expect(redisClient.clearCacheByPattern).toHaveBeenCalled();
    });
  });

  describe("updateDoctorDayAvailability", () => {
    it("should return NOT_FOUND if doctor not found", async () => {
      getDoctorByUserId.mockResolvedValue({});
      const res = await daysAvailableService.updateDoctorDayAvailability(
        userId,
        fakeDay,
        true,
      );
      expect(res.status).toBe(404);
    });

    it("should return NOT_MODIFIED if update fails", async () => {
      getDoctorByUserId.mockResolvedValue(fakeDoctor);
      db.updateDayAvailability.mockResolvedValue({ affectedRows: 0 });
      const res = await daysAvailableService.updateDoctorDayAvailability(
        userId,
        fakeDay,
        true,
      );
      expect(res.status).toBe(304);
    });

    it("should update day availability and clear cache", async () => {
      getDoctorByUserId.mockResolvedValue(fakeDoctor);
      db.updateDayAvailability.mockResolvedValue({ affectedRows: 1 });
      redisClient.clearCacheByPattern.mockResolvedValue();
      const res = await daysAvailableService.updateDoctorDayAvailability(
        userId,
        fakeDay,
        true,
      );
      expect(res.status).toBe(200);
      expect(redisClient.clearCacheByPattern).toHaveBeenCalled();
    });
  });

  describe("updateDoctorMultipleWorkHoursAvailability", () => {
    it("should return NOT_FOUND if doctor not found", async () => {
      getDoctorByUserId.mockResolvedValue({});
      const res =
        await daysAvailableService.updateDoctorMultipleWorkHoursAvailability(
          userId,
          "09:00",
          "17:00",
        );
      expect(res.status).toBe(404);
    });

    it("should return NOT_MODIFIED if update fails", async () => {
      getDoctorByUserId.mockResolvedValue(fakeDoctor);
      db.updateBulkWeekdayHours.mockResolvedValue({ affectedRows: 0 });
      const res =
        await daysAvailableService.updateDoctorMultipleWorkHoursAvailability(
          userId,
          "09:00",
          "17:00",
        );
      expect(res.status).toBe(304);
    });

    it("should update multiple work hours and clear cache", async () => {
      getDoctorByUserId.mockResolvedValue(fakeDoctor);
      db.updateBulkWeekdayHours.mockResolvedValue({ affectedRows: 1 });
      redisClient.clearCacheByPattern.mockResolvedValue();
      const res =
        await daysAvailableService.updateDoctorMultipleWorkHoursAvailability(
          userId,
          "09:00",
          "17:00",
        );
      expect(res.status).toBe(200);
      expect(redisClient.clearCacheByPattern).toHaveBeenCalled();
    });
  });

  describe("deleteDoctorSpecificDayAvailability", () => {
    it("should return NOT_FOUND if doctor not found", async () => {
      getDoctorByUserId.mockResolvedValue({});
      const res =
        await daysAvailableService.deleteDoctorSpecificDayAvailability(
          userId,
          fakeDay,
        );
      expect(res.status).toBe(404);
    });

    it("should return NOT_MODIFIED if delete fails", async () => {
      getDoctorByUserId.mockResolvedValue(fakeDoctor);
      db.deleteSpecificDay.mockResolvedValue({ affectedRows: 0 });
      const res =
        await daysAvailableService.deleteDoctorSpecificDayAvailability(
          userId,
          fakeDay,
        );
      expect(res.status).toBe(304);
    });

    it("should delete specific day and clear cache", async () => {
      getDoctorByUserId.mockResolvedValue(fakeDoctor);
      db.deleteSpecificDay.mockResolvedValue({ affectedRows: 1 });
      redisClient.clearCacheByPattern.mockResolvedValue();
      const res =
        await daysAvailableService.deleteDoctorSpecificDayAvailability(
          userId,
          fakeDay,
        );
      expect(res.status).toBe(200);
      expect(redisClient.clearCacheByPattern).toHaveBeenCalled();
    });
  });

  describe("deleteDoctorAllDaysAvailability", () => {
    it("should return NOT_FOUND if doctor not found", async () => {
      getDoctorByUserId.mockResolvedValue({});
      const res =
        await daysAvailableService.deleteDoctorAllDaysAvailability(userId);
      expect(res.status).toBe(404);
    });

    it("should return NOT_MODIFIED if delete fails", async () => {
      getDoctorByUserId.mockResolvedValue(fakeDoctor);
      db.deleteAllDoctorAvailability.mockResolvedValue({ affectedRows: 0 });
      const res =
        await daysAvailableService.deleteDoctorAllDaysAvailability(userId);
      expect(res.status).toBe(304);
    });

    it("should delete all days and clear cache", async () => {
      getDoctorByUserId.mockResolvedValue(fakeDoctor);
      db.deleteAllDoctorAvailability.mockResolvedValue({ affectedRows: 1 });
      redisClient.clearCacheByPattern.mockResolvedValue();
      const res =
        await daysAvailableService.deleteDoctorAllDaysAvailability(userId);
      expect(res.status).toBe(200);
      expect(redisClient.clearCacheByPattern).toHaveBeenCalled();
    });
  });
});
