const services = require("../../../../src/services/admin/cities.services");
const logger = require("../../../../src/middlewares/logger.middleware");

const {
  GetCitiesController,
  GetCityByIDController,
  CreateCityController,
  UpdateCityByIdController,
  UpdateCityStatusController,
  DeleteCityByIdController,
} = require("../../../../src/controllers/admin/cities.controller");

jest.mock("../../../../src/services/admin/cities.services");
jest.mock("../../../../src/middlewares/logger.middleware");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe("Cities Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GetCitiesController", () => {
    it("should return cities with correct status", async () => {
      const res = mockRes();
      const fakeResponse = { statusCode: 200, data: [{ id: 1, name: "City" }] };
      services.getCities.mockResolvedValue(fakeResponse);

      await GetCitiesController({}, res, mockNext);

      expect(services.getCities).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeResponse);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const error = new Error("fail");
      services.getCities.mockRejectedValue(error);

      await GetCitiesController({}, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("GetCityByIDController", () => {
    it("should return city by id", async () => {
      const res = mockRes();
      const req = { params: { id: "2" } };
      const fakeResponse = { statusCode: 200, data: { id: 2, name: "City2" } };
      services.getCity.mockResolvedValue(fakeResponse);

      await GetCityByIDController(req, res, mockNext);

      expect(services.getCity).toHaveBeenCalledWith(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeResponse);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = { params: { id: "2" } };
      const error = new Error("fail");
      services.getCity.mockRejectedValue(error);

      await GetCityByIDController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("CreateCityController", () => {
    it("should create a city", async () => {
      const res = mockRes();
      const req = { body: { name: "NewCity", latitude: 1, longitude: 2 } };
      const fakeResponse = {
        statusCode: 201,
        data: { id: 3, name: "NewCity" },
      };
      services.createCity.mockResolvedValue(fakeResponse);

      await CreateCityController(req, res, mockNext);

      expect(services.createCity).toHaveBeenCalledWith({
        name: "NewCity",
        latitude: 1,
        longitude: 2,
        inputtedBy: 1,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(fakeResponse);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = { body: { name: "NewCity", latitude: 1, longitude: 2 } };
      const error = new Error("fail");
      services.createCity.mockRejectedValue(error);

      await CreateCityController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdateCityByIdController", () => {
    it("should update a city", async () => {
      const res = mockRes();
      const req = {
        params: { id: "5" },
        body: { name: "Updated", latitude: 3, longitude: 4 },
      };
      const fakeResponse = {
        statusCode: 200,
        data: { id: 5, name: "Updated" },
      };
      services.updateCity.mockResolvedValue(fakeResponse);

      await UpdateCityByIdController(req, res, mockNext);

      expect(services.updateCity).toHaveBeenCalledWith({
        id: 5,
        name: "Updated",
        latitude: 3,
        longitude: 4,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeResponse);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = {
        params: { id: "5" },
        body: { name: "Updated", latitude: 3, longitude: 4 },
      };
      const error = new Error("fail");
      services.updateCity.mockRejectedValue(error);

      await UpdateCityByIdController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdateCityStatusController", () => {
    it("should update city status", async () => {
      const res = mockRes();
      const req = { params: { id: "7" }, query: { status: "1" } };
      const fakeResponse = { statusCode: 200, data: { id: 7, status: 1 } };
      services.updateCityStatus.mockResolvedValue(fakeResponse);

      await UpdateCityStatusController(req, res, mockNext);

      expect(services.updateCityStatus).toHaveBeenCalledWith({
        id: 7,
        status: 1,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeResponse);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = { params: { id: "7" }, query: { status: "1" } };
      const error = new Error("fail");
      services.updateCityStatus.mockRejectedValue(error);

      await UpdateCityStatusController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("DeleteCityByIdController", () => {
    it("should delete a city", async () => {
      const res = mockRes();
      const req = { params: { id: "9" } };
      const fakeResponse = { statusCode: 204, data: null };
      services.deleteCity.mockResolvedValue(fakeResponse);

      await DeleteCityByIdController(req, res, mockNext);

      expect(services.deleteCity).toHaveBeenCalledWith(9);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith(fakeResponse);
    });

    it("should handle errors", async () => {
      const res = mockRes();
      const req = { params: { id: "9" } };
      const error = new Error("fail");
      services.deleteCity.mockRejectedValue(error);

      await DeleteCityByIdController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
