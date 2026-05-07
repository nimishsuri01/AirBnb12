const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  displayName: String,
  googleId: String,
  avatar: String,
  email: {
    type: String,
    required: true,
  },
  wishlist: [
    {
      type: Schema.Types.ObjectId,
      ref: "Listing",
    },
  ],
});

// Must pass the function itself
userSchema.plugin(passportLocalMongoose.default || passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
