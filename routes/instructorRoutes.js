const express = require("express");
const instructorController = require("../controllers/instructorController");
const authController = require("../controllers/authController");

const router = express.Router();

router
    .route("/")
    .get(
        instructorController.getAllInstructors
    )
    .post(
        authController.protect,
        authController.restrictTo("teacher"),
        instructorController.createInstructor
    );
router
    .route("/:id")
    .get(
        instructorController.getInstructor
    )
    .patch(
        authController.protect,
        authController.restrictTo("admin"),
        instructorController.updateInstructor
    )
    .delete(
        authController.protect,
        authController.restrictTo("admin"),
        instructorController.deleteInstructor
    );

module.exports = router;