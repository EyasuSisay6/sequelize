const express = require("express");
const departmentController = require("../controllers/departmentController");
const authController = require("../controllers/authController");

const router = express.Router();

router
    .route("/")
    .get(
        departmentController.getAllDepartments
    )
    .post(
        authController.protect,
        authController.restrictTo("admin"),
        departmentController.createDepartment
    );
router
    .route("/:id")
    .get(
        departmentController.getDepartment
    )
    .patch(
        authController.protect,
        authController.restrictTo("admin"),
        departmentController.updateDepartment
    )
    .delete(
        authController.protect,
        authController.restrictTo("admin"),
        departmentController.deleteDepartment
    );

module.exports = router;