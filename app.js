const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/booking.js");
const bookingStandaloneRouter = require("./routes/bookingStandalone.js");
const session = require("express-session");
const flash = require("connect-flash");
const indiaLocations = require("./utils/indiaLocations.js");
// const { listingSchema , reviewSchema } = require("./schema.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

//Sessions
const sessionOptions = {
    secret : "mysupersecretcode",
    resave : false,
    saveUninitialized : true,
};

app.use(session(sessionOptions));
app.use(flash());

// Password Setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

const googleAuthEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

if (googleAuthEnabled) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:8080/auth/google/callback",
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@google.airbnb.local`;
            let user = await User.findOne({ googleId: profile.id });

            if (!user) {
                user = await User.findOne({ email });
            }

            if (!user) {
                user = new User({
                    username: email,
                    email,
                    googleId: profile.id,
                    displayName: profile.displayName,
                    avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : undefined,
                });
            } else {
                user.googleId = profile.id;
                user.displayName = user.displayName || profile.displayName;
                user.avatar = user.avatar || (profile.photos && profile.photos[0] ? profile.photos[0].value : undefined);
            }

            await user.save();
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }));
}

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    res.locals.googleAuthEnabled = googleAuthEnabled;
    res.locals.indiaLocations = indiaLocations;
    next();
})
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/listings/:id/bookings", bookingRouter);
app.use("/bookings", bookingStandaloneRouter);
app.use("/", userRouter);

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

// app.get("/", (req, res) => {
//     res.send("Hi, I am a root");
// });

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
    const listing = await Listing.findById(id).populate("reviews");
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

// Post Review Route
app.post("/listings/:id/reviews", async(req,res) => {
    let listing = await Listing.findById(req.params.id).populate("reviews");
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    console.log("new review saved");

    res.redirect(`/listings/${listing._id}`);
});

// Delete Review Route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req,res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, {pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}));

app.use((err,req,res,next) => {
    res.send("something went wrong");
    console.log(err);
});

app.listen(process.env.PORT || 8080, () => {
    console.log("server is listening on port 8080");
});
