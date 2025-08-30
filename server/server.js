const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const Stock = require("./models/Stock");
const authRoutes = require("./routes/authRoutes");
const stockRoutes = require("./routes/stockRoutes");
const tradeRoutes = require("./routes/tradeRoutes");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Express middleware
app.use(express.json());
app.use(cors());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/trade", tradeRoutes);

const updatePrices = () => {
  // This function will run every 5 seconds
  setInterval(async () => {
    try {
      // Find all stocks in the database
      const stocks = await Stock.find({});

      const updatedStocks = await Promise.all(
        stocks.map(async (stock) => {
          const percentChange = Math.random() * 0.1 - 0.05; //Stock price changes from +5% to -5%

          let newPrice = stock.currentPrice * (1 + percentChange);

          // Ensure the price doesn't go below zero
          newPrice = Math.max(0.01, newPrice).toFixed(2);

          const newDailyChange = (newPrice - stock.currentPrice).toFixed(2);

          // Update the stock in the database
          const updatedStock = await Stock.findByIdAndUpdate(
            stock._id,
            {
              currentPrice: newPrice,
              dailyChange: newDailyChange,
            },
            { new: true }
          );
          return updatedStock;
        })
      );

      // Emit the updated stock data to all connected clients
      io.emit("stock_prices_update", updatedStocks);
    } catch (error) {
      console.error("Error updating prices:", error.message);
    }
  }, 5000);
};

// Start the price update engine
updatePrices();

const PORT = process.env.PORT || 5000;
server.listen(PORT, console.log(`Server running on port ${PORT}`));
