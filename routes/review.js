const express = require("express");
const router = express.Router({mergeParams : true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { reviewSchema } = require("../schema.js");
const reviewController = require("../controllers/review.js");
const { isLoggedIn, isReviewAuthor } = require("../utils/authMiddleware.js");

// Create Review 
router.post("/", isLoggedIn, wrapAsync(reviewController.createReview));

// Delete Review 
router.delete("/:reviewId", isLoggedIn, wrapAsync(isReviewAuthor), wrapAsync(reviewController.destroyReview));

module.exports = router;
