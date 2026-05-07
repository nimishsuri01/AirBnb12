const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  guest: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  host: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  checkIn: {
    type: Date,
    required: true,
  },
  checkOut: {
    type: Date,
    required: true,
  },
  guests: {
    type: Number,
    min: 1,
    required: true,
  },
  guestName: String,
  guestEmail: String,
  phone: String,
  paymentMethod: {
    type: String,
    enum: ["UPI", "Card", "Pay at hotel"],
    required: true,
  },
  nights: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["confirmed", "cancelled"],
    default: "confirmed",
  },
  emailSent: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Booking", bookingSchema);
