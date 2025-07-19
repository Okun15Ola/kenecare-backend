const withdrawalsService = require("../../../../src/services/admin/withdrawals.services");
const withdrawalRequestsRepo = require("../../../../src/repository/withdrawal-requests.repository");
const doctorsRepo = require("../../../../src/repository/doctors.repository");
const doctorWalletRepo = require("../../../../src/repository/doctor-wallet.repository");
const smsUtils = require("../../../../src/utils/sms.utils");
const dbMapper = require("../../../../src/utils/db-mapper.utils");
// const Response = require("../../../../src/utils/response.utils");

jest.mock("../../../../src/repository/withdrawal-requests.repository");
jest.mock("../../../../src/repository/doctors.repository");
jest.mock("../../../../src/repository/doctor-wallet.repository");
jest.mock("../../../../src/utils/sms.utils");
jest.mock("../../../../src/utils/db-mapper.utils");

describe("Withdrawals Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllRequests", () => {
    it("should return all withdrawal requests", async () => {
      const rawData = [{ id: 1, amount: 100 }];
      const mappedData = [{ id: 1, amount: 100 }];
      withdrawalRequestsRepo.getAllWithdrawalRequests.mockResolvedValue(
        rawData,
      );
      dbMapper.mapWithdawalRow.mockImplementation((row) => row);

      const result = await withdrawalsService.getAllRequests(10, 0, {});
      expect(result.data).toEqual(mappedData);
    });

    it("should return a 200 if no requests are found", async () => {
      withdrawalRequestsRepo.getAllWithdrawalRequests.mockResolvedValue(null);

      const result = await withdrawalsService.getAllRequests(10, 0, {});
      expect(result.statusCode).toBe(200);
    });
  });

  describe("getRequestById", () => {
    it("should return a withdrawal request by id", async () => {
      const rawData = { id: 1, amount: 100 };
      const mappedData = { id: 1, amount: 100 };
      withdrawalRequestsRepo.getWithdrawalRequestById.mockResolvedValue(
        rawData,
      );
      dbMapper.mapWithdawalRow.mockReturnValue(mappedData);

      const result = await withdrawalsService.getRequestById(1);
      expect(result.data).toEqual(mappedData);
    });

    it("should return a 404 if request not found", async () => {
      withdrawalRequestsRepo.getWithdrawalRequestById.mockResolvedValue(null);

      const result = await withdrawalsService.getRequestById(1);
      expect(result.statusCode).toBe(404);
    });
  });

  describe("approveRequest", () => {
    it("should approve a withdrawal request", async () => {
      withdrawalRequestsRepo.getWithdrawalRequestById.mockResolvedValue({
        request_status: "pending",
        doctor_id: 1,
        requested_amount: 100,
      });
      doctorWalletRepo.getCurrentWalletBalance.mockResolvedValue({
        balance: 200,
      });
      doctorsRepo.getDoctorById.mockResolvedValue({ mobile_number: "123" });
      smsUtils.withdrawalApprovedSMS.mockResolvedValue({});

      const result = await withdrawalsService.approveRequest({
        requestId: 1,
        userId: 1,
      });
      expect(result.statusCode).toBe(200);
    });

    it("should return a 400 for insufficient balance", async () => {
      withdrawalRequestsRepo.getWithdrawalRequestById.mockResolvedValue({
        request_status: "pending",
        doctor_id: 1,
        requested_amount: 300,
      });
      doctorWalletRepo.getCurrentWalletBalance.mockResolvedValue({
        balance: 200,
      });

      const result = await withdrawalsService.approveRequest({ requestId: 1 });
      expect(result.statusCode).toBe(400);
    });
  });

  describe("denyRequest", () => {
    it("should deny a withdrawal request", async () => {
      withdrawalRequestsRepo.getWithdrawalRequestById.mockResolvedValue({
        request_status: "pending",
        doctor_id: 1,
      });
      doctorsRepo.getDoctorById.mockResolvedValue({ mobile_number: "123" });
      smsUtils.withdrawalDeniedSMS.mockResolvedValue({});

      const result = await withdrawalsService.denyRequest({
        requestId: 1,
        userId: 1,
      });
      expect(result.statusCode).toBe(200);
    });

    it("should return a 304 if request is already processed", async () => {
      withdrawalRequestsRepo.getWithdrawalRequestById.mockResolvedValue({
        request_status: "approved",
      });

      const result = await withdrawalsService.denyRequest({ requestId: 1 });
      expect(result.statusCode).toBe(304);
    });
  });
});
