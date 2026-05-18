const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | Get Token
    |--------------------------------------------------------------------------
    */

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Extract Token
    |--------------------------------------------------------------------------
    */

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Verify Token
    |--------------------------------------------------------------------------
    */

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    /*
    |--------------------------------------------------------------------------
    | Attach User
    |--------------------------------------------------------------------------
    */

    req.user = decoded;

    next();

  } catch (error) {
    console.log(error);

    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

module.exports = {
  protect,
};