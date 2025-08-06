// api/analyse.js
const axios = require("axios");
const technicalIndicators = require("technicalindicators");

module.exports = async (req, res) => {
  const symbol = (req.query.symbol || "BTCUSDT").toUpperCase();

  try {
    const response = await axios.get(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=100`
    );

    const closes = response.data.map((candle) => parseFloat(candle[4]));

    const rsi = technicalIndicators.RSI.calculate({ values: closes, period: 14 });
    const macd = technicalIndicators.MACD.calculate({
      values: closes,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    });
    const ema = technicalIndicators.EMA.calculate({ period: 20, values: closes });

    let signal = "HOLD";
    if (rsi[rsi.length - 1] < 30 && macd[macd.length - 1].MACD > macd[macd.length - 1].signal) {
      signal = "BUY";
    } else if (rsi[rsi.length - 1] > 70 && macd[macd.length - 1].MACD < macd[macd.length - 1].signal) {
      signal = "SELL";
    }

    return res.status(200).json({
      symbol,
      price: closes[closes.length - 1],
      signal,
      indicators: ["RSI", "MACD", "EMA"],
    });
  } catch (error) {
    return res.status(500).json({ error: "Error fetching or calculating data", message: error.message });
  }
};
