import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { ThemeProvider } from "styled-components";
import { theme } from "./styles/theme";
import GlobalStyles from "./styles/GlobalStyles";

import { ToastProvider } from "./components/Toast";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <ThemeProvider theme={theme}>
    <GlobalStyles />

    {/* 🔥 ADD THIS WRAPPER */}
    <ToastProvider>
      <App />
    </ToastProvider>

  </ThemeProvider>
);