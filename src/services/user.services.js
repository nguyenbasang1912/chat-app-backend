require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const genTokens = (payload) => {
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
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

  return {
    user: {
      username: user.username,
      fullname: user.fullname,
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
    username: newUser.username,
    fullname: newUser.fullname,
  };
};

const renewTokens = async ({refreshToken}) => {
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

module.exports = {
  login,
  register,
  renewTokens,
};
