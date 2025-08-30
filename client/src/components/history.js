import React, { useState, useEffect } from "react";

const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const History = ({ user }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user || !user._id) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/auth/history/${user._id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        console.error("Failed to fetch transaction history:", error);
        setError("Failed to load transaction history");
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user?._id]);

  if (loading) {
    return <div className="history-container">Loading History...</div>;
  }

  if (error) {
    return <div className="history-container error-message">{error}</div>;
  }

  const purchasedHistory = history.filter(
    (transaction) => transaction.type === "buy"
  );
  const soldHistory = history.filter(
    (transaction) => transaction.type === "sell"
  );

  const renderTransactions = (transactions) =>
    transactions.map((transaction) => (
      <div key={transaction._id} className={`transaction-item`}>
        <div className="transaction-header">
          <span className={`type-${transaction.type}`}>
            {transaction.type.toUpperCase()}
          </span>
          <span className="date">
            {new Date(transaction.timestamp).toLocaleString()}
          </span>
        </div>
        <div className="transaction-details">
          <span className="symbol">{transaction.stockSymbol}</span>
          <span className="shares">
            {transaction.shares} shares @ {formatter.format(transaction.price)}
          </span>
        </div>
        <div className="transaction-details">
          <span className="total">
            Total: {formatter.format(transaction.shares * transaction.price)}
          </span>
        </div>
      </div>
    ));

  return (
    <div className="history-container">
      <h2>Transaction History</h2>

      <div className="history-sections-wrapper">
        <div className="history-section">
          <h3>Purchased Stocks</h3>
          {purchasedHistory.length > 0 ? (
            <div className="transaction-list">
              {renderTransactions(purchasedHistory)}
            </div>
          ) : (
            <p>No purchased stocks recorded yet.</p>
          )}
        </div>

        <div className="history-section">
          <h3>Sold Stocks</h3>
          {soldHistory.length > 0 ? (
            <div className="transaction-list">
              {renderTransactions(soldHistory)}
            </div>
          ) : (
            <p>No sold stocks recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
