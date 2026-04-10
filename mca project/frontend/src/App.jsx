import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DonorDashboard from "./pages/DonorDashboard";
import ReceiverDashboard from "./pages/ReceiverDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Chatbot from "./components/Chatbot";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  // Redirect to appropriate dashboard if logged in and on login page
  useEffect(() => {
    if (user && window.location.pathname === "/login") {
      const redirectPath =
        user.role === "admin"
          ? "/admin"
          : user.role === "donor"
            ? "/donor"
            : "/receiver";
      window.location.href = redirectPath;
    }
  }, [user]);

  return (
    <Router>
      <div className="min-h-screen bg-white text-notion-text">
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              user ? (
                <Navigate
                  to={
                    user.role === "admin"
                      ? "/admin"
                      : user.role === "donor"
                        ? "/donor"
                        : "/receiver"
                  }
                />
              ) : (
                <Login />
              )
            }
          />
          <Route path="/register" element={<Register />} />
          <Route
            path="/donor"
            element={user ? <DonorDashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/receiver"
            element={user ? <ReceiverDashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin"
            element={user ? <AdminDashboard /> : <Navigate to="/login" />}
          />
        </Routes>
        <Chatbot />
      </div>
    </Router>
  );
}

export default App;
