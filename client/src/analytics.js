import React, { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Analytics = ({ user, stocks }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // Use a map for stocks for faster lookup
  const stocksMap = useMemo(() => {
    const map = new Map();
    stocks.forEach((stock) => {
      map.set(stock.symbol, stock);
    });
    return map;
  }, [stocks]);

  // Fetch transactions only once when user changes
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user || !user._id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/auth/history/${user._id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const history = await response.json();
        setTransactions(history);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch transaction history:", error);
        setError("Failed to load transaction history");
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [user?._id]);

  // Process chart data when transactions or current stock prices change
  useEffect(() => {
    if (transactions.length === 0 || stocks.length === 0) {
      setChartData([]);
      return;
    }

    const processData = () => {
      const data = [];
      let runningCash = user.cash;
      let runningPortfolio = [...user.portfolio];

      transactions.forEach((transaction) => {
        if (transaction.type === "buy") {
          runningCash -= transaction.price * transaction.shares;
          const portfolioItem = runningPortfolio.find(
            (p) => p.stockSymbol === transaction.stockSymbol
          );
          if (portfolioItem) {
            portfolioItem.shares += transaction.shares;
          } else {
            runningPortfolio.push({
              stockSymbol: transaction.stockSymbol,
              shares: transaction.shares,
            });
          }
        } else if (transaction.type === "sell") {
          runningCash += transaction.price * transaction.shares;
          const portfolioItem = runningPortfolio.find(
            (p) => p.stockSymbol === transaction.stockSymbol
          );
          if (portfolioItem) {
            portfolioItem.shares -= transaction.shares;
            if (portfolioItem.shares === 0) {
              runningPortfolio = runningPortfolio.filter(
                (p) => p.stockSymbol !== transaction.stockSymbol
              );
            }
          }
        }

        const portfolioValue = runningPortfolio.reduce((acc, item) => {
          const stock = stocksMap.get(item.stockSymbol);
          return acc + (stock ? stock.currentPrice * item.shares : 0);
        }, 0);

        data.unshift({
          name: new Date(transaction.timestamp).toLocaleDateString(),
          netWorth: runningCash + portfolioValue,
          cash: runningCash,
          portfolio: portfolioValue,
        });
      });

      setChartData(data);
    };

    processData();
  }, [transactions, stocks, user?.cash, user?.portfolio, stocksMap]);

  if (loading) {
    return <div className="analytics-container">Loading Analytics...</div>;
  }

  if (error) {
    return (
      <div className="analytics-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <h2>Portfolio Analytics</h2>

      <div style={{ marginBottom: "20px" }}>
        <h3>Net Worth Over Time</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, ""]} />
              <Legend />
              <Line
                type="monotone"
                dataKey="netWorth"
                stroke="#8884d8"
                name="Net Worth"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="cash"
                stroke="#82ca9d"
                name="Cash"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="portfolio"
                stroke="#ffc658"
                name="Portfolio Value"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No data available. Start trading to see analytics!</p>
        )}
      </div>
    </div>
  );
};

export default Analytics;
