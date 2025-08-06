const axios = require('axios');
const { RSI, EMA, MACD } = require('technicalindicators');

module.exports = async (req, res) => {
  const { symbol = 'BTCUSDT', interval = '1h' } = req.query;

  try {
    const response = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=100`);

    const candles = response.data;
    const closes = candles.map(c => parseFloat(c[4]));

    const rsi = RSI.calculate({ values: closes, period: 14 }).slice(-1)[0];
    const ema = EMA.calculate({ values: closes, period: 20 }).slice(-1)[0];
    const macdData = MACD.calculate({
      values: closes,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false
    }).slice(-1)[0];

    res.status(200).json({
      symbol,
      rsi: rsi.toFixed(2),
      ema: ema.toFixed(2),
      macd: {
        histogram: macdData.histogram.toFixed(2),
        macd: macdData.MACD.toFixed(2),
        signal: macdData.signal.toFixed(2)
      },
      suggestion: (rsi < 30) ? "BUY" : (rsi > 70) ? "SELL" : "WAIT"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
