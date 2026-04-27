import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Purchase from "./pages/Purchase";
import Sales from "./pages/Sales";
import Inventory from "./pages/Inventory";
import Login from "./pages/Login";

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) setIsAuth(true);
    setLoading(false);
  }, []);

  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  return (
    <BrowserRouter>

      {/* ✅ Navbar only when logged in */}
      {isAuth && <Navbar />}

      <div style={{ padding: "20px" }}>
        <Routes>

          {/* 🔐 LOGIN ROUTE */}
          <Route
            path="/login"
            element={!isAuth ? <Login /> : <Navigate to="/" />}
          />

          {/* 🔐 PROTECTED ROUTES */}
          <Route
            path="/"
            element={isAuth ? <Dashboard /> : <Navigate to="/login" />}
          />

          <Route
            path="/purchase"
            element={isAuth ? <Purchase /> : <Navigate to="/login" />}
          />

          <Route
            path="/sales"
            element={isAuth ? <Sales /> : <Navigate to="/login" />}
          />

          <Route
            path="/inventory"
            element={isAuth ? <Inventory /> : <Navigate to="/login" />}
          />

        </Routes>
      </div>

    </BrowserRouter>
  );
}

export default App;