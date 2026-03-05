const mongoose = require("mongoose")
const dotenv = require("dotenv")
const User = require("./models/User")
const Product = require("./models/Product")
const Rental = require("./models/Rental")

// Load env vars
dotenv.config()

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)

// Sample users
const users = [
  {
    name: "Admin User",
    email: "admin@agro.com",
    password: "admin123",
    role: "admin",
    userType: "other",
    phone: "+91-9876543210",
    location: "Nashik, Maharashtra",
  },
  {
    name: "Rajesh Kumar",
    email: "rajesh@agro.com",
    password: "user123",
    role: "user",
    userType: "farmer",
    phone: "+91-9876543211",
    location: "Sinnar, Maharashtra",
    farmSize: "5 acres",
  },
  {
    name: "Priya Singh",
    email: "priya@agro.com",
    password: "seller123",
    role: "seller",
    userType: "supplier",
    phone: "+91-9876543212",
    location: "Nashik, Maharashtra",
  },
]

// Agro products
const products = [
  {
    name: "Premium Hybrid Seeds",
    description: "High-yield hybrid seeds for maximum productivity. Suitable for all soil types and weather conditions.",
    price: 450,
    discountPrice: 399,
    category: "seeds-fertilizers",
    brand: "AgriGold",
    stock: 120,
    tags: ["seeds", "hybrid", "high-yield"],
  },
  {
    name: "Organic Fertilizer 50kg",
    description: "100% organic fertilizer for sustainable farming. Rich in nitrogen, phosphorus and potassium.",
    price: 1200,
    discountPrice: 999,
    category: "seeds-fertilizers",
    brand: "BioGrow",
    stock: 85,
    tags: ["fertilizer", "organic", "natural"],
  },
  {
    name: "Manual Weeding Hoe",
    description: "Durable manual weeding tool for efficient farming. Ergonomic handle for comfortable use.",
    price: 350,
    category: "tools-equipment",
    brand: "FarmTools",
    stock: 156,
    tags: ["tools", "weeding", "manual"],
  },
  {
    name: "Pesticide Spray Bottle 5L",
    description: "Professional-grade pesticide spray bottle with adjustable nozzle for uniform spraying.",
    price: 280,
    category: "pesticides-chemicals",
    brand: "SprayPro",
    stock: 67,
    tags: ["pesticide", "spray", "chemicals"],
  },
  {
    name: "Soil Testing Kit",
    description: "Complete soil analysis kit for optimal crop planning. Tests pH, nitrogen, phosphorus and potassium levels.",
    price: 890,
    category: "tools-equipment",
    brand: "SoilCheck",
    stock: 203,
    tags: ["soil", "testing", "analysis"],
  },
  {
    name: "Drip Irrigation System",
    description: "Modern drip irrigation system for water efficiency. Covers up to 1 acre of farmland.",
    price: 3500,
    discountPrice: 2999,
    category: "irrigation",
    brand: "AquaDrip",
    stock: 45,
    tags: ["irrigation", "drip", "water-saving"],
  },
  {
    name: "Fungicide Powder 1kg",
    description: "Effective fungicide for crop disease prevention. Protects wheat, rice, and vegetable crops.",
    price: 420,
    category: "pesticides-chemicals",
    brand: "CropGuard",
    stock: 92,
    tags: ["fungicide", "crop-protection", "disease"],
  },
  {
    name: "Compost Maker 25kg",
    description: "Accelerate composting with our premium compost maker. Turns farm waste into rich compost in 30 days.",
    price: 650,
    discountPrice: 550,
    category: "organic",
    brand: "GreenCycle",
    stock: 118,
    tags: ["compost", "organic", "waste-management"],
  },
]

