const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const ApiFeatures = require("../utils/apiFeatures");

exports.CreateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "Success",
      data: {
        data: doc,
      },
    });
  });

exports.UpdateOneUser = (Model) =>
  catchAsync(async (req, res, next) => {
    //console.log(req.params);
    const doc = await Model.update(
      req.body,
      {
        where: {
          uuid: req.params.id,
        },
      },
      {
        runValidators: true,
      }
    );
    if (!doc[0]) {
      return next(new AppError("No document found with that ID", 404));
    }
    let query = Model.findOne({ where: { uuid: req.params.id } });
    //if (popOption) query = query.populate(popOption);
    const final = await query;
    res.status(200).json({
      status: "success",
      data: {
        data: final,
      },
    });
  });

exports.deleteOneUser = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.destroy({ where: { uuid: req.params.id } });
    if (!doc) {
      return next(new AppError("No Document found with that ID", 404));
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  });
exports.getOneUser = (Model, popOption) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findOne({ where: { uuid: req.params.id } });
    //if (popOption) query = query.populate(popOption);
    const doc = await query;

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //console.log("test1");
    const features = new ApiFeatures(Model, req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    //console.log("test2");
    const doc = await Model.findAll(features.final);

    res.status(200).json({
      status: "success",
      result: doc.length,
      data: {
        data: doc,
      },
    });
  });
exports.CreateOneWithId = (Model) =>
  catchAsync(async (req, res, next) => {
    req.body.user = req.user.id;
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "Success",
      data: {
        data: doc,
      },
    });
  });
