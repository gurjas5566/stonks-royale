import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import "./App.css";
import StockList from "./stockList";
import Login from "./components/login";
import Register from "./components/register";
import Analytics from "./analytics";
import Modal from "./components/modal";
import History from "./components/history";

const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function App() {
  const [user, setUser] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [view, setView] = useState("dashboard");
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false); // New state for modal
  const [modalMessage, setModalMessage] = useState(""); // New state for modal message

  const handleLogin = (loginData) => {
    localStorage.setItem("token", loginData.token);
    setUser(loginData.user);
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const fetchUser = useCallback(async (userId) => {
    try {
      const response = await fetch(`/api/auth/profile/${userId}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user:", error);
      setError("Failed to load user data.");
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        setUser(null);
      } else {
        fetchUser(decodedToken.id);
      }
    }
    setLoading(false);
  }, [navigate, fetchUser]);

  useEffect(() => {
    if (!user) return;
    const socket = io("http://localhost:5000", {
      forceNew: true,
      transports: ["websocket"],
    });

    const fetchStocks = async () => {
      try {
        const stocksResponse = await fetch("/api/stocks");
        if (!stocksResponse.ok) {
          throw new Error(`HTTP error! status: ${stocksResponse.status}`);
        }
        const stocksData = await stocksResponse.json();
        setStocks(stocksData);
      } catch (e) {
        console.error("Failed to fetch stocks:", e);
      }
    };
    fetchStocks();

    let lastUpdateTime = 0;
    const UPDATE_THROTTLE = 2000;

    socket.on("stock_prices_update", (updatedStocks) => {
      const now = Date.now();
      if (now - lastUpdateTime >= UPDATE_THROTTLE) {
        setStocks(updatedStocks);
        fetchUser(user._id);
        lastUpdateTime = now;
      }
    });

    socket.on("connect", () => console.log("Socket connected:", socket.id));
    socket.on("disconnect", () => console.log("Socket disconnected"));

    return () => {
      socket.disconnect();
    };
  }, [user?._id, fetchUser]);

  const handleBuy = async (stockSymbol) => {
    if (!user || transactionLoading) return;
    setTransactionLoading(true);

    try {
      const stock = stocks.find((s) => s.symbol === stockSymbol);
      const sharesToBuy = 1;
      const totalCost = stock.currentPrice * sharesToBuy;

      if (user.cash < totalCost) {
        setModalMessage(
          `Insufficient funds! You need ${formatter.format(
            totalCost
          )} but only have ${formatter.format(user.cash)}`
        );
        setModalVisible(true);
        return;
      }

      const response = await fetch("/api/trade/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          stockSymbol,
          shares: sharesToBuy,
        }),
      });

      const data = await response.json();
      setModalMessage(data.message);
      setModalVisible(true);
      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      setModalMessage(`Error during purchase: ${error.message}`);
      setModalVisible(true);
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleSell = async (stockSymbol) => {
    if (!user || transactionLoading) return;
    setTransactionLoading(true);

    try {
      const ownedStock = user.portfolio.find(
        (item) => item.stockSymbol === stockSymbol
      );
      if (!ownedStock || ownedStock.shares === 0) {
        setModalMessage(`You don't own any shares of ${stockSymbol}.`);
        setModalVisible(true);
        return;
      }

      const sharesToSell = 1;
      if (sharesToSell > ownedStock.shares) {
        setModalMessage(
          `You only own ${ownedStock.shares} share(s) of ${stockSymbol}`
        );
        setModalVisible(true);
        return;
      }

      const response = await fetch("/api/trade/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          stockSymbol,
          shares: sharesToSell,
        }),
      });
      const data = await response.json();
      setModalMessage(data.message);
      setModalVisible(true);
      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      setModalMessage(`Error during sale: ${error.message}`);
      setModalVisible(true);
    } finally {
      setTransactionLoading(false);
    }
  };

  const portfolioValue = useMemo(() => {
    if (!user?.portfolio || stocks.length === 0) return 0;
    return user.portfolio.reduce((acc, item) => {
      const stock = stocks.find((s) => s.symbol === item.stockSymbol);
      return acc + (stock ? stock.currentPrice * item.shares : 0);
    }, 0);
  }, [user?.portfolio, stocks]);

  const totalNetWorth = useMemo(() => {
    return (user?.cash || 0) + portfolioValue;
  }, [user?.cash, portfolioValue]);

  if (loading) {
    return (
      <div className="dashboard">
        <h1>Loading...</h1>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Login onLogin={handleLogin} />} />
      </Routes>
    );
  }

  const renderView = () => {
    switch (view) {
      case "dashboard":
        return stocks.length > 0 ? (
          <StockList
            stocks={stocks}
            onBuy={handleBuy}
            onSell={handleSell}
            disabled={transactionLoading}
          />
        ) : (
          <p>No stocks available.</p>
        );
      case "analytics":
        return <Analytics user={user} stocks={stocks} />;
      case "history":
        return <History user={user} />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      {modalVisible && (
        <Modal message={modalMessage} onClose={() => setModalVisible(false)} />
      )}
      <h1>Stonks Royale</h1>
      <div className="nav-buttons">
        <button onClick={() => setView("dashboard")}>Dashboard</button>
        <button onClick={() => setView("analytics")}>Analytics</button>
        <button onClick={() => setView("history")}>History</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
      {user && (
        <div className="user-info">
          <p>User: {user.username}</p>
          <p>Cash: {formatter.format(user.cash)}</p>
          {/* <p>Portfolio Value: {formatter.format(portfolioValue)}</p> */}
          <p>Invested: {formatter.format(totalNetWorth - user.cash)}</p>
          <p>Total Net Worth: {formatter.format(totalNetWorth)}</p>
          {user.portfolio.length > 0 && (
            <div className="portfolio">
              <h3>Your Holdings:</h3>
              {user.portfolio.map((holding) => (
                <p key={holding.stockSymbol}>
                  {holding.stockSymbol}: {holding.shares} shares
                </p>
              ))}
            </div>
          )}
        </div>
      )}
      {renderView()}
    </div>
  );
}

export default App;
