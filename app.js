const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js")
const Review = require("./models/review.js")

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust";

main()
.then(() => {
    console.log("connected to DB");
}).catch((err) => {
     console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
} 

app.get("/", (req, res) => {
    res.send("Hi, I am a root");
});

// Index Route 
app.get("/listings", async (req,res) => {
   const allListings =  await Listing.find({});
   res.render("listings/index.ejs", {allListings});
});

//New Route
app.get("/listings/new", (req,res) => {
    res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id", async (req,res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
});

//Create Route
app.post("/listings", wrapAsync(async (req,res,next) => {
    const newlisting = new Listing(req.body.listing);
    await newlisting.save();
    res.redirect("/listings");
})
);

//Edit Route
app.get("/listings/:id/edit", async (req,res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
});

//Update Route 
app.put("/listings/:id", async (req,res) => {
    let { id } = req.params;
   await Listing.findByIdAndUpdate(id, req.body.listing, { new: true, runValidators: true }
);
    res.redirect("/listings"); 
});

//Delete Route 
app.delete("/listings/:id", async (req,res) => {
    let { id } = req.params;
   let delteListing =  await Listing.findByIdAndDelete(id);
   res.redirect("/listings");
}); 

//Review Route
app.post("/listings/:id/reviews", async(req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    console.log("new review saved");

    res.redirect(`/listings/${listing._id}`);
});

app.use((err,req,res,next) => {
    res.send("something went wrong");
});

app.listen(process.env.PORT || 8080, () => {
    console.log("server is listening on port 8080");
});