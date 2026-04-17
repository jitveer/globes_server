const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    id: String,
    label: String,
    price: String,
    pricePerSqft: String,
    emi: String,
    beds: Number,
    baths: Number,
    area_sqm: Number,
  },
  { _id: false },
);

const featureSchema = new mongoose.Schema(
  {
    label: String,
    iconName: String,
    color: String,
  },
  { _id: false },
);

const amenitySchema = new mongoose.Schema(
  {
    label: String,
    iconName: String,
  },
  { _id: false },
);

const surroundingSchema = new mongoose.Schema(
  {
    label: String,
    iconName: String,
    distance: String,
    type: String,
    color: String,
  },
  { _id: false },
);

const faqSchema = new mongoose.Schema(
  {
    question: String,
    answer: String,
  },
  { _id: false },
);

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Property title is required"],
      trim: true,
    },
    builder: String,
    rera: String,
    isNewLaunch: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String, // "Apartment", "Villa", etc.
      required: [true, "Property type is required"],
    },
    location: {
      address: String,
      city: String,
      area: String,
      landmark: String,
      pincode: String,
      mapUrl: String,
    },
    totalFloors: String,
    totalUnits: String,
    launchDate: String,
    priceRange: String,
    description: {
      type: String,
      required: [true, "Property description is required"],
    },
    images: [String],
    plans: [planSchema],
    features: [featureSchema],
    amenities: [amenitySchema],
    surroundings: [surroundingSchema],
    faqs: [faqSchema],
    agent: {
      name: String,
      phone: String,
      email: String,
      image: String,
    },
    brochure: String,
    rating: {
      type: Number,
      default: 0,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    furnished: String,
    availability: String,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "sold", "rented", "inactive"],
      default: "active",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
propertySchema.index({ title: "text", location: "text" });
propertySchema.index({ type: 1, featured: 1, status: 1 });

module.exports =
  mongoose.models.Property || mongoose.model("Property", propertySchema);
