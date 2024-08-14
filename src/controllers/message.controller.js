const asyncHandler = require("../utils/asyncHandler");
const SuccessResponse = require("../utils/response");
const MessageService = require("../services/message.service");

const getMessages = asyncHandler(async (req, res) => {
  const query = req.query;
  const { user_id: userId } = req.user;

  const body = {
    ...query,
    userId,
  };

  new SuccessResponse({
    message: "Messages retrieved successfully",
    status: 200,
    data: await MessageService.getMessagesByRoomId(body),
  }).json(res);
});

module.exports = {
  getMessages,
};
