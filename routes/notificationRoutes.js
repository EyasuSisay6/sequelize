const express = require("express");
const notificationController = require("../controllers/notificationController");
const authController = require("../controllers/authController");

const router = express.Router();

//* Everyone

router
    .route("/search")
    .get(
        notificationController.setApproved,
        notificationController.getAllNotifications
    )

//*User

router
    .route("/me")
    .get(
        authController.protect,
        authController.restrictTo("student","teacher","staff"),
        notificationController.setApproved,
        notificationController.forMe,
    )
    .post(
        authController.protect,
        authController.restrictTo("student","teacher","staff"),
        notificationController.setBeforeCreate,
        notificationController.createNotification
    );
router
    .route("/approve")
    .get(
        authController.protect,
        authController.restrictTo("teacher","staff"),
        notificationController.beforeToBe,
    )
router
    .route("/approve/:id")
    .patch(
        authController.protect,
        authController.restrictTo("teacher","staff"),
        notificationController.approve,
    )
router
    .route("/test")
    .post(
        notificationController.test
    )

//!Admin

router
    .route("/")
    .get(
        authController.protect,
        authController.restrictTo("admin"),
        notificationController.getAllNotifications
    )
    .post(
        authController.protect,
        authController.restrictTo("admin"),
        notificationController.createNotification
    );
router
    .route("/:id")
    .get(
        notificationController.getNotification
    )
    .patch(
        authController.protect,
        authController.restrictTo("admin"),
        notificationController.updateNotification
    )
    .delete(
        authController.protect,
        authController.restrictTo("admin"),
        notificationController.deleteNotification
    );

module.exports = router;