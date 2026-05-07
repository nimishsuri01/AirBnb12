const nodemailer = require("nodemailer");

function isMailerConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function sendBookingConfirmation(booking) {
  if (!isMailerConfigured()) {
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const listing = booking.listing;
  const nightsLabel = booking.nights === 1 ? "night" : "nights";

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: booking.guestEmail,
    subject: `Booking confirmed: ${listing.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.5;">
        <h2>Your hotel is booked</h2>
        <p>Hi ${booking.guestName || "there"}, your stay at <b>${listing.title}</b> is confirmed.</p>
        <p><b>Location:</b> ${listing.location}, ${listing.country}</p>
        <p><b>Dates:</b> ${booking.checkIn.toDateString()} to ${booking.checkOut.toDateString()}</p>
        <p><b>Guests:</b> ${booking.guests}</p>
        <p><b>Total:</b> Rs.${booking.totalPrice.toLocaleString("en-IN")} for ${booking.nights} ${nightsLabel}</p>
        <p><b>Payment:</b> ${booking.paymentMethod}</p>
      </div>
    `,
  });

  return true;
}

module.exports = { isMailerConfigured, sendBookingConfirmation };
