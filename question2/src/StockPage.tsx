import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  CircularProgress,
} from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import axios from "axios";

interface PricePoint {
  price: number;
  lastUpdatedAt: string;
}
interface StockData {
  averageStockPrice: number;
  priceHistory: PricePoint[];
}

const STOCKS = [
  { label: "NVIDIA", value: "NVDA" },
  { label: "PayPal", value: "PYPL" },
  { label: "Apple", value: "AAPL" },
  { label: "Tesla", value: "TSLA" },
  // Add more if needed
];

const INTERVALS = [15, 30, 60];

export default function StockPage() {
  const [selectedStock, setSelectedStock] = useState("NVDA");
  const [interval, setInterval] = useState(60);
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get<StockData>(`http://localhost:3000/stocks/${selectedStock}?minutes=${interval}`)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [selectedStock, interval]);

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box display="flex" gap={2} mb={3}>
        <FormControl>
          <InputLabel>Stock</InputLabel>
          <Select
            value={selectedStock}
            label="Stock"
            onChange={(e) => setSelectedStock(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            {STOCKS.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel>Interval</InputLabel>
          <Select
            value={interval}
            label="Interval"
            onChange={(e) => setInterval(Number(e.target.value))}
            sx={{ minWidth: 120 }}
          >
            {INTERVALS.map((m) => (
              <MenuItem key={m} value={m}>
                Last {m} min
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {loading && <CircularProgress />}
      {!loading && data && (
        <Box height={400}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.priceHistory}>
              <XAxis
                dataKey="lastUpdatedAt"
                tickFormatter={(time) => new Date(time).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip
                formatter={(value) => [`$${Number(value).toFixed(2)}`, "Price"]}
                labelFormatter={(label) => new Date(label).toLocaleString()}
              />
              <Line type="monotone" dataKey="price" stroke="#1976d2" strokeWidth={2} dot={false} />
              <ReferenceLine
                y={data.averageStockPrice}
                label="Avg"
                stroke="#ff7300"
                strokeDasharray="3 3"
              />
            </LineChart>
          </ResponsiveContainer>
          <Typography mt={2} variant="subtitle1">
            Average: ${data.averageStockPrice.toFixed(2)}
          </Typography>
        </Box>
      )}
      {!loading && !data && (
        <Typography color="error" mt={2}>
          No data available.
        </Typography>
      )}
    </Paper>
  );
}
