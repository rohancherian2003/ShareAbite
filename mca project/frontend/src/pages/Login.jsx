import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const Toast = ({ message, onClose }) => {
  const isEmailError = message.toLowerCase().includes("email");
  const title = isEmailError ? "Invalid Email" : "Invalid Password";
  const icon = isEmailError ? "📧" : "🔒";
  return (
  <div
    style={{
      position: "fixed",
      top: "24px",
      right: "24px",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      gap: "12px",
      background: "#fff",
      border: "1px solid #fca5a5",
      borderLeft: "4px solid #ef4444",
      borderRadius: "10px",
      padding: "14px 18px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      minWidth: "280px",
      animation: "slideIn 0.3s ease",
    }}
  >
    <span style={{ fontSize: "20px" }}>{icon}</span>
    <div style={{ flex: 1 }}>
      <p style={{ margin: 0, fontWeight: 600, color: "#b91c1c", fontSize: "14px" }}>
        {title}
      </p>
      <p style={{ margin: 0, color: "#6b7280", fontSize: "13px", marginTop: "2px" }}>
        {message}
      </p>
    </div>
    <button
      onClick={onClose}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#9ca3af",
        fontSize: "18px",
        lineHeight: 1,
        padding: "0 2px",
      }}
    >
      ×
    </button>
    <style>{`
      @keyframes slideIn {
        from { opacity: 0; transform: translateX(60px); }
        to   { opacity: 1; transform: translateX(0); }
      }
    `}</style>
  </div>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "donor",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setToast("");

    // --- Client-side validation ---
    if (!formData.email.trim()) {
      const msg = "Please enter your email address.";
      setError(msg);
      setToast(msg);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      const msg = "Please enter a valid email address.";
      setError(msg);
      setToast(msg);
      return;
    }
    if (!formData.password) {
      const msg = "Please enter your password.";
      setError(msg);
      setToast(msg);
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      const { token, user } = response.data;

      // Store token and user
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Reload the page to update App state
      window.location.reload();
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid email or password. Please try again.";
      setError(msg);
      // Show toast for ALL login failures
      setToast(msg);
      setLoading(false);
    }
  };

  return (
    <>
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-white via-notion-gray to-white px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card shadow-card-hover">
          <h1 className="text-3xl font-bold mb-2 text-notion-text">
            Welcome back
          </h1>
          <p className="text-gray-500 mb-8">Sign in to your account</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-notion-text mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-notion-text mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-notion-text mb-2">
                Login as
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="input-field"
              >
                <option value="donor">Donor</option>
                <option value="receiver">Receiver</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-notion-text font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default Login;
