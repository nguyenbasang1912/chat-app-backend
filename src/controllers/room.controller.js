const asyncHandler = require("../utils/asyncHandler");
const SuccessResponse = require("../utils/response");
const RoomService = require("../services/room.service");

const getRoomByMembers = asyncHandler(async (req, res) => {
  new SuccessResponse({
    message: "Get room by members successfully",
    status: 200,
    data: await RoomService.getRoomByMembers(req.body),
  }).json(res);
});

const getRoomsByUserId = asyncHandler(async (req, res) => {
  new SuccessResponse({
    message: "Get room by user id successfully",
    status: 200,
    data: await RoomService.getRoomsByUserId({ userId: req.user.user_id }),
  }).json(res);
});

module.exports = {
  getRoomByMembers,
  getRoomsByUserId
};
