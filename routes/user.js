const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const { isLoggedIn } = require("../middleware.js");
const userController = require("../controllers/user.js");

const requireGoogleConfig = (req,res,next) => {
  if(!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return userController.googleAuthUnavailable(req,res);
  }
  next();
};

router.get("/signup", userController.rendersignUp);

router.post("/signup", wrapAsync(userController.signUp));

router.get("/login", userController.renderlogIn);

router.post("/login",saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.logIn);

router.get("/auth/google", requireGoogleConfig, passport.authenticate("google", {
  scope: ["profile", "email"],
}));

router.get("/auth/google/callback", requireGoogleConfig,
  passport.authenticate("google", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.googleCallback);

router.get("/users/me", isLoggedIn, wrapAsync(userController.dashboard));
router.get("/wishlist", isLoggedIn, wrapAsync(userController.wishlist));
router.post("/wishlist/:id/toggle", isLoggedIn, wrapAsync(userController.toggleWishlist));

router.get("/logout", userController.logout);

module.exports = router;
