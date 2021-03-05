const express = require("express");
const staffController = require("../controllers/staffController");
const authController = require("../controllers/authController");

const router = express.Router();

router
    .route("/")
    .get(
        staffController.getAllStaffs
    )
    .post(
        authController.protect,
        authController.restrictTo("staff"),
        staffController.createStaff
    );
router
    .route("/:id")
    .get(
        staffController.getStaff
    )
    .patch(
        authController.protect,
        authController.restrictTo("admin"),
        staffController.updateStaff
    )
    .delete(
        authController.protect,
        authController.restrictTo("admin"),
        staffController.deleteStaff
    );

module.exports = router;