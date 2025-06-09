import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import PlanPage from "./pages/PlanPage";
import OrderPage from "./pages/OrderPage";
import SuccessPage from "./pages/SuccessPage";
import ReviewPage from "./pages/ReviewPage";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Create dark theme
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#000",   // whole background black
      paper: "#181818",  // MUI "Paper" and dialogs darker
    },
    text: {
      primary: "#fff",
      secondary: "#eee"
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline /> {/* Reset and apply theme colors */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/review" element={<ReviewPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
