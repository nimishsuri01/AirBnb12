const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js")
const Listing = require("../models/listing.js");
const { listingSchema , reviewSchema } = require("../schema.js");
const Review = require("../models/review.js")
const {isLoggedIn, isOwner} = require("../middleware.js");
const listingController = require("../controllers/listing.js")

// Index Route 
router.get("/", wrapAsync(listingController.index)); 

//New Route
router.get("/new",isLoggedIn,listingController.rendernewForm);

//Show Route
router.get("/:id", listingController.showListing);

//Create Route
router.post("/",isLoggedIn, wrapAsync(listingController.createListing)
);

//Edit Route
router.get("/:id/edit", isLoggedIn, wrapAsync(isOwner), listingController.editListing);

//Update Route 
router.put("/:id",isLoggedIn, wrapAsync(isOwner), listingController.updateListing);

//Delete Route 
router.delete("/:id",isLoggedIn, wrapAsync(isOwner), listingController.destroyListing);

module.exports = router;
