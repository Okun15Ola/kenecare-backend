const daysAvailableService = require("../../../../src/services/doctors/days-available.services");
const dbObject = require("../../../../src/repository/doctors.repository");
const Response = require("../../../../src/utils/response.utils");

jest.mock("../../../../src/repository/doctors.repository");
jest.mock("../../../../src/utils/response.utils");

describe("days-availabale.services", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getDoctorAvailableDays", () => {
    it("should return NOT_FOUND if doctor profile does not exist", async () => {
      dbObject.getDoctorByUserId.mockResolvedValue(null);
      Response.NOT_FOUND.mockReturnValue({
        status: 404,
        message: "Doctor's Available Days Not Found",
      });

      const result =
        await daysAvailableService.getDoctorAvailableDays("doctor-id");

      expect(dbObject.getDoctorByUserId).toHaveBeenCalledWith("doctor-id");
      expect(Response.NOT_FOUND).toHaveBeenCalledWith({
        message: "Doctor's Available Days Not Found",
      });
      expect(result).toEqual({
        status: 404,
        message: "Doctor's Available Days Not Found",
      });
    });

    it("should return SUCCESS if doctor profile exists", async () => {
      dbObject.getDoctorByUserId.mockResolvedValue({ id: "doctor-id" });
      Response.SUCCESS.mockReturnValue({ status: 200 });

      const result =
        await daysAvailableService.getDoctorAvailableDays("doctor-id");

      expect(dbObject.getDoctorByUserId).toHaveBeenCalledWith("doctor-id");
      expect(Response.SUCCESS).toHaveBeenCalled();
      expect(result).toEqual({ status: 200 });
    });

    it("should throw error if db call fails", async () => {
      const error = new Error("DB Error");
      dbObject.getDoctorByUserId.mockRejectedValue(error);

      await expect(
        daysAvailableService.getDoctorAvailableDays("doctor-id"),
      ).rejects.toThrow("DB Error");
    });
  });

  describe("createDoctorAvailableDays", () => {
    it("should return SUCCESS", async () => {
      Response.SUCCESS.mockReturnValue({ status: 200 });

      const result = await daysAvailableService.createDoctorAvailableDays();

      expect(Response.SUCCESS).toHaveBeenCalled();
      expect(result).toEqual({ status: 200 });
    });

    it("should throw error if something fails", async () => {
      Response.SUCCESS.mockImplementation(() => {
        throw new Error("Some error");
      });

      await expect(
        daysAvailableService.createDoctorAvailableDays(),
      ).rejects.toThrow("Some error");
    });
  });

  describe("updateDoctorAvailableDays", () => {
    it("should return SUCCESS", async () => {
      Response.SUCCESS.mockReturnValue({ status: 200 });

      const result = await daysAvailableService.updateDoctorAvailableDays();

      expect(Response.SUCCESS).toHaveBeenCalled();
      expect(result).toEqual({ status: 200 });
    });

    it("should throw error if something fails", async () => {
      Response.SUCCESS.mockImplementation(() => {
        throw new Error("Update error");
      });

      await expect(
        daysAvailableService.updateDoctorAvailableDays(),
      ).rejects.toThrow("Update error");
    });
  });

  describe("getDoctorTimeSlots", () => {
    it("should return SUCCESS", async () => {
      Response.SUCCESS.mockReturnValue({ status: 200 });

      const result = await daysAvailableService.getDoctorTimeSlots();

      expect(Response.SUCCESS).toHaveBeenCalled();
      expect(result).toEqual({ status: 200 });
    });

    it("should throw error if something fails", async () => {
      Response.SUCCESS.mockImplementation(() => {
        throw new Error("Time slot error");
      });

      await expect(daysAvailableService.getDoctorTimeSlots()).rejects.toThrow(
        "Time slot error",
      );
    });
  });
});
