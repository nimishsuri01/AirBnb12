const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js")
const Listing = require("../models/listing.js");
const { listingSchema , reviewSchema } = require("../schema.js");
const Review = require("../models/review.js")

// Index Route 
router.get("/", async (req,res) => {
   const allListings =  await Listing.find({});
   res.render("listings/index.ejs", {allListings});
}); 

//New Route
router.get("/new", (req,res) => {
    res.render("listings/new.ejs");
});

//Show Route
router.get("/:id", async (req,res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", {listing});
});

//Create Route
router.post("/", wrapAsync(async (req,res,next) => {
    const newlisting = new Listing(req.body.listing);
    await newlisting.save();
    res.redirect("/listings");
})
);

//Edit Route
router.get("/:id/edit", async (req,res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
});

//Update Route 
router.put("/:id", async (req,res) => {
    let { id } = req.params;
   await Listing.findByIdAndUpdate(id, req.body.listing, { new: true, runValidators: true }
);
    res.redirect("/listings"); 
});

//Delete Route 
router.delete("/:id", async (req,res) => {
    let { id } = req.params;
   let delteListing =  await Listing.findByIdAndDelete(id);
   res.redirect("/listings");
});

module.exports = router;