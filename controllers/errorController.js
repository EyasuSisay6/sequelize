const AppError = require("../utils/appError");

const handelCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handelDuplicationErrorDB = (err) => {
  const message = `Duplicated field value: "${err.keyValue.name}"`;
  return new AppError(message, 400);
};

const handelJWTError = () =>
  new AppError("Invalid token. Please log in again", 401);
const handelJWTExpiredError = () =>
  new AppError("Your token has expired. Please log in again", 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  //console.log(err);
  if (err.isOperational || !!err.message) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went very wrong",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV.trim() === "production") {
    // if (err.name === "CastError") {
    //   err = handelCastErrorDB(err);
    // } else if (err.name === "MongoError") {
    //   if (err.code === 11000) {
    //     err = handelDuplicationErrorDB(err);
    //   }
    // }
    // console.log("test");
    if (err.name === "JsonWebTokenError") {
      err = handelJWTError(err);
    }
    if (err.name === "TokenExpiredError") {
      err = handelJWTExpiredError(err);
    }
    sendErrorProd(err, res);
  }
};
