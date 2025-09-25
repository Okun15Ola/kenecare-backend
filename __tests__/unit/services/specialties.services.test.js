/* eslint-disable no-unused-vars */
const specialtiesService = require("../../../src/services/specialties.services");
const repo = require("../../../src/repository/specialities.repository");
const Response = require("../../../src/utils/response.utils");
const awsS3Utils = require("../../../src/utils/aws-s3.utils");
const fileUploadUtils = require("../../../src/utils/file-upload.utils");
const { redisClient } = require("../../../src/config/redis.config");
const dbMapperUtils = require("../../../src/utils/db-mapper.utils");

jest.mock("../../../src/repository/specialities.repository");
jest.mock("../../../src/utils/response.utils");
jest.mock("../../../src/utils/aws-s3.utils");
jest.mock("../../../src/utils/file-upload.utils");
jest.mock("../../../src/config/redis.config");
jest.mock("../../../src/utils/caching.utils");
jest.mock("../../../src/utils/db-mapper.utils");
jest.mock("../../../src/middlewares/logger.middleware");

jest.mock("../../../src/utils/caching.utils", () => ({
  getCachedCount: jest.fn((_) => Promise.resolve(1)),
  getPaginationInfo: jest.fn(({ totalRows, limit, page }) => ({
    totalItems: totalRows,
    totalPages: Math.ceil(totalRows / limit),
    currentPage: page,
    itemsPerPage: limit,
    nextPage: page < Math.ceil(totalRows / limit) ? page + 1 : null,
    previousPage: page > 1 ? page - 1 : null,
  })),
  cacheKeyBulider: jest.fn((key) => key),
}));

