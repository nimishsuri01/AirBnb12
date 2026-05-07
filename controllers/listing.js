const Listing = require("../models/listing");
const indiaLocations = require("../utils/indiaLocations.js");

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports.index = async (req,res) => {
   const { search, minPrice, maxPrice, type, amenity, minRating } = req.query;
   const cleanedSearch = search ? search.trim() : "";
   const exactLocation = indiaLocations.some(
    (location) => location.toLowerCase() === cleanedSearch.toLowerCase()
   );
   const safeSearch = escapeRegex(cleanedSearch);
   const query = cleanedSearch
    ? exactLocation
        ? { location: { $regex: `^${safeSearch}$`, $options: "i" } }
        : {
            $or: [
              { title: { $regex: safeSearch, $options: "i" } },
              { location: { $regex: safeSearch, $options: "i" } },
              { country: { $regex: safeSearch, $options: "i" } },
            ],
          }
    : {};
   if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
   }

   if (type) {
    query.type = type;
   }

   if (amenity) {
    query.amenities = amenity;
   }

   let allListings = await Listing.find(query).populate("owner").populate("reviews");

   allListings = allListings.map((listing) => {
    const ratings = listing.reviews.map((review) => review.rating).filter(Boolean);
    listing.averageRating = ratings.length
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0;
    return listing;
   });

   if (minRating) {
    allListings = allListings.filter((listing) => listing.averageRating >= Number(minRating));
   }

   res.render("listings/index.ejs", {
    allListings,
    search: cleanedSearch,
    filters: { minPrice, maxPrice, type, amenity, minRating },
   });
};

module.exports.rendernewForm = (req,res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req,res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");
    const ratings = listing.reviews.map((review) => review.rating).filter(Boolean);
    listing.averageRating = ratings.length
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0;
    res.render("listings/show.ejs", {listing});
}; 

module.exports.createListing = async (req,res,next) => {
    const newlisting = new Listing(req.body.listing);
    newlisting.owner = req.user._id;
    await newlisting.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
};

module.exports.editListing = async (req,res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req,res) => {
    let { id } = req.params;
   await Listing.findByIdAndUpdate(id, req.body.listing, { new: true, runValidators: true }
);
    res.redirect("/listings"); 
};

module.exports.destroyListing = async (req,res) => {
    let { id } = req.params;
   let delteListing =  await Listing.findByIdAndDelete(id);
   res.redirect("/listings");
};
