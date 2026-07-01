const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
 return jwt.sign(
  {
   id: user._id,
   role: user.role,
   libraryId: user.libraryId
  },
  process.env.JWT_SECRET,
  {
   expiresIn: process.env.JWT_EXPIRE || "15m"
  }
 );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id
    },
    process.env.REFRESH_SECRET,
    {
      expiresIn: process.env.REFRESH_EXPIRE || "30d"
    }
  );
};

module.exports = { generateAccessToken, generateRefreshToken };
