require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const RoomService = require("../services/room.service");
const { io } = require("../socket/socket");

const usersLogin = new Map();

const genTokens = (payload) => {
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '1h',
  });

  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return {
    accessToken,
    refreshToken,
  };
};

const login = async ({ username, password }) => {
  if (!username || !password) {
    const err = new Error("Please provide both username and password");
    err.status = 400;
    throw err;
  }

  const user = await User.findOne({ username });

  if (usersLogin.has(user._id.toString())) {
    const err = new Error("User is logged in");
    err.status = 400;
    throw err;
  }

  if (!user) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const isMatch = user.comparePassword(password);

  if (!isMatch) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const payloadToken = {
    user_id: user._id,
  };

  usersLogin.set(user._id.toString(), true);

  return {
    user: {
      userId: user._id,
      username: user.username,
      fullname: user.fullname,
      fcmToken: user.fcm_token,
    },
    tokens: genTokens(payloadToken),
  };
};

const register = async ({ username, password, fullname }) => {
  if (!username || !password || !fullname) {
    const err = new Error("Please fill all required fields");
    err.status = 400;
    throw err;
  }

  const existingUser = await User.findOne({ username });

  if (existingUser) {
    const err = new Error("User already exists");
    err.status = 409;
    throw err;
  }

  const newUser = await User.create({
    username,
    password,
    fullname,
  });

  return {
    userId: newUser._id,
    username: newUser.username,
    fullname: newUser.fullname,
  };
};

const renewTokens = async ({ refreshToken }) => {
  if (!refreshToken) {
    const err = new Error("Please provide a valid refresh token");
    err.status = 401;
    throw err;
  }

  try {
    const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!decode) {
      const err = new Error("Invalid refresh token");
      err.status = 401;
      throw err;
    }

    const user = await User.findById(decode.user_id);

    if (!user) {
      const err = new Error("User not found");
      err.status = 401;
      throw err;
    }

    const payload = {
      user_id: user._id,
    };

    return genTokens(payload);
  } catch (error) {
    if (error.message === "invalid signature") {
      error.status = 403;
    } else if (error.message === "jwt expired") {
      error.status = 401;
    }

    throw error;
  }
};

const searchUser = async ({ keyword, page = 1, limit = 10 }) => {
  if (!keyword) {
    const err = new Error("Please provide a keyword");
    err.status = 400;
    throw err;
  }

  const skip = (page - 1) * limit;
  const totalPages = await User.countDocuments({
    fullname: new RegExp(keyword, "i"),
  });

  const users = await User.find({
    fullname: new RegExp(keyword, "i"),
  })
    .skip(skip)
    .limit(limit)
    .select("username fullname");

  return {
    users,
    page: {
      currentPage: page,
      totalPages: Math.ceil(totalPages / limit),
      hasNextPage: page * limit < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

const getUsers = async ({ userIds }) => {
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    const err = new Error("Please provide a valid array of user IDs");
    err.status = 400;
    throw err;
  }

  const users = await User.find({
    _id: { $in: userIds },
  }).select("username fullname fcm_token");

  return users;
};

const getAllUsers = async ({ page = 1, limit = 10, userId }) => {
  const skip = (page - 1) * limit;
  const totalPages = await User.countDocuments({});

  const users = await User.find({
    _id: { $ne: userId },
  })
    .skip(skip)
    .limit(limit)
    .select("username fullname fcm_token");

  return {
    users,
    page: {
      currentPage: page,
      totalPages: Math.ceil(totalPages / limit),
      hasNextPage: page * limit < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

const updateFcm = async ({ userId, fcmToken }) => {
  const user = await User.findOneAndUpdate(
    {
      _id: userId,
    },
    {
      fcm_token: fcmToken,
    },
    {
      new: true,
    }
  );

  const rooms = await RoomService.getRoomsByMembers([userId]);

  io.to(rooms.map((room) => room._id.toString())).emit(
    "partner update fcm",
    user.fcm_token
  );

  return user.fcm_token;
};

const logout = async ({ userId }) => {
  usersLogin.delete(userId.toString());
  return await updateFcm({ userId, fcmToken: "" });
};

module.exports = {
  login,
  register,
  renewTokens,
  searchUser,
  getUsers,
  getAllUsers,
  updateFcm,
  logout,
};
