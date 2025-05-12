import React from "react";
import { CssBaseline, AppBar, Toolbar, Typography, Container, Button } from "@mui/material";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import StockPage from "./StockPage";
import CorrelationHeatmap from "./CorrelationHeatmap";

function App() {
  return (
    <BrowserRouter>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Stock Analytics
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Stock Chart
          </Button>
          <Button color="inherit" component={Link} to="/heatmap">
            Correlation Heatmap
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<StockPage />} />
          <Route path="/heatmap" element={<CorrelationHeatmap />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;
