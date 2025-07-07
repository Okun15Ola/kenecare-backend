jest.mock("../../../../src/services/specialties.services");
jest.mock("../../../../src/middlewares/logger.middleware");

const specialtiesServices = require("../../../../src/services/specialties.services");
const logger = require("../../../../src/middlewares/logger.middleware");

const {
  GetSpecialtiesController,
  GetSpecialtyByIDController,
  CreateSpecialtyController,
  UpdateSpecialtyByIdController,
  UpdateSpecialtyStatusController,
  DeleteSpecialtyByIdController,
} = require("../../../../src/controllers/admin/specialties.controller");

describe("Specialties Controllers", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {}, user: {}, file: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("GetSpecialtiesController", () => {
    it("should return specialties with correct status", async () => {
      const req = {
        query: {},
        pagination: { limit: 10, offset: 0 },
        paginationInfo: jest.fn(),
      };
      specialtiesServices.getSpecialties.mockResolvedValue({
        statusCode: 200,
        data: [],
      });
      await GetSpecialtiesController(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ statusCode: 200, data: [] });
    });

    it("should handle errors", async () => {
      const error = new Error("fail");
      const req = {
        query: {},
        pagination: { limit: 10, offset: 0 },
        paginationInfo: jest.fn(),
      };
      specialtiesServices.getSpecialties.mockRejectedValue(error);
      await GetSpecialtiesController(req, res, next);
      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetSpecialtyByIDController", () => {
    it("should return specialty by id", async () => {
      req.params.id = "1";
      specialtiesServices.getSpecialtyById.mockResolvedValue({
        statusCode: 200,
        data: { id: 1 },
      });
      await GetSpecialtyByIDController(req, res, next);
      expect(specialtiesServices.getSpecialtyById).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 200,
        data: { id: 1 },
      });
    });

    it("should handle errors", async () => {
      req.params.id = "1";
      const error = new Error("fail");
      specialtiesServices.getSpecialtyById.mockRejectedValue(error);
      await GetSpecialtyByIDController(req, res, next);
      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("CreateSpecialtyController", () => {
    it("should create a specialty", async () => {
      req.user.id = "2";
      req.file.filename = "img.png";
      req.body = { name: "Cardiology", description: "desc" };
      specialtiesServices.createSpecialty.mockResolvedValue({
        statusCode: 201,
        data: { id: 1 },
      });
      await CreateSpecialtyController(req, res, next);
      expect(specialtiesServices.createSpecialty).toHaveBeenCalledWith({
        name: "Cardiology",
        description: "desc",
        image: "img.png",
        inputtedBy: 2,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 201,
        data: { id: 1 },
      });
    });

    it("should handle missing file", async () => {
      req.user.id = "2";
      req.file = {};
      req.body = { name: "Cardiology", description: "desc" };
      specialtiesServices.createSpecialty.mockResolvedValue({
        statusCode: 201,
        data: { id: 1 },
      });
      await CreateSpecialtyController(req, res, next);
      expect(specialtiesServices.createSpecialty).toHaveBeenCalledWith({
        name: "Cardiology",
        description: "desc",
        image: null,
        inputtedBy: 2,
      });
    });

    it("should handle errors", async () => {
      req.user.id = "2";
      req.file.filename = "img.png";
      req.body = { name: "Cardiology", description: "desc" };
      const error = new Error("fail");
      specialtiesServices.createSpecialty.mockRejectedValue(error);
      await CreateSpecialtyController(req, res, next);
      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdateSpecialtyByIdController", () => {
    it("should update a specialty", async () => {
      req.file.filename = "img2.png";
      req.params.id = "3";
      req.body = { name: "Neuro", description: "desc2" };
      specialtiesServices.updateSpecialty.mockResolvedValue({
        statusCode: 200,
        data: { id: 3 },
      });
      await UpdateSpecialtyByIdController(req, res, next);
      expect(specialtiesServices.updateSpecialty).toHaveBeenCalledWith({
        id: 3,
        name: "Neuro",
        image: "img2.png",
        description: "desc2",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 200,
        data: { id: 3 },
      });
    });

    it("should handle missing file", async () => {
      req.file = {};
      req.params.id = "3";
      req.body = { name: "Neuro", description: "desc2" };
      specialtiesServices.updateSpecialty.mockResolvedValue({
        statusCode: 200,
        data: { id: 3 },
      });
      await UpdateSpecialtyByIdController(req, res, next);
      expect(specialtiesServices.updateSpecialty).toHaveBeenCalledWith({
        id: 3,
        name: "Neuro",
        image: null,
        description: "desc2",
      });
    });

    it("should handle errors", async () => {
      req.file.filename = "img2.png";
      req.params.id = "3";
      req.body = { name: "Neuro", description: "desc2" };
      const error = new Error("fail");
      specialtiesServices.updateSpecialty.mockRejectedValue(error);
      await UpdateSpecialtyByIdController(req, res, next);
      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdateSpecialtyStatusController", () => {
    it("should update specialty status", async () => {
      req.params.id = "4";
      req.query.status = "1";
      specialtiesServices.updateSpecialtyStatus.mockResolvedValue({
        statusCode: 200,
        data: { id: 4, status: 1 },
      });
      await UpdateSpecialtyStatusController(req, res, next);
      expect(specialtiesServices.updateSpecialtyStatus).toHaveBeenCalledWith({
        id: 4,
        status: 1,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 200,
        data: { id: 4, status: 1 },
      });
    });

    it("should handle errors", async () => {
      req.params.id = "4";
      req.query.status = "1";
      const error = new Error("fail");
      specialtiesServices.updateSpecialtyStatus.mockRejectedValue(error);
      await UpdateSpecialtyStatusController(req, res, next);
      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("DeleteSpecialtyByIdController", () => {
    it("should delete a specialty", async () => {
      req.params.id = "5";
      specialtiesServices.deleteSpecialty.mockResolvedValue({
        statusCode: 200,
        data: { id: 5 },
      });
      await DeleteSpecialtyByIdController(req, res, next);
      expect(specialtiesServices.deleteSpecialty).toHaveBeenCalledWith(5);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 200,
        data: { id: 5 },
      });
    });

    it("should handle errors", async () => {
      req.params.id = "5";
      const error = new Error("fail");
      specialtiesServices.deleteSpecialty.mockRejectedValue(error);
      await DeleteSpecialtyByIdController(req, res, next);
      expect(logger.error).toHaveBeenCalledWith(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
