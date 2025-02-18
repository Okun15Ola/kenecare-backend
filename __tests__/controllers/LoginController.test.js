const { LoginController } = require("../../src/controllers/auth.controller");
const { loginUser } = require("../../src/services/users.service");
// const app = require("../../src/app");

jest.mock("../../src/services/users.service");

describe("LoginController", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { user: { id: 1, phoneNumber: "+23278822683" } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should return response with status code and json body on successful login", async () => {
    const mockResponse = {
      statusCode: 200,
      status: "created",
      timestamp: Date.now(),
      message: "Logged In Successfully",
      data: {
        token: "token",
        type: 1,
        isVerified: 1,
        isActive: 1,
      },
    };
    loginUser.mockResolvedValue(mockResponse);

    await LoginController(req, res, next);

    expect(loginUser).toHaveBeenCalledWith(req.user);
    expect(res.status).toHaveBeenCalledWith(mockResponse.statusCode);
    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });

  it("should call next with error when loginUser throws an error", async () => {
    const mockError = new Error("Login failed");
    loginUser.mockRejectedValue(mockError);

    await LoginController(req, res, next);

    expect(loginUser).toHaveBeenCalledWith(req.user);
    expect(next).toHaveBeenCalledWith(mockError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