// Rental equipment
const rentals = [
  {
    name: "Tractor - 50 HP",
    description: "Powerful 50 HP tractor for large-scale farming. Well-maintained and fuel efficient.",
    category: "heavy-machinery",
    pricePerDay: 2500,
    location: "Nashik",
    availability: "available",
  },
  {
    name: "Combine Harvester",
    description: "Modern combine harvester for efficient crop harvesting. Suitable for wheat, rice, and soybean.",
    category: "harvesting-equipment",
    pricePerDay: 5000,
    location: "Sinnar",
    availability: "available",
  },
  {
    name: "Rotavator",
    description: "Rotavator for soil tilling and preparation. Compatible with 35-50 HP tractors.",
    category: "soil-preparation",
    pricePerDay: 1500,
    location: "Sinnar",
    availability: "available",
  },
  {
    name: "Sprayer Machine",
    description: "Motorized sprayer for pesticide and fertilizer application. 20L tank capacity.",
    category: "spraying-equipment",
    pricePerDay: 800,
    location: "Nashik",
    availability: "available",
  },
  {
    name: "Thresher Machine",
    description: "Electric thresher for grain separation. Processes up to 500kg per hour.",
    category: "processing-equipment",
    pricePerDay: 1200,
    location: "Sinnar",
    availability: "available",
  },
  {
    name: "Seed Drill",
    description: "Precision seed drill for accurate seed placement. 9-row capacity.",
    category: "planting-equipment",
    pricePerDay: 900,
    location: "Nashik",
    availability: "available",
  },
  {
    name: "Cultivator",
    description: "Multi-purpose cultivator for soil preparation. Adjustable depth control.",
    category: "soil-preparation",
    pricePerDay: 1000,
    location: "Sinnar",
    availability: "available",
  },
  {
    name: "Drone Sprayer",
    description: "Advanced drone sprayer for precise aerial pesticide and fertilizer application. 10L payload.",
    category: "spraying-equipment",
    pricePerDay: 5000,
    location: "Nashik",
    availability: "available",
  },
]

// Import data
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany()
    await Product.deleteMany()
    await Rental.deleteMany()

    // Create users
    const createdUsers = await User.create(users)
    const adminUser = createdUsers[0]._id
    const sellerUser = createdUsers[2]._id

    // Correct local image mapping for products
    const productImageMap = {
      "Premium Hybrid Seeds": "/hybrid-seeds.jpg",
      "Organic Fertilizer 50kg": "/organic-fertilizer.jpg",
      "Manual Weeding Hoe": "/weeding-hoe.jpg",
      "Pesticide Spray Bottle 5L": "/spray-bottle.jpg",
      "Soil Testing Kit": "/soil-testing-kit.jpg",
      "Drip Irrigation System": "/drip-irrigation.jpg",
      "Fungicide Powder 1kg": "/fungicide-powder.jpg",
      "Compost Maker 25kg": "/compost-maker.jpg",
    }

    const sampleProducts = products.map((product) => ({
      ...product,
      createdBy: sellerUser,
      images: [{ url: productImageMap[product.name] || "/placeholder.jpg", alt: product.name }],
    }))

    await Product.create(sampleProducts)

    // Correct local image mapping for rentals
    const rentalImageMap = {
      "Tractor - 50 HP": "/tractor.jpeg",
      "Combine Harvester": "/harvester.jpeg",
      "Rotavator": "/rotavator.jpeg",
      "Sprayer Machine": "/sprayer machine.jpeg",
      "Thresher Machine": "/thresher machine.jpeg",
      "Seed Drill": "/seed drill.jpeg",
      "Cultivator": "/cultivator.jpeg",
      "Drone Sprayer": "/drone sprayer.jpeg",
    }

    const sampleRentals = rentals.map((rental) => ({
      ...rental,
      owner: sellerUser,
      images: [{ url: rentalImageMap[rental.name] || "/placeholder.jpg", alt: rental.name }],
      ratings: { average: 4.5 + Math.random() * 0.5, count: Math.floor(Math.random() * 200) + 30 },
    }))

    await Rental.create(sampleRentals)

    console.log("✅ Data imported successfully!")
    console.log("Admin:  admin@agro.com / admin123")
    console.log("User:   rajesh@agro.com / user123")
    console.log("Seller: priya@agro.com / seller123")
    process.exit()
  } catch (error) {
    console.error("❌ Error:", error)
    process.exit(1)
  }
}

// Delete data
const deleteData = async () => {
  try {
    await User.deleteMany()
    await Product.deleteMany()
    await Rental.deleteMany()

    console.log("✅ Data destroyed successfully!")
    process.exit()
  } catch (error) {
    console.error("❌ Error:", error)
    process.exit(1)
  }
}

// Check command line args
if (process.argv[2] === "-d") {
  deleteData()
} else {
  importData()
}
