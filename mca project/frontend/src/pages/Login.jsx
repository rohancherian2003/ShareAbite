import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const Toast = ({ message, onClose }) => {
  const isEmailError = message.toLowerCase().includes("email");
  const isRoleError = message.toLowerCase().includes("role");
  
  let title = "Login Error";
  let icon = "⚠️";

  if (isEmailError) {
    title = "Invalid Email";
    icon = "📧";
  } else if (isRoleError) {
    title = "Invalid Role";
    icon = "👤";
  } else if (message.toLowerCase().includes("password")) {
    title = "Invalid Password";
    icon = "🔒";
  }
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
  const [showPassword, setShowPassword] = useState(false);

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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="input-field w-full pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
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
