const express = require("express");
const sectionController = require("../controllers/sectionController");
const authController = require("../controllers/authController");

const router = express.Router();

router
    .route("/")
    .get(
        sectionController.getAllSections
    )
    .post(
        authController.protect,
        authController.restrictTo("admin"),
        sectionController.createSection
    );
router
    .route("/:id")
    .get(
        sectionController.getSection
    )
    .patch(
        authController.protect,
        authController.restrictTo("admin"),
        sectionController.updateSection
    )
    .delete(
        authController.protect,
        authController.restrictTo("admin"),
        sectionController.deleteSection
    );

module.exports = router;