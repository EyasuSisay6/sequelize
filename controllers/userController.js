const { User } = require("../models");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  //console.log(req.user.uuid);
  req.params.id = req.user.uuid;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for Password update. please use /updateMyPassword",
        400
      )
    );
  }
  const filteredBody = filterObj(req.body, "name", "email");
  const updatedUser = await User.update(
    filteredBody,
    {
      where: {
        uuid: req.user.uuid,
      },
    },
    {
      runValidators: true,
    }
  );
  if (!updatedUser[0]) {
    return next(new AppError("No user found with that ID", 404));
  }
  let query = User.findOne({ where: { uuid: req.user.uuid } });
  //if (popOption) query = query.populate(popOption);
  const doc = await query;
  res.status(200).json({
    status: "success",
    data: doc,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.update(
    { active: false },
    {
      where: {
        uuid: req.user.uuid,
      },
    }
  );
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined",
  });
};
exports.getUser = factory.getOneUser(User);
exports.deleteUser = factory.deleteOneUser(User);
exports.updateUser = factory.UpdateOneUser(User); //do not update password with this;
exports.getAllUsers = factory.getAll(User);
