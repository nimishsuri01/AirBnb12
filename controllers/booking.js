const Booking = require("../models/booking");
const Listing = require("../models/listing");
const { sendBookingConfirmation } = require("../utils/mailer");

function getNights(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end - start;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

module.exports.renderBookingForm = async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate("owner");
  res.render("bookings/new.ejs", { listing });
};

module.exports.createBooking = async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate("owner");
  const { checkIn, checkOut, guests, guestName, guestEmail, phone, paymentMethod } = req.body.booking;
  const nights = getNights(checkIn, checkOut);

  if (nights < 1) {
    req.flash("error", "Check-out date must be after check-in date");
    return res.redirect(`/listings/${listing._id}/bookings/new`);
  }

  const overlap = await Booking.findOne({
    listing: listing._id,
    status: "confirmed",
    checkIn: { $lt: new Date(checkOut) },
    checkOut: { $gt: new Date(checkIn) },
  });

  if (overlap) {
    req.flash("error", "This hotel is already booked for those dates");
    return res.redirect(`/listings/${listing._id}/bookings/new`);
  }

  const totalPrice = Number(listing.price || 0) * nights;
  const booking = new Booking({
    listing: listing._id,
    guest: req.user._id,
    host: listing.owner ? listing.owner._id : undefined,
    checkIn,
    checkOut,
    guests,
    guestName,
    guestEmail,
    phone,
    paymentMethod,
    nights,
    totalPrice,
  });

  await booking.save();
  await booking.populate("listing");

  try {
    booking.emailSent = await sendBookingConfirmation(booking);
    await booking.save();
  } catch (err) {
    console.log("Booking email failed:", err.message);
  }

  req.flash("success", "Hotel booked successfully");
  res.redirect(`/bookings/${booking._id}/confirmation`);
};

module.exports.showConfirmation = async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId)
    .populate("listing")
    .populate("guest");

  if (!booking || !booking.guest._id.equals(req.user._id)) {
    req.flash("error", "Booking not found");
    return res.redirect("/listings");
  }

  res.render("bookings/confirmation.ejs", { booking });
};

module.exports.myBookings = async (req, res) => {
  const bookings = await Booking.find({ guest: req.user._id })
    .populate("listing")
    .sort({ createdAt: -1 });

  res.render("bookings/index.ejs", { bookings });
};
