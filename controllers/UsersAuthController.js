import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import Users from "../models/Users.js";
import {
  CustomError,
  addPushTokenOnLogin,
  detectMultipleLogins,
  validatePassword,
} from "../utils/helpers.js";

export const register = async (req, res, next) => {
  try {
    const user = await Users.findOne({
      mobileNumber: req?.body?.registerFormData?.mobileNumber,
    });
    if (user) {
      return next(new CustomError("User already exist", 500));
    }

    // Validate password
    if (!validatePassword(req?.body?.registerFormData?.password)) {
      return next(
        new CustomError(
          "Password must be 6 characters or more and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
          400
        )
      );
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req?.body?.registerFormData?.password, salt);

    const newUser = new Users({
      fullName: req?.body?.registerFormData?.fullName,
      //   country: req.body.country,
      email: req?.body?.registerFormData?.email,
      password: hash,
      mobileNumber: req?.body?.registerFormData?.mobileNumber,
      isPremium: false,
      emergencyMessage:
        "Please help! I need immediate assistance. Please track my current location below and send help ASAP!!",
      emergencyMessageEditCount: 0,
    });

    const access_token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET_KEY
      // {
      //   expiresIn: process.env.JWT_EXPIRATION,
      // }
    );
    const refreshToken = jwt.sign(
      { id: newUser._id },
      process.env.JWT_REFRESH_SECRET_KEY
    );
    newUser.refreshToken = refreshToken;
    addPushTokenOnLogin(newUser._id, req.body.pushTokens);
    await newUser.save();

    return res.status(201).json({
      status: "success",
      message: "User successfully created",
      data: {
        user: {
          id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          mobileNumber: newUser.mobileNumber,
        },
        access_token,
        refresh_token: refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await Users.findOne({
      mobileNumber: req?.body?.loginFormData.mobileNumber,
    });
    if (!user) return next(new CustomError("User not found", 404));
    const isPasswordCorrect = await bcrypt.compare(
      req?.body?.loginFormData?.password,
      user.password
    );
    if (!isPasswordCorrect)
      return next(new CustomError("Wrong password or email", 404));

    const access_token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET_KEY
      // {
      //   expiresIn: process.env.JWT_EXPIRATION,
      // }
    );

    const { password, ...otherDetails } = user._doc;
    // return res
    //   .cookie("access_token", token, {
    //     httpOnly: true,
    //   })
    //   .status(200)
    //   .json({ msg: "logged in successfully", ...otherDetails });
    await addPushTokenOnLogin(user._id, req?.body?.pushTokens); // add the user push token to their profile
    await detectMultipleLogins(user._id, req?.body?.pushTokens); // trying to detect multiple login of the same user
    return res.status(200).json({
      status: "success",
      message: "logged in successfully",
      data: {
        user: {
          ...otherDetails,
        },
        access_token,
        refresh_token: user.refreshToken,
      },
    });
  } catch (err) {
    return next(err);
  }
};

export const forgotpassword = async (req, res, next) => {
  const user = await Users.findOne({ mobileNumber: req.body.mobileNumber });
  if (!user)
    return next(new CustomError("No user with that phone number", 404));
  const resetToken = user.createResetPassword();

  await user.save({ validateBeforeSave: false });
  // const resetURL = `${req.protocol}://${req.get(
  //   "host"
  // )}/api/auth/resetpassword/${resetToken}`;

  try {
    // const message = `Forgot your password? kindly click on this link: ${resetURL} to reset your password.
    //  \nIf you didnt make this request, simply ignore. Token expires in 10 minutes`;
    // sendEmail({
    //   email: user.email,
    //   subject: "Your password reset token is valid for 10 mins",
    //   message,
    // });
    return res.status(200).json({
      status: "success",
      // message: "Password reset link has been sent to your email",
      resetToken,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new CustomError("An error occured, please try again later", 500)
    );
  }
};

// export const getpasswordLink = async (req, res, next) => {
//   try {
//     const token = req.params.resetToken;
//     return res.status(302).json({
//       status: "success",
//       token,
//     });
//     // .redirect(`http://localhost:3001/users/resetpassword/${token}`);
//   } catch (error) {
//     return next(error);
//   }
// };

export const resetpassword = async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");
  const user = await Users.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) return next(new CustomError("Token is invalid or expired", 400));

  // VALIDATE NEW PASSWORD
  if (!validatePassword(req.body.password)) {
    return next(
      new CustomError("Password does not meet security requirements", 400)
    );
  }

  const salt = bcrypt.genSaltSync(10);
  user.password = bcrypt.hashSync(req.body.password, salt);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  // user.token = undefined;

  await user.save();
  return res.status(200).json({
    message: "successfully changed Password. Kindly login again",
  });
};