describe("specialties.services", () => {
  beforeAll(() => {
    jest.spyOn(Response, "SUCCESS").mockImplementation((data) => data);
    jest.spyOn(Response, "NOT_FOUND").mockImplementation((data) => data);
    jest.spyOn(Response, "BAD_REQUEST").mockImplementation((data) => data);
    jest.spyOn(Response, "CREATED").mockImplementation((data) => data);
    jest.spyOn(Response, "NOT_MODIFIED").mockImplementation((data) => data);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getSpecialties", () => {
    it("returns cached specialties if present", async () => {
      const cached = [{ id: 1, name: "Cardiology" }];
      redisClient.get.mockResolvedValueOnce(JSON.stringify(cached));
      Response.SUCCESS.mockReturnValueOnce("success");
      const result = await specialtiesService.getSpecialties(10, 1, {
        total: 1,
      });
      expect(redisClient.get).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalled();
      expect(result).toBe("success");
    });

    it("returns specialties from repo and sets cache if not cached", async () => {
      redisClient.get.mockResolvedValueOnce(null);
      repo.getAllSpecialties.mockResolvedValueOnce([{ id: 1 }]);
      dbMapperUtils.mapSpecialityRow.mockReturnValueOnce({
        id: 1,
        name: "Cardiology",
      });
      Response.SUCCESS.mockReturnValueOnce("success");
      const result = await specialtiesService.getSpecialties(10, 1, {
        total: 1,
      });
      expect(repo.getAllSpecialties).toHaveBeenCalledWith(10, 0);
      expect(redisClient.set).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalled();
      expect(result).toBe("success");
    });

    it("returns empty array if no specialties found", async () => {
      redisClient.get.mockResolvedValueOnce(null);
      repo.getAllSpecialties.mockResolvedValueOnce([]);
      Response.SUCCESS.mockReturnValueOnce("success");
      const result = await specialtiesService.getSpecialties(10, 0, {});
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        message: "No specialties found",
        data: [],
      });
      expect(result).toBe("success");
    });
  });

  describe("getSpecialtyByName", () => {
    it("returns cached specialty if present", async () => {
      const cached = { id: 1, name: "Cardiology" };
      redisClient.get.mockResolvedValueOnce(JSON.stringify(cached));
      Response.SUCCESS.mockReturnValueOnce("success");
      const result = await specialtiesService.getSpecialtyByName("Cardiology");
      expect(Response.SUCCESS).toHaveBeenCalledWith({ data: cached });
      expect(result).toBe("success");
    });

    it("returns NOT_FOUND if specialty not found", async () => {
      redisClient.get.mockResolvedValueOnce(null);
      repo.getSpecialtyByName.mockResolvedValueOnce(null);
      Response.NOT_FOUND.mockReturnValueOnce("not_found");
      const result = await specialtiesService.getSpecialtyByName("Unknown");
      expect(Response.NOT_FOUND).toHaveBeenCalledWith({
        message: "Specialty Not Found",
      });
      expect(result).toBe("not_found");
    });

    it("returns specialty from repo and sets cache", async () => {
      redisClient.get.mockResolvedValueOnce(null);
      repo.getSpecialtyByName.mockResolvedValueOnce({ id: 1 });
      dbMapperUtils.mapSpecialityRow.mockReturnValueOnce({
        id: 1,
        name: "Cardiology",
      });
      Response.SUCCESS.mockReturnValueOnce("success");
      const result = await specialtiesService.getSpecialtyByName("Cardiology");
      expect(redisClient.set).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        data: { id: 1, name: "Cardiology" },
      });
      expect(result).toBe("success");
    });
  });

  describe("getSpecialtyById", () => {
    it("returns cached specialty if present", async () => {
      const cached = { id: 1, name: "Cardiology" };
      redisClient.get.mockResolvedValueOnce(JSON.stringify(cached));
      Response.SUCCESS.mockReturnValueOnce("success");
      const result = await specialtiesService.getSpecialtyById(1);
      expect(Response.SUCCESS).toHaveBeenCalledWith({ data: cached });
      expect(result).toBe("success");
    });

    it("returns NOT_FOUND if specialty not found", async () => {
      redisClient.get.mockResolvedValueOnce(null);
      repo.getSpecialtiyById.mockResolvedValueOnce(null);
      Response.NOT_FOUND.mockReturnValueOnce("not_found");
      const result = await specialtiesService.getSpecialtyById(999);
      expect(Response.NOT_FOUND).toHaveBeenCalledWith({
        message: "Specialty Not Found",
      });
      expect(result).toBe("not_found");
    });

    it("returns specialty from repo and sets cache", async () => {
      redisClient.get.mockResolvedValueOnce(null);
      repo.getSpecialtiyById.mockResolvedValueOnce({ id: 1 });
      dbMapperUtils.mapSpecialityRow.mockReturnValueOnce({
        id: 1,
        name: "Cardiology",
      });
      Response.SUCCESS.mockReturnValueOnce("success");
      const result = await specialtiesService.getSpecialtyById(1);
      expect(redisClient.set).toHaveBeenCalled();
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        data: { id: 1, name: "Cardiology" },
      });
      expect(result).toBe("success");
    });
  });

  describe("createSpecialty", () => {
    it("creates specialty with image and clears cache", async () => {
      fileUploadUtils.generateFileName.mockReturnValueOnce("file.png");
      awsS3Utils.uploadFileToS3Bucket.mockResolvedValueOnce();
      repo.createNewSpecialty.mockResolvedValueOnce({ insertId: 1 });
      Response.CREATED.mockReturnValueOnce("created");
      const specialty = {
        name: "Cardiology",
        description: "desc",
        image: { buffer: Buffer.from(""), mimetype: "image/png" },
        inputtedBy: 1,
      };
      const result = await specialtiesService.createSpecialty(specialty);
      expect(awsS3Utils.uploadFileToS3Bucket).toHaveBeenCalled();
      expect(redisClient.clearCacheByPattern).toHaveBeenCalledWith(
        "specialties:*",
      );
      expect(Response.CREATED).toHaveBeenCalledWith({
        message: "Specialty Created Successfully",
      });
      expect(result).toBe("created");
    });

    it("returns BAD_REQUEST if insertId is missing", async () => {
      repo.createNewSpecialty.mockResolvedValueOnce({});
      Response.BAD_REQUEST.mockReturnValueOnce("bad_request");
      const specialty = {
        name: "Cardiology",
        description: "desc",
        inputtedBy: 1,
      };
      const result = await specialtiesService.createSpecialty(specialty);
      expect(Response.BAD_REQUEST).toHaveBeenCalledWith({
        message: "Failed to create specialty",
      });
      expect(result).toBe("bad_request");
    });
  });

  describe("updateSpecialty", () => {
    it("returns NOT_FOUND if specialty does not exist", async () => {
      repo.getSpecialtiyById.mockResolvedValueOnce(null);
      Response.NOT_FOUND.mockReturnValueOnce("not_found");
      const result = await specialtiesService.updateSpecialty({
        id: 1,
        name: "Cardiology",
      });
      expect(Response.NOT_FOUND).toHaveBeenCalledWith({
        message: "Specialty Not Found",
      });
      expect(result).toBe("not_found");
    });

    it("updates specialty and deletes cache", async () => {
      repo.getSpecialtiyById.mockResolvedValueOnce({ image_url: "img.png" });
      awsS3Utils.uploadFileToS3Bucket.mockResolvedValueOnce();
      repo.updateSpecialtiyById.mockResolvedValueOnce({ affectedRows: 1 });
      Response.SUCCESS.mockReturnValueOnce("success");
      const result = await specialtiesService.updateSpecialty({
        id: 1,
        name: "Cardiology",
        image: { buffer: Buffer.from(""), mimetype: "image/png" },
        description: "desc",
      });
      expect(awsS3Utils.uploadFileToS3Bucket).toHaveBeenCalled();
      expect(redisClient.delete).toHaveBeenCalledWith("specialty:1");
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        message: "Specialty Updated Successfully",
      });
      expect(result).toBe("success");
    });

    it("returns NOT_MODIFIED if affectedRows < 1", async () => {
      repo.getSpecialtiyById.mockResolvedValueOnce({ image_url: "img.png" });
      repo.updateSpecialtiyById.mockResolvedValueOnce({ affectedRows: 0 });
      Response.NOT_MODIFIED.mockReturnValueOnce("not_modified");
      const result = await specialtiesService.updateSpecialty({
        id: 1,
        name: "Cardiology",
        description: "desc",
      });
      expect(Response.NOT_MODIFIED).toHaveBeenCalledWith({});
      expect(result).toBe("not_modified");
    });
  });

  describe("updateSpecialtyStatus", () => {
    it("returns BAD_REQUEST for invalid status", async () => {
      Response.BAD_REQUEST.mockReturnValueOnce("bad_request");
      const result = await specialtiesService.updateSpecialtyStatus({
        id: 1,
        status: 2,
      });
      expect(Response.BAD_REQUEST).toHaveBeenCalledWith({
        message: "Invalid Status Code",
      });
      expect(result).toBe("bad_request");
    });

    it("returns NOT_MODIFIED if affectedRows < 1", async () => {
      repo.updateSpecialtiyStatusById.mockResolvedValueOnce({
        affectedRows: 0,
      });
      Response.NOT_MODIFIED.mockReturnValueOnce("not_modified");
      const result = await specialtiesService.updateSpecialtyStatus({
        id: 1,
        status: 1,
      });
      expect(Response.NOT_MODIFIED).toHaveBeenCalledWith({});
      expect(result).toBe("not_modified");
    });

    it("updates status and deletes cache", async () => {
      repo.updateSpecialtiyStatusById.mockResolvedValueOnce({
        affectedRows: 1,
      });
      Response.SUCCESS.mockReturnValueOnce("success");
      const result = await specialtiesService.updateSpecialtyStatus({
        id: 1,
        status: 1,
      });
      expect(redisClient.delete).toHaveBeenCalledWith("specialty:1");
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        message: "Specialty Status Updated Successfully",
      });
      expect(result).toBe("success");
    });
  });

  describe("deleteSpecialty", () => {
    it("deletes specialty and returns success", async () => {
      repo.getSpecialtiyById.mockResolvedValueOnce({ image_url: "img.png" });
      awsS3Utils.deleteFileFromS3Bucket.mockResolvedValueOnce();
      repo.deleteSpecialtieById.mockResolvedValueOnce({ affectedRows: 1 });
      Response.SUCCESS.mockReturnValueOnce("success");
      const result = await specialtiesService.deleteSpecialty(1);
      expect(awsS3Utils.deleteFileFromS3Bucket).toHaveBeenCalledWith("img.png");
      expect(Response.SUCCESS).toHaveBeenCalledWith({
        message: "Specialty Deleted Successfully",
      });
      expect(result).toBe("success");
    });

    it("returns NOT_MODIFIED if affectedRows < 1", async () => {
      repo.getSpecialtiyById.mockResolvedValueOnce({ image_url: null });
      repo.deleteSpecialtieById.mockResolvedValueOnce({ affectedRows: 0 });
      Response.NOT_MODIFIED.mockReturnValueOnce("not_modified");
      const result = await specialtiesService.deleteSpecialty(1);
      expect(Response.NOT_MODIFIED).toHaveBeenCalledWith({});
      expect(result).toBe("not_modified");
    });
  });
});
