const prisma = require("../../config/prisma");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const {
  signupSchema,
  loginSchema,
} = require("./auth.validation");

/*
|--------------------------------------------------------------------------
| Signup
|--------------------------------------------------------------------------
*/

const signup = async (req, res) => {
  try {
    const validatedData =
      signupSchema.parse(req.body);

    const {
      name,
      email,
      contactNumber,
      password,
    } = validatedData;

    const normalizedEmail = email.toLowerCase();
    const normalizedContact = contactNumber.replace(/\s/g, "");

    /*
    |--------------------------------------------------------------------------
    | Check Existing User
    |--------------------------------------------------------------------------
    */

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const existingContact = await prisma.user.findUnique({
      where: { contactNumber: normalizedContact },
    });

    if (existingContact) {
      return res.status(400).json({
        success: false,
        message: "This contact number is already registered",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Hash Password
    |--------------------------------------------------------------------------
    */

    const hashedPassword =
      await bcrypt.hash(password, 10);

    /*
    |--------------------------------------------------------------------------
    | Create User
    |--------------------------------------------------------------------------
    */

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        contactNumber: normalizedContact,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Signup successful",

      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.log(error);

    if (error.code === "P2002") {
      const target = error.meta?.target || "";

      if (String(target).includes("email")) {
        return res.status(400).json({
          success: false,
          message: "An account with this email already exists",
        });
      }

      if (String(target).includes("contactNumber")) {
        return res.status(400).json({
          success: false,
          message: "This contact number is already registered",
        });
      }
    }

    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: error.issues?.[0]?.message || "Invalid input",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Signup failed. Please try again.",
    });
  }
};
/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

const login = async (req, res) => {
  try {
    const validatedData =
      loginSchema.parse(req.body);

    const { email, password } =
      validatedData;

    /*
    |--------------------------------------------------------------------------
    | Find User
    |--------------------------------------------------------------------------
    */

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Compare Password
    |--------------------------------------------------------------------------
    */

    const isPasswordValid =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Generate JWT Token
    |--------------------------------------------------------------------------
    */

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "7d",
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res.json({
      success: true,

      message: "Login successful",

      token,

      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| Current User
|--------------------------------------------------------------------------
*/

const getCurrentUser = async (
  req,
  res
) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },

      select: {
        id: true,
        name: true,
        email: true,
        contactNumber: true,
        role: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
      },
    });

    return res.json({
      success: true,
      data: user,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| Response
|--------------------------------------------------------------------------
*/

module.exports = {
  signup,
  login,
  getCurrentUser,
};