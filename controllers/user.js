const User = require("../models/user");
const Listing = require("../models/listing");
const Booking = require("../models/booking");
module.exports.rendersignUp = (req,res) => {
    res.render("users/signup.ejs");
}; 

module.exports.signUp = async(req,res,next) => {
    try {
    let { username, email ,password } = req.body;
    const newUser = new User({email,username, displayName: username});
    const registeredUser = await  User.register(newUser, password);
    // Automatically Login after Sign up
    req.login(registeredUser, (err) => {
      if(err) {
        return next(err);
      }
    req.flash("success", "Welcome Back To AirBnb")
    res.redirect("/listings");
    });
    
    } catch(err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
};

module.exports.renderlogIn = (req,res) => {
    res.render("users/login.ejs");
};

module.exports.logIn =  async (req, res) => {
    req.flash("success", "Welcome to AirBnb");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  };

module.exports.googleAuthUnavailable = (req,res) => {
  req.flash("error", "Google login needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment.");
  res.redirect("/login");
};

module.exports.googleCallback = (req,res) => {
  req.flash("success", "Welcome to AirBnb");
  res.redirect("/users/me");
};

module.exports.dashboard = async(req,res) => {
  const myListings = await Listing.find({ owner: req.user._id }).populate("reviews").sort({ _id: -1 });
  const myListingIds = myListings.map((listing) => listing._id);
  const hostBookings = await Booking.find({ listing: { $in: myListingIds } }).populate("listing").sort({ createdAt: -1 });
  const totalReviews = myListings.reduce((sum, listing) => sum + listing.reviews.length, 0);
  const totalRevenue = hostBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
  res.render("users/dashboard.ejs", { myListings, hostBookings, totalReviews, totalRevenue });
};

module.exports.toggleWishlist = async(req,res) => {
  const user = await User.findById(req.user._id);
  const listingId = req.params.id;
  const exists = user.wishlist.some((id) => id.equals(listingId));

  if(exists) {
    user.wishlist.pull(listingId);
    req.flash("success", "Removed from wishlist");
  } else {
    user.wishlist.push(listingId);
    req.flash("success", "Saved to wishlist");
  }

  await user.save();
  res.redirect(req.get("referer") || "/listings");
};

module.exports.wishlist = async(req,res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.render("users/wishlist.ejs", { wishlist: user.wishlist });
};

  module.exports.logout = (req,res,next) => {
  req.logout((err) => {
    if(err) {
      return next(err);
    }
    req.flash("success", "you are logged out");
    res.redirect("/listings");

  });
};
