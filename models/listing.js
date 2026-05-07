const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema ({
    title : {
        type : String,
    },
    description : String,
    image : {
        filename : String,
        url: {
            type: String, // Move the logic here
            default: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aG90ZWxzfGVufDB8fDB8fHww",
            set: (v) => v === "" ? "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aG90ZWxzfGVufDB8fDB8fHww" : v,
        },
    },
    price : Number,
    location: String,
    country : String,
    type: {
        type: String,
        default: "Hotel",
    },
    amenities: {
        type: [String],
        default: ["Wi-Fi", "Breakfast"],
    },
    gallery: [
        {
            url: String,
            filename: String,
        },
    ],
    reviews : [
        {
            type: Schema.Types.ObjectId,
            ref : "Review"
        },
    ],
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User",
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
