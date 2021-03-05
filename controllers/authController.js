const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { User } = require("../models");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");

const signToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

const createAndSendToken = (user, statusCode, res) => {
  //console.log(user);
  const token = signToken(user.uuid);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  createAndSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { phoneNumber, password } = req.body;
  if (!phoneNumber || !password) {
    return next(new AppError("Please provide phone number and password!", 400));
  }

  const user = await User.findOne({
    where: {
      phoneNumber,
    },
  });

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  createAndSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //console.log("test1");
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Please log in to get access", 401));
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findOne({ where: { uuid: decoded.id } });
  //console.log(currentUser);
  if (!currentUser) {
    return next(new AppError("The User no longer exists"));
  }
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password!, Please log in again", 401)
    );
  }
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ where: { email: req.body.email } });
  if (!user) {
    return next(
      new AppError("There is no user with the given email address.", 404)
    );
  }
  const resetToken = user.createPasswordResetToken();
  //console.log(resetToken);
  await user.save({ validateBeforeSave: false });
  const restURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `to:${restURL}.`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (err) {
    user.createPasswordResetToken = undefined;
    user.createPasswordResetDate = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(err);
    return next(new AppError("There was an error sending email", 500));
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    where: {
      passwordResetToken: hashedToken,
      passwordResetDate: { [Op.gt]: Date.now() },
    },
  });
  //console.log(user);
  if (!user) {
    return next(new AppError("Token is invalid or expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // user.createPasswordResetDate = undefined;
  // user.createPasswordResetToken = undefined;
  const newUser = await User.update(
    {
      password: user.password,
      passwordConfirm: user.passwordConfirm,
      passwordResetDate: null,
      passwordResetToken: null,
    },
    {
      where: {
        id: user.id,
      },
    },
    {
      runValidators: false,
    }
  );
  console.log(newUser);
  createAndSendToken(user, 200, res);
});

exports.userPassword = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.user.id);
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Incorrect password", 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  const newUser = await User.update(
    {
      password: user.password,
      passwordConfirm: user.passwordConfirm,
      passwordChangedAt: Date.now() - 1000,
    },
    {
      where: {
        id: req.user.id,
      },
    }
  );
  //console.log(newUser);
  createAndSendToken(user, 200, res);
});
