const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const indiaHotels = require("./indiaHotels.js");
const generateDemoHotels = require("./generateDemoHotels.js");

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function seedIndiaHotels() {
  await mongoose.connect(MONGO_URL);

  const allHotels = [...indiaHotels, ...generateDemoHotels(8)];

  for (const hotel of allHotels) {
    const hotelWithDefaults = {
      type: "Hotel",
      amenities: ["Wi-Fi", "Breakfast", "Pool", "AC", "Parking"],
      gallery: [
        hotel.image,
        {
          filename: "hotelgallery",
          url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
        },
        {
          filename: "hotelgallery",
          url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
        },
      ],
      ...hotel,
    };

    await Listing.findOneAndUpdate(
      { title: hotelWithDefaults.title, location: hotelWithDefaults.location, country: hotelWithDefaults.country },
      hotelWithDefaults,
      { upsert: true, returnDocument: "after", runValidators: true }
    );
  }

  console.log(`${allHotels.length} India hotel listings are ready`);
  await mongoose.connection.close();
}

seedIndiaHotels().catch(async (err) => {
  console.error(err);
  await mongoose.connection.close();
  process.exit(1);
});
