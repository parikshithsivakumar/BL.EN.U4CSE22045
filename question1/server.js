require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const fetch = require('node-fetch');


const BEARER_TOKEN = process.env.BEARER_TOKEN;
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Stock Price Aggregation Microservice is running.');
});

async function getPriceHistory(ticker, minutes) {
  const url = `http://20.244.56.144/evaluation-service/stocks/${ticker}?minutes=${minutes}`;
  const resp = await axios.get(url, {
    headers: { Authorization: `Bearer ${BEARER_TOKEN}` }
  });
  return Array.isArray(resp.data) ? resp.data : [resp.data.stock];
}

function calcAverage(history) {
  if (!history.length) return 0;
  const sum = history.reduce((acc, x) => acc + x.price, 0);
  return sum / history.length;
}

function alignHistories(histA, histB) {
  const alignedA = [];
  const alignedB = [];
  histA.forEach(a => {
    const match = histB.reduce((prev, curr) => {
      const diff = Math.abs(new Date(curr.lastUpdatedAt) - new Date(a.lastUpdatedAt));
   return (diff < prev.diff && diff <= 3 * 60 * 1000) ? { entry: curr, diff } : prev;


    }, { entry: null, diff: Infinity });
    if (match.entry) {
      alignedA.push(a.price);
      alignedB.push(match.entry.price);
    }
  });
  return [alignedA, alignedB];
}

function pearsonCorrelation(xs, ys) {
  const n = xs.length;
  if (n < 2) return null;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  if (denX === 0 || denY === 0) return null;
  return num / Math.sqrt(denX * denY);
}

app.get('/stocks/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    const minutes = req.query.minutes || 60;

    const priceHistory = await getPriceHistory(ticker, minutes);
    const averageStockPrice = calcAverage(priceHistory);

    res.json({
      averageStockPrice,
      priceHistory
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/stockcorrelation', async (req, res) => {
  try {
    const minutes = req.query.minutes || 60;
    let tickers = req.query.ticker;
    if (!tickers) return res.status(400).json({ error: 'ticker params required' });
    if (!Array.isArray(tickers)) tickers = [tickers];
    if (tickers.length !== 2) return res.status(400).json({ error: 'Exactly two tickers required' });

    const [histA, histB] = await Promise.all([
      getPriceHistory(tickers[0], minutes),
      getPriceHistory(tickers[1], minutes)
    ]);

    const [alignedA, alignedB] = alignHistories(histA, histB);

    const correlation = pearsonCorrelation(alignedA, alignedB);

    res.json({
      correlation: correlation !== null ? Number(correlation.toFixed(4)) : null,
      stocks: {
        [tickers[0]]: {
          averagePrice: calcAverage(histA),
          priceHistory: histA
        },
        [tickers[1]]: {
          averagePrice: calcAverage(histB),
          priceHistory: histB
        }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

