const controller = require("../../../../src/controllers/index/index.controller");
const service = require("../../../../src/services/index.services");
// const featureService = require("../../../../src/services/admin/featureFlag.services");
const logger = require("../../../../src/middlewares/logger.middleware");

jest.mock("../../../../src/services/index.services");
jest.mock("../../../../src/services/admin/featureFlag.services");
jest.mock("../../../../src/middlewares/logger.middleware");

describe("Index Controllers", () => {
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
      query: {
        page: 1,
        limit: 10,
        query: "test",
        specialty_id: 1,
        locationId: 1,
      },
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

  describe("GetDoctorBlogsController", () => {
    it("should return doctor blogs with correct status", async () => {
      service.getPublishedBlogsByDoctorIndexService.mockResolvedValue(response);
      await controller.GetDoctorBlogsController(req, res, next);
      expect(
        service.getPublishedBlogsByDoctorIndexService,
      ).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should call next on error", async () => {
      service.getPublishedBlogsByDoctorIndexService.mockRejectedValue(error);
      await controller.GetDoctorBlogsController(req, res, next);
      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetDoctorFaqController", () => {
    it("should return doctor faqs", async () => {
      service.getDoctorActiveFaqsIndexService.mockResolvedValue(response);
      await controller.GetDoctorFaqController(req, res, next);
      expect(service.getDoctorActiveFaqsIndexService).toHaveBeenCalledWith(
        1,
        10,
        1,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should call next on error", async () => {
      service.getDoctorActiveFaqsIndexService.mockRejectedValue(error);
      await controller.GetDoctorBlogsController(req, res, next);
      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetBlogsController", () => {
    it("should return blogs", async () => {
      service.getBlogsIndexService.mockResolvedValue(response);
      await controller.GetBlogsController(req, res, next);
      expect(service.getBlogsIndexService).toHaveBeenCalledWith(10, 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should call next on error", async () => {
      service.getBlogsIndexService.mockRejectedValue(error);
      await controller.GetBlogsController(req, res, next);
      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetBlogByIDController", () => {
    it("should return blog by id", async () => {
      service.getBlogIndexService.mockResolvedValue(response);
      await controller.GetBlogByIDController(req, res, next);
      expect(service.getBlogIndexService).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should call next on error", async () => {
      service.getBlogIndexService.mockRejectedValue(error);
      await controller.GetBlogByIDController(req, res, next);
      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetBlogCategoriesController", () => {
    it("should return blog categories", async () => {
      service.getBlogCategoriesIndexService.mockResolvedValue(response);
      await controller.GetBlogCategoriesController(req, res, next);
      expect(service.getBlogCategoriesIndexService).toHaveBeenCalledWith(10, 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should call next on error", async () => {
      service.getBlogCategoriesIndexService.mockRejectedValue(error);
      await controller.GetBlogCategoriesController(req, res, next);
      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetBlogCategoryByIDController", () => {
    it("should return blog category by id", async () => {
      service.getBlogCategoryIndexService.mockResolvedValue(response);
      await controller.GetBlogCategoryByIDController(req, res, next);
      expect(service.getBlogCategoryIndexService).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should call next on error", async () => {
      service.getBlogCategoryIndexService.mockRejectedValue(error);
      await controller.GetBlogCategoryByIDController(req, res, next);
      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetCitiesController", () => {
    it("should return cities", async () => {
      service.getCitiesIndexService.mockResolvedValue(response);
      await controller.GetCitiesController(req, res, next);
      expect(service.getCitiesIndexService).toHaveBeenCalledWith(10, 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should call next on error", async () => {
      service.getCitiesIndexService.mockRejectedValue(error);
      await controller.GetCitiesController(req, res, next);
      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetCityByIDController", () => {
    it("should return city by ID", async () => {
      service.getCityIndexService.mockResolvedValue(response);
      await controller.GetCityByIDController(req, res, next);
      expect(service.getCityIndexService).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should call next on error", async () => {
      service.getCityIndexService.mockRejectedValue(error);
      await controller.GetCityByIDController(req, res, next);
      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetCommonSymptomsController", () => {
    it("should return Common Symptoms", async () => {
      service.getCommonSymptomsIndexService.mockResolvedValue(response);
      await controller.GetCommonSymptomsController(req, res, next);
      expect(service.getCommonSymptomsIndexService).toHaveBeenCalledWith(10, 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should call next on error", async () => {
      service.getCommonSymptomsIndexService.mockRejectedValue(error);
      await controller.GetCommonSymptomsController(req, res, next);
      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetCommonSymptomByIDController", () => {
    it("should return Common Symptom by ID", async () => {
      service.getCommonSymptomIndexService.mockResolvedValue(response);
      await controller.GetCommonSymptomByIDController(req, res, next);
      expect(service.getCommonSymptomIndexService).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should call next on error", async () => {
      service.getCommonSymptomIndexService.mockRejectedValue(error);
      await controller.GetCommonSymptomByIDController(req, res, next);
      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetDoctorsController", () => {
    it("should return Doctors By Specialty", async () => {
      service.getDoctorBySpecialtyIdIndexService.mockResolvedValue(response);
      await controller.GetDoctorsController(req, res, next);
      expect(service.getDoctorBySpecialtyIdIndexService).toHaveBeenCalledWith(
        1,
        10,
        1,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    // it("should return Doctors By Location or Search Query", async () => {
    //   service.getDoctorByQueryIndexService.mockResolvedValue(response);
    //   await controller.GetDoctorsController(req, res, next);
    //   expect(service.getDoctorByQueryIndexService).toHaveBeenCalledWith(
    //     1,
    //     "test",
    //     10,
    //     1,
    //   );
    //   expect(res.status).toHaveBeenCalledWith(200);
    //   expect(res.json).toHaveBeenCalledWith(response);
    // });

    // it("should return All Doctors", async () => {
    //   service.getAllDoctorIndexService.mockResolvedValue(response);
    //   await controller.GetDoctorsController(req, res, next);
    //   expect(service.getAllDoctorIndexService).toHaveBeenCalledWith(10, 1);
    //   expect(res.status).toHaveBeenCalledWith(200);
    //   expect(res.json).toHaveBeenCalledWith(response);
    // });

    it("should call next on error", async () => {
      service.getDoctorBySpecialtyIdIndexService.mockRejectedValue(error);
      await controller.GetDoctorsController(req, res, next);
      expect(logger.error).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("GetFaqByIdController", () => {
    it("should send status 200", async () => {
      await controller.GetFaqByIdController(req, res, next);
      expect(res.sendStatus).toHaveBeenCalledWith(200);
    });
  });

  describe("GetMedicalDegreesController", () => {
    it("should send status 200", async () => {
      await controller.GetMedicalDegreesController(req, res, next);
      expect(res.sendStatus).toHaveBeenCalledWith(200);
    });
  });
});
