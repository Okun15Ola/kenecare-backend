jest.mock("../../../../src/services/admin/marketers.services");
jest.mock("../../../../src/middlewares/logger.middleware");

const marketersServices = require("../../../../src/services/admin/marketers.services");
const logger = require("../../../../src/middlewares/logger.middleware");

const {
  GetAllMarketersController,
  GetMarketerByIdController,
  CreateMarketerController,
  VerifyMarketerPhoneNumberController,
  VerifyMarketerEmailController,
  UpdateMarketerController,
  DeleteMarketerController,
} = require("../../../../src/controllers/admin/marketers.controller");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe("Marketers Controllers", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GetAllMarketersController", () => {
    it("should return marketers with correct status", async () => {
      const res = mockRes();
      const req = {
        query: { limit: 10, page: 1 },
      };
      const mockResponse = { statusCode: 200, data: [{ id: 1 }] };
      marketersServices.getAllMarketersService.mockResolvedValue(mockResponse);

      await GetAllMarketersController(req, res, mockNext);

      expect(marketersServices.getAllMarketersService).toHaveBeenCalledWith(
        req.query.limit,
        req.query.page,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should call next on error", async () => {
      const res = mockRes();
      const req = {
        query: { limit: 10, page: 1 },
      };

      const error = new Error("fail");
      marketersServices.getAllMarketersService.mockRejectedValue(error);

      await GetAllMarketersController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("GetMarketerByIdController", () => {
    it("should return marketer by id", async () => {
      const res = mockRes();
      const req = { params: { id: "2" } };
      const mockResponse = { statusCode: 200, data: { id: 2 } };
      marketersServices.getMarketerByIdService.mockResolvedValue(mockResponse);

      await GetMarketerByIdController(req, res, mockNext);

      expect(marketersServices.getMarketerByIdService).toHaveBeenCalledWith(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should call next on error", async () => {
      const res = mockRes();
      const req = { params: { id: "2" } };
      const error = new Error("fail");
      marketersServices.getMarketerByIdService.mockRejectedValue(error);

      await GetMarketerByIdController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("CreateMarketerController", () => {
    it("should create marketer and return response", async () => {
      const res = mockRes();
      const req = {
        file: { filename: "id.png" },
        body: {
          firstName: "John",
          middleName: "M",
          lastName: "Doe",
          gender: "male",
          dateOfBirth: "1990-01-01",
          phoneNumber: "1234567890",
          email: "john@example.com",
          homeAddress: "123 Street",
          idDocumentType: "passport",
          idDocumentNumber: "A1234567",
          nin: "12345678901",
          firstEmergencyContactName: "Jane",
          firstEmergencyContactNumber: "0987654321",
          firstEmergencyContactAddress: "456 Avenue",
          secondEmergencyContactName: "Jake",
          secondEmergencyContactNumber: "1122334455",
          secondEmergencyContactAddress: "789 Road",
        },
      };
      const mockResponse = { statusCode: 201, data: { id: 3 } };
      marketersServices.createMarketerService.mockResolvedValue(mockResponse);

      await CreateMarketerController(req, res, mockNext);

      expect(marketersServices.createMarketerService).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: "John",
          idDocumentFile: { filename: "id.png" },
        }),
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should call next on error", async () => {
      const res = mockRes();
      const req = { file: {}, body: {} };
      const error = new Error("fail");
      marketersServices.createMarketerService.mockRejectedValue(error);

      await CreateMarketerController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("VerifyMarketerPhoneNumberController", () => {
    it("should verify marketer phone number", async () => {
      const res = mockRes();
      const req = { query: { token: "1234" } };
      const mockResponse = { statusCode: 200, data: true };
      marketersServices.verifyMarketerPhoneNumberService.mockResolvedValue(
        mockResponse,
      );

      await VerifyMarketerPhoneNumberController(req, res, mockNext);

      expect(
        marketersServices.verifyMarketerPhoneNumberService,
      ).toHaveBeenCalledWith(1234);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should call next on error", async () => {
      const res = mockRes();
      const req = { query: { token: "1234" } };
      const error = new Error("fail");
      marketersServices.verifyMarketerPhoneNumberService.mockRejectedValue(
        error,
      );

      await VerifyMarketerPhoneNumberController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("VerifyMarketerEmailController", () => {
    it("should verify marketer email", async () => {
      const res = mockRes();
      const req = { query: { token: "abc" } };
      const mockResponse = { statusCode: 200, data: true };
      marketersServices.verifyMarketerEmailService.mockResolvedValue(
        mockResponse,
      );

      await VerifyMarketerEmailController(req, res, mockNext);

      expect(marketersServices.verifyMarketerEmailService).toHaveBeenCalledWith(
        "abc",
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should call next on error", async () => {
      const res = mockRes();
      const req = { query: { token: "abc" } };
      const error = new Error("fail");
      marketersServices.verifyMarketerEmailService.mockRejectedValue(error);

      await VerifyMarketerEmailController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("UpdateMarketerController", () => {
    it("should update marketer and return response", async () => {
      const res = mockRes();
      const req = {
        params: { id: "5" },
        body: {
          firstName: "Jane",
          middleName: "A",
          lastName: "Smith",
          gender: "female",
          dateOfBirth: "1992-02-02",
          phoneNumber: "5555555555",
          email: "jane@example.com",
          homeAddress: "321 Lane",
          idDocumentType: "driver_license",
          idDocument: "file.pdf",
          idDocumentNumber: "B7654321",
          nin: "10987654321",
          firstEmergencyContactName: "John",
          firstEmergencyContactNumber: "1231231234",
          firstEmergencyContactAddress: "654 Street",
          secondEmergencyContactName: "Jill",
          secondEmergencyContactNumber: "9988776655",
          secondEmergencyContacAddress: "987 Avenue",
        },
      };
      const mockResponse = { statusCode: 200, data: { id: 5 } };
      marketersServices.updateMarketerByIdService.mockResolvedValue(
        mockResponse,
      );

      await UpdateMarketerController(req, res, mockNext);

      expect(marketersServices.updateMarketerByIdService).toHaveBeenCalledWith(
        expect.objectContaining({
          marketerId: 5,
          firstName: "Jane",
        }),
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should call next on error", async () => {
      const res = mockRes();
      const req = { params: { id: "5" }, body: {} };
      const error = new Error("fail");
      marketersServices.updateMarketerByIdService.mockRejectedValue(error);

      await UpdateMarketerController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("DeleteMarketerController", () => {
    it("should delete marketer and return response", async () => {
      const res = mockRes();
      const req = { params: { id: "7" } };
      const mockResponse = { statusCode: 204, data: null };
      marketersServices.deleteMarketerByIdService.mockResolvedValue(
        mockResponse,
      );

      await DeleteMarketerController(req, res, mockNext);

      expect(marketersServices.deleteMarketerByIdService).toHaveBeenCalledWith(
        7,
      );
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should call next on error", async () => {
      const res = mockRes();
      const req = { params: { id: "7" } };
      const error = new Error("fail");
      marketersServices.deleteMarketerByIdService.mockRejectedValue(error);

      await DeleteMarketerController(req, res, mockNext);

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
