import React, { useEffect, useState } from "react";
import { 
  Paper, 
  Typography, 
  CircularProgress, 
  Box,
  Grid,
  Tooltip
} from "@mui/material";
import axios from "axios";

const STOCKS = ["NVDA", "PYPL", "AAPL", "TSLA"];

interface CorrelationData {
  [key: string]: {
    [key: string]: number;
  };
}

export default function CorrelationHeatmap() {
  const [interval] = useState(60);
  const [correlationData, setCorrelationData] = useState<CorrelationData>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchCorrelations = async () => {
      const data: CorrelationData = {};
      
      for (const stock1 of STOCKS) {
        data[stock1] = {};
        for (const stock2 of STOCKS) {
          if (stock1 === stock2) {
            data[stock1][stock2] = 1;
            continue;
          }
          
          try {
            const res = await axios.get(
              `http://localhost:3000/stockcorrelation?minutes=${interval}&ticker=${stock1}&ticker=${stock2}`
            );
            data[stock1][stock2] = res.data.correlation || 0;
          } catch {
            data[stock1][stock2] = 0;
          }
        }
      }
      setCorrelationData(data);
      setLoading(false);
    };
    
    fetchCorrelations();
  }, [interval]);

  const getColor = (value: number) => {
    const hue = value > 0 ? 120 : 0;
    const lightness = 50 + Math.abs(value) * 30;
    return `hsl(${hue}, 70%, ${lightness}%)`;
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" mb={2}>
        Correlation Heatmap (Last {interval} min)
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container>
          {/* Column Headers */}
          <Grid item xs={1} />
          {STOCKS.map((stock) => (
            <Grid item xs={2} key={stock}>
              <Typography variant="subtitle2" align="center">
                {stock}
              </Typography>
            </Grid>
          ))}
          
          {STOCKS.map((stock1) => (
            <React.Fragment key={stock1}>
              {/* Row Header */}
              <Grid item xs={1}>
                <Typography variant="subtitle2" align="center">
                  {stock1}
                </Typography>
              </Grid>
              
              {/* Heatmap Cells */}
              {STOCKS.map((stock2) => (
                <Grid item xs={2} key={`${stock1}-${stock2}`}>
                  <Tooltip 
                    title={`${stock1} vs ${stock2}: ${correlationData[stock1]?.[stock2]?.toFixed(2)}`}
                  >
                    <Box
                      sx={{
                        height: 40,
                        backgroundColor: getColor(correlationData[stock1]?.[stock2] || 0),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <Typography variant="caption">
                        {correlationData[stock1]?.[stock2]?.toFixed(2)}
                      </Typography>
                    </Box>
                  </Tooltip>
                </Grid>
              ))}
            </React.Fragment>
          ))}
        </Grid>
      )}
    </Paper>
  );
}
