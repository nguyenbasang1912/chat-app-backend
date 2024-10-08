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

const getAllUsers = asyncHandler(async (req, res) => {
  new SuccessResponse({
    message: "All users retrieved successfully",
    status: 200,
    data: await UserService.getAllUsers({
      ...req.query,
      userId: req.user.user_id,
    }),
  }).json(res);
});

const updateFcm = asyncHandler(async (req, res) => {
  const { user_id } = req.user;

  new SuccessResponse({
    message: "FCM token updated successfully",
    status: 200,
    data: await UserService.updateFcm({
      userId: user_id,
      fcmToken: req.body.fcmToken,
    }),
  }).json(res);
});

const logout = asyncHandler(async (req, res) => {
  const { user_id } = req.user;
  new SuccessResponse({
    message: "Logout successful",
    status: 200,
    data: await UserService.logout({ userId: user_id }),
  }).json(res);
});

module.exports = {
  login,
  register,
  renewTokens,
  getUsers,
  searchUsers,
  getAllUsers,
  updateFcm,
  logout,
};
