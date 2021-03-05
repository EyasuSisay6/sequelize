const express = require("express");
const studentController = require("../controllers/studentController");
const authController = require("../controllers/authController");

const router = express.Router();

router
    .route("/")
    .get(
        studentController.getAllStudents
    )
    .post(
        authController.protect,
        authController.restrictTo("student"),
        studentController.createStudent
    );
router
    .route("/:id")
    .get(
        studentController.getStudent
    )
    .patch(
        authController.protect,
        studentController.updateStudent
    )
    .delete(
        authController.protect,
        authController.restrictTo("admin"),
        studentController.deleteStudent
    );

module.exports = router;