const express = require("express");
const dormController = require("../controllers/dormController");
const authController = require("../controllers/authController");

const router = express.Router();

router
    .route("/")
    .get(
        dormController.getAllDorms
    )
    .post(
        authController.protect,
        authController.restrictTo("admin"),
        dormController.createDorm
    );
router
    .route("/:id")
    .get(
        dormController.getDorm
    )
    .patch(
        authController.protect,
        authController.restrictTo("admin"),
        dormController.updateDorm
    )
    .delete(
        authController.protect,
        authController.restrictTo("admin"),
        dormController.deleteDorm
    );

module.exports = router;