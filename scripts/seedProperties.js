require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../app/users/user.model");
const Property = require("../app/properties/properties.model");

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    // Create or find admin user
    let user = await User.findOne({ email: "admin@globesproperties.com" });
    if (!user) {
      user = await User.create({
        firstName: "Admin",
        lastName: "User",
        email: "admin@globesproperties.com",
        phone: "+911234567890",
        password: "password123",
        role: "admin",
      });
      console.log("Created seed user");
    }

    // Clear existing properties
    await Property.deleteMany({});
    console.log("Cleared existing properties");

    const propertiesToSeed = [
      {
        title: "Trendsquares Akino",
        builder: "TRENDSQUARE CONSTRUCTIONS",
        rera: "PRM/KA/RERA/1251/446/PR/210219/003923",
        isNewLaunch: true,
        type: "Luxury Apartment",
        location: "Silver Oaks Main Road, Panathur, Bangalore East, Bangalore",
        priceRange: "1.25 Cr - 2.45 Cr",
        description:
          "Experience luxury living in this stunning villa featuring modern amenities, landscaped gardens, and a prime location. Perfect for families seeking comfort and elegance.",
        images: [
          "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200",
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
        ],
        plans: [
          {
            id: "2bhk",
            label: "2 BHK",
            price: "1.25 Cr - 1.45 Cr",
            pricePerSqft: "10.5 K",
            emi: "62.50 K",
            beds: 2,
            baths: 2,
            area_sqm: 1250,
          },
          {
            id: "3bhk",
            label: "3 BHK",
            price: "1.64 Cr - 1.85 Cr",
            pricePerSqft: "11.26 K",
            emi: "81.42 K",
            beds: 3,
            baths: 3,
            area_sqm: 1650,
          },
          {
            id: "4bhk",
            label: "4 BHK",
            price: "2.10 Cr - 2.45 Cr",
            pricePerSqft: "12.1 K",
            emi: "1.05 L",
            beds: 4,
            baths: 4,
            area_sqm: 2450,
          },
        ],
        features: [
          {
            label: "Swimming Pool",
            iconName: "FaSwimmingPool",
            color: "from-blue-400 to-cyan-500",
          },
          {
            label: "Garden",
            iconName: "FaTree",
            color: "from-green-400 to-emerald-500",
          },
          {
            label: "Modern Kitchen",
            iconName: "FaUtensils",
            color: "from-orange-400 to-red-500",
          },
          {
            label: "24/7 Security",
            iconName: "FaShieldAlt",
            color: "from-blue-600 to-indigo-700",
          },
          {
            label: "Power Backup",
            iconName: "FaBolt",
            color: "from-yellow-400 to-orange-500",
          },
          {
            label: "Gym",
            iconName: "FaDumbbell",
            color: "from-red-400 to-pink-500",
          },
        ],
        amenities: [
          { label: "Parking", iconName: "FaParking" },
          { label: "Swimming Pool", iconName: "FaSwimmingPool" },
          { label: "Gym", iconName: "FaDumbbell" },
          { label: "Garden", iconName: "FaTree" },
        ],
        surroundings: [
          {
            label: "St. Joseph's School",
            iconName: "FaGraduationCap",
            distance: "0.5 KM",
            type: "Education",
            color: "from-blue-500 to-indigo-600",
          },
          {
            label: "Phoenix Marketcity",
            iconName: "FaShoppingCart",
            distance: "2.5 KM",
            type: "Shopping",
            color: "from-purple-500 to-pink-600",
          },
          {
            label: "Panathur Bus Stop",
            iconName: "FaBus",
            distance: "0.2 KM",
            type: "Transit",
            color: "from-orange-500 to-red-600",
          },
          {
            label: "Manipal Hospital",
            iconName: "FaHospital",
            distance: "3.0 KM",
            type: "Medical",
            color: "from-emerald-500 to-teal-600",
          },
        ],
        faqs: [
          {
            question: "Is the project RERA approved?",
            answer:
              "Yes, the project is fully RERA approved with registration number PRM/KA/RERA/1251/446/PR/210219/003923.",
          },
          {
            question: "What are the key amenities?",
            answer:
              "Premium amenities including swimming pool, landscaped gardens, modern gymnasium, 24/7 security, and power backup.",
          },
        ],
        agent: {
          name: "Rajesh Kumar",
          phone: "+91 8889270860",
          email: "rajesh@globesproperties.com",
          image: "https://i.pravatar.cc/150?img=12",
        },
        rating: 4.8,
        reviews: 24,
        yearBuilt: 2020,
        furnished: "Semi-Furnished",
        availability: "Immediate",
        owner: user._id,
        featured: true,
      },
      // Property 2-18 with similar complete structure...
    ];

    // Add 17 more properties with complete data
    for (let i = 2; i <= 18; i++) {
      propertiesToSeed.push({
        title: `Premium Property ${i}`,
        builder: `Builder ${i}`,
        rera: `RERA/2024/00${i}`,
        isNewLaunch: i % 2 === 0,
        type: i % 3 === 0 ? "Villa" : "Apartment",
        location: `Location ${i}, Bangalore`,
        priceRange: `${i}.00 Cr - ${i + 1}.00 Cr`,
        description: `Beautiful property ${i} with modern amenities and excellent location.`,
        images: [
          `https://images.unsplash.com/photo-161349049357${i}?w=1200`,
          `https://images.unsplash.com/photo-160059654281${i}?w=1200`,
        ],
        plans: [
          {
            id: "2bhk",
            label: "2 BHK",
            price: `${i}.00 Cr`,
            pricePerSqft: "10 K",
            emi: "50 K",
            beds: 2,
            baths: 2,
            area_sqm: 1200,
          },
          {
            id: "3bhk",
            label: "3 BHK",
            price: `${i + 0.5}.00 Cr`,
            pricePerSqft: "11 K",
            emi: "70 K",
            beds: 3,
            baths: 2,
            area_sqm: 1500,
          },
        ],
        features: [
          {
            label: "Parking",
            iconName: "FaParking",
            color: "from-gray-400 to-gray-600",
          },
          {
            label: "Security",
            iconName: "FaShieldAlt",
            color: "from-blue-500 to-indigo-600",
          },
        ],
        amenities: [
          { label: "Parking", iconName: "FaParking" },
          { label: "Security", iconName: "FaShieldAlt" },
        ],
        surroundings: [
          {
            label: "School",
            iconName: "FaGraduationCap",
            distance: "1 KM",
            type: "Education",
            color: "from-blue-500 to-indigo-600",
          },
        ],
        faqs: [
          { question: "Is RERA approved?", answer: "Yes, fully approved." },
        ],
        agent: {
          name: "Agent Name",
          phone: "+91 9876543210",
          email: "agent@example.com",
          image: "https://i.pravatar.cc/150?img=10",
        },
        rating: 4.5,
        reviews: 10,
        yearBuilt: 2022,
        furnished: "Unfurnished",
        availability: "Ready to Move",
        owner: user._id,
        featured: i % 3 === 0,
      });
    }

    await Property.insertMany(propertiesToSeed);
    console.log(`Successfully seeded ${propertiesToSeed.length} properties!`);

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seedDatabase();
