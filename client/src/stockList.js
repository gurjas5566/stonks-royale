import React from "react";

const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const StockList = ({ stocks, onBuy, onSell, disabled }) => {
  return (
    <div className="stock-list">
      {stocks.map((stock) => (
        <div key={stock.symbol} className="stock-card">
          <h3>{stock.symbol}</h3>
          <p>{stock.name}</p>
          <p>Sector: {stock.sector}</p>
          <p>
            Price:{" "}
            <span
              className={stock.dailyChange >= 0 ? "price-up" : "price-down"}
            >
              {formatter.format(stock.currentPrice)}
            </span>
          </p>
          <p>
            Change:{" "}
            <span
              className={stock.dailyChange >= 0 ? "price-up" : "price-down"}
            >
              {stock.dailyChange.toFixed(2)}
            </span>
          </p>
          <div className="trade-buttons">
            <button onClick={() => onBuy(stock.symbol)} disabled={disabled}>
              Buy
            </button>
            <button onClick={() => onSell(stock.symbol)} disabled={disabled}>
              Sell
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StockList;
