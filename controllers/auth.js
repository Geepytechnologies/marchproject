const bcrypt = require("bcryptjs");
const { createError } = require("../error.js");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const dotenv = require("dotenv").config();
const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const signup = async (req, res, next) => {
  const existingEmail = await prisma.user.findUnique({
    where: {
      email: req.body.email,
    },
  });
  const existinguser = await prisma.user.findMany({
    where: {
      AND: [{ email: req.body.email }, { phone: req.body.phone }],
    },
  });
  const existingphone = await prisma.user.findUnique({
    where: {
      phone: req.body.phone,
    },
  });
  try {
    if (existinguser.length)
      return next(createError(409, "User already exists"));
    else if (existingEmail)
      return next(createError(409, "Email already exists"));
    else if (existingphone)
      return next(createError(409, "Phone number already exists"));
    else {
      // Generate a random verification token
      const verificationToken = crypto.randomBytes(20).toString("hex");
      console.log({ vtoken: verificationToken });

      // Hash the verification token with the user's email address
      const hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken + req.body.email)
        .digest("hex");
      console.log({ htoken: hashedToken });

      // Set the expiry time to 24 hours from now
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      const salt = bcrypt.genSaltSync(10);
      const hashedpassword = bcrypt.hashSync(req.body.password, salt);

      // Create a new user
      const newUser = await prisma.user.create({
        data: {
          ...req.body,
          password: hashedpassword,
          verificationToken: hashedToken,
          expiresAt,
        },
      });

      // Send a verification email to the user
      const verificationLink = `http://localhost:5000/api/auth/verify-email?token=${verificationToken}`;
      console.log(verificationLink);

      //transporter
      const transporter = nodemailer.createTransport({
        host: "mail.reveal.com.ng",
        port: 465,
        secure: true,
        auth: {
          user: "support@reveal.com.ng",
          pass: "Richgift196897",
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const mailOptions = {
        from: "support@reveal.com.ng",
        to: `${req.body.email}`,
        subject: "Complete Your Registration",
        html: `<html>
        <head>
          <meta charset="UTF-8">
          <title>My HTML Email</title>
        </head>
        <body>
          <div>
            <div class="header" style="background-color: teal;">
              <div class="headertext" style="color: white; font-weight: 600; font-size: 25px;">Click on this link to complete your registration : ${verificationLink}</div>
            </div>
          </div>
        </body>
      </html>
        `,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
      res.status(201).json(newUser);
    }
  } catch (err) {
    next(err);
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.query;

  // Find the user with the matching verification token
  const user = await prisma.user.findMany({
    where: {
      verificationToken: token,
    },
  });
  if (!user.length) {
    return res.status(400).json({ error: "Invalid verification token" });
  }
  const currentDate = new Date();
  if (user && currentDate > user.expiresAt) {
    return res.status(400).json({ error: "Verification link has expired" });
  }

  // Update the user's verification status
  const userId = user[0].id;
  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      verified: true,
      verificationToken: null,
    },
  });

  res
    .status(200)
    .json({ message: "Email address verified", user: updatedUser });
};

const signin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });
    if (!user) return next(createError(404, "User not found"));
    const isMatched = bcrypt.compareSync(req.body.password, user.password);
    if (!isMatched) return next(createError(400, "wrong credentials"));

    //access Token
    const accessToken = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      process.env.ACCESS_SECRET,
      { expiresIn: "60s" }
    );

    //refresh Token
    const refreshToken = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      process.env.REFRESH_SECRET,
      { expiresIn: "1d" }
    );

    //save refresh token to the user model
    const updatedUser = await prisma.user.update({
      where: {
        email: req.body.email,
      },
      data: {
        refreshtoken: refreshToken,
      },
    });

    // Creates Secure Cookie with refresh token
    res.cookie("token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    const { password, ...others } = user;

    res.status(200).json({ others, accessToken });
  } catch (err) {
    next(err);
  }
};

const changepassword = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });
    if (!user) return next(createError(404, "User not found"));
    const isMatched = bcrypt.compareSync(req.body.oldpassword, user.password);
    if (!isMatched) return next(createError(400, "Old password is incorrect"));
    const salt = bcrypt.genSaltSync(10);
    const hashedpassword = bcrypt.hashSync(req.body.newpassword, salt);
    const updatedUser = await prisma.user.update({
      where: {
        id: req.body.userid,
      },
      data: {
        password: hashedpassword,
      },
    });
    res.status(201).json("successful");
  } catch (err) {
    next(err);
  }
};

const forgotpassword = async (req, res, next) => {
  const { email, redirecturl } = req.body;
  try {
    // Find the user with the matching email address
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Generate a unique token
    const token = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(token + email)
      .digest("hex");

    // Set the expiration time for the token (1 hour from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Store the token in the database
    await prisma.passwordResetToken.create({
      data: {
        token: hashedToken,
        expiresAt: expiresAt,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    // Send an email to the user with a link containing the token
    const mailOptions = {
      from: "example@gmail.com",
      to: user.email,
      subject: "Reset your password",
      text: `Click the following link to reset your password: http://localhost:5000/reset-password?token=${hashedToken}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  app.post("/reset-password", async (req, res) => {
    const { token, password } = req.body;

    // Find the token with the matching value
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: {
        token: token,
      },
      include: {
        user: true,
      },
    });

    if (!resetToken) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Check if the token has expired
    const currentDate = new Date();
    if (currentDate > resetToken.expiresAt) {
      return res.status(400).json({ error: "Token has expired" });
    }

    // Update the user's password
    const user = resetToken.user;
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });
    // Delete the password reset token
    await prisma.passwordResetToken.delete({
      where: {
        id: resetToken.id,
      },
    });
  });
};

const signout = async (req, res, next) => {
  // On client, also delete the accessToken

  const cookies = req.cookies;
  if (!cookies?.token) return res.sendStatus(204); //No content
  const refreshToken = cookies.token;

  // Is refreshToken in db?
  const foundUser = await prisma.user.findUnique({
    where: {
      refreshtoken: refreshToken,
    },
  });
  if (!foundUser) {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    return res.sendStatus(204);
  }

  // Delete refreshToken in db
  foundUser.refreshtoken = "";
  const updatedUser = await prisma.user.update({
    where: {
      refreshtoken: refreshToken,
    },
    data: {
      refreshtoken: foundUser.refreshtoken,
    },
  });
  console.log(updatedUser);

  res.clearCookie("token", { httpOnly: true, sameSite: "None", secure: true });
  res.sendStatus(204);
};

module.exports = {
  signup,
  signin,
  signout,
  changepassword,
  forgotpassword,
  verifyEmail,
  resetPassword,
};
