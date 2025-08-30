const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Stock = require("../models/Stock");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();
const stocks = [
  // Technology
  {
    symbol: "TECH",
    name: "Tech Innovators Inc.",
    sector: "Technology",
    currentPrice: 1250.75,
    dailyChange: 45.5,
  },
  {
    symbol: "SOFT",
    name: "SoftTech Ltd.",
    sector: "Technology",
    currentPrice: 1130.4,
    dailyChange: -22.6,
  },
  {
    symbol: "CLOUD",
    name: "CloudNet Systems",
    sector: "Technology",
    currentPrice: 980.75,
    dailyChange: 33.5,
  },

  // Automotive
  {
    symbol: "AUTO",
    name: "Auto Dynamics Co.",
    sector: "Automotive",
    currentPrice: 850.5,
    dailyChange: -17.0,
  },
  {
    symbol: "EVM",
    name: "EV Motors Inc.",
    sector: "Automotive",
    currentPrice: 1200.5,
    dailyChange: 48.0,
  },
  {
    symbol: "TRUCK",
    name: "Truck Solutions Co.",
    sector: "Automotive",
    currentPrice: 780.3,
    dailyChange: 20.5,
  },

  // Healthcare
  {
    symbol: "PHARMA",
    name: "Pharma Health Solutions",
    sector: "Healthcare",
    currentPrice: 1200.0,
    dailyChange: 36.0,
  },
  {
    symbol: "BIO",
    name: "BioGen Pharmaceuticals",
    sector: "Healthcare",
    currentPrice: 1500.0,
    dailyChange: -45.0,
  },
  {
    symbol: "MED",
    name: "MedEquip Corp.",
    sector: "Healthcare",
    currentPrice: 1450.6,
    dailyChange: 50.0,
  },

  // Consumer Goods
  {
    symbol: "FOOD",
    name: "Global Foods Corp.",
    sector: "Consumer Goods",
    currentPrice: 550.2,
    dailyChange: 20.0,
  },
  {
    symbol: "BEV",
    name: "Beverage World Ltd.",
    sector: "Consumer Goods",
    currentPrice: 689.9,
    dailyChange: -25.0,
  },
  {
    symbol: "CLOTH",
    name: "ClothMart Inc.",
    sector: "Consumer Goods",
    currentPrice: 402.25,
    dailyChange: 12.0,
  },

  // Finance
  {
    symbol: "BANK",
    name: "National Bank Corp.",
    sector: "Finance",
    currentPrice: 1800.0,
    dailyChange: 55.0,
  },
  {
    symbol: "INV",
    name: "Investment Partners",
    sector: "Finance",
    currentPrice: 950.5,
    dailyChange: -30.0,
  },
  {
    symbol: "INSURE",
    name: "SecureLife Insurance",
    sector: "Finance",
    currentPrice: 950.0,
    dailyChange: 20.0,
  },

  // Energy
  {
    symbol: "OIL",
    name: "Global Oil Co.",
    sector: "Energy",
    currentPrice: 657.5,
    dailyChange: 18.5,
  },
  {
    symbol: "SOLAR",
    name: "Solar Future Inc.",
    sector: "Energy",
    currentPrice: 1209.0,
    dailyChange: 50.0,
  },
  {
    symbol: "WIND",
    name: "WindPower Ltd.",
    sector: "Energy",
    currentPrice: 884.0,
    dailyChange: -20.0,
  },

  // Telecommunications
  {
    symbol: "TEL",
    name: "TeleConnect Inc.",
    sector: "Telecommunications",
    currentPrice: 550.0,
    dailyChange: -10.0,
  },
  {
    symbol: "MOBILE",
    name: "MobileNet Corp.",
    sector: "Telecommunications",
    currentPrice: 702.0,
    dailyChange: 22.0,
  },
  {
    symbol: "FIBER",
    name: "FiberLink Ltd.",
    sector: "Telecommunications",
    currentPrice: 955.5,
    dailyChange: 30.0,
  },

  // Real Estate
  {
    symbol: "PROP",
    name: "Property Developers Inc.",
    sector: "Real Estate",
    currentPrice: 804.0,
    dailyChange: -25.0,
  },
  {
    symbol: "HOME",
    name: "HomeBuilders Co.",
    sector: "Real Estate",
    currentPrice: 1209.0,
    dailyChange: 40.0,
  },
  {
    symbol: "ESTATE",
    name: "Urban Estate Ltd.",
    sector: "Real Estate",
    currentPrice: 1506.0,
    dailyChange: 50.0,
  },

  // Utilities
  {
    symbol: "WATER",
    name: "Aqua Utilities",
    sector: "Utilities",
    currentPrice: 607.5,
    dailyChange: 15.0,
  },
  {
    symbol: "ELECT",
    name: "Electric Grid Corp.",
    sector: "Utilities",
    currentPrice: 1005.0,
    dailyChange: -35.0,
  },
  {
    symbol: "GAS",
    name: "GasFlow Ltd.",
    sector: "Utilities",
    currentPrice: 889.0,
    dailyChange: 20.0,
  },
];

const importData = async () => {
  try {
    await Stock.deleteMany(); //for deleting duplicates

    await Stock.insertMany(stocks); //Inserting new ones
    console.log("Data inserted");
    process.exit();
  } catch (error) {
    console.log(`Error with data import:${error.message}`);
    process.exit(1);
  }
};

const deleteData = async () => {
  try {
    await Stock.deleteMany();
    console.log("Data Destroyed!");
    process.exit();
  } catch (error) {
    console.error(`Error with data destruction: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  deleteData();
} else {
  importData();
}
