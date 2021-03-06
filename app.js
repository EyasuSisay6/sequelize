const express = require("express");
var cors = require("cors");

const AppError = require("./utils/appError");

const globalErrorHandler = require("./controllers/errorController");

const userRouter = require("./routes/userRoutes");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
