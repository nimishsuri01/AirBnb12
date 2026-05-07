const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const bookingController = require("../controllers/booking");

router.get("/", isLoggedIn, wrapAsync(bookingController.myBookings));
router.get("/:bookingId/confirmation", isLoggedIn, wrapAsync(bookingController.showConfirmation));

module.exports = router;
