const indiaLocations = require("../utils/indiaLocations.js");
const customHotels = require("./indiaHotels.js");

const hotelStyles = [
  {
    name: "Grand Heritage Hotel",
    description: "heritage-inspired rooms, breakfast, and easy access to the city's most visited places",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    price: 5200,
  },
  {
    name: "Central Comfort Suites",
    description: "modern rooms, fast Wi-Fi, and a central address for work trips and family stays",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
    price: 3900,
  },
  {
    name: "Garden View Residency",
    description: "quiet rooms, green outdoor corners, breakfast, and friendly service",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    price: 4600,
  },
  {
    name: "Urban Boutique Stay",
    description: "boutique interiors, cafe-style common spaces, and quick local transport access",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
    price: 6100,
  },
  {
    name: "Skyline Business Hotel",
    description: "work-friendly rooms, meeting areas, breakfast buffet, and reliable connectivity",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80",
    price: 6800,
  },
  {
    name: "Family Inn",
    description: "comfortable family rooms, parking, simple meals, and helpful front-desk support",
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
    price: 3200,
  },
  {
    name: "Premium Palace Rooms",
    description: "premium rooms, polished interiors, room service, and a relaxed lounge area",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
    price: 7500,
  },
  {
    name: "Traveller's Nest Hotel",
    description: "clean budget rooms, breakfast, and a practical base for exploring nearby attractions",
    image: "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=1200&q=80",
    price: 2800,
  },
];

function uniqueLocations() {
  return [...new Set(indiaLocations)];
}

function customCountByLocation() {
  return customHotels.reduce((counts, hotel) => {
    counts[hotel.location] = (counts[hotel.location] || 0) + 1;
    return counts;
  }, {});
}

function generateDemoHotels(targetPerLocation = 8) {
  const counts = customCountByLocation();

  return uniqueLocations().flatMap((location) => {
    const existingCount = counts[location] || 0;
    const needed = Math.max(targetPerLocation - existingCount, 0);

    return hotelStyles.slice(0, needed).map((style, index) => ({
      title: `${location} ${style.name}`,
      description: `A demo hotel in ${location} with ${style.description}.`,
      image: {
        filename: "demoindiahotel",
        url: style.image,
      },
      price: style.price + ((location.length + index) % 5) * 450,
      location,
      country: "India",
      type: "Hotel",
      amenities: index % 2 === 0
        ? ["Wi-Fi", "Breakfast", "AC", "Parking"]
        : ["Wi-Fi", "Breakfast", "Pool", "AC"],
    }));
  });
}

module.exports = generateDemoHotels;
