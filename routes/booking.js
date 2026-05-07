const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const bookingController = require("../controllers/booking");

router.get("/new", isLoggedIn, wrapAsync(bookingController.renderBookingForm));
router.post("/", isLoggedIn, wrapAsync(bookingController.createBooking));

module.exports = router;
