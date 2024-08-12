const asyncHandler = require("../utils/asyncHandler");
const SuccessResponse = require("../utils/response");
const UserService = require("../services/user.services");

const login = asyncHandler(async (req, res) => {
  new SuccessResponse({
    message: "Login successful",
    status: 200,
    data: await UserService.login(req.body),
  }).json(res);
});

const register = asyncHandler(async (req, res) => {
  new SuccessResponse({
    message: "User registered successfully",
    status: 200,
    data: await UserService.register(req.body),
  }).json(res);
});

const renewTokens = asyncHandler(async (req, res) => {
  new SuccessResponse({
    message: "Tokens renewed successfully",
    status: 200,
    data: await UserService.renewTokens(req.body),
  }).json(res);
});

const getUsers = asyncHandler(async (req, res) => {
  new SuccessResponse({
    message: "Users retrieved successfully",
    status: 200,
    data: await UserService.getUsers(req.body),
  }).json(res);
});

const searchUsers = asyncHandler(async (req, res) => {
  new SuccessResponse({
    message: "Users retrieved successfully",
    status: 200,
    data: await UserService.searchUser(req.query),
  }).json(res);
});

module.exports = {
  login,
  register,
  renewTokens,
  getUsers,
  searchUsers,
};
