import React, { useState, useEffect, useMemo, useCallback } from "react";
import { adminAPI } from "../services/api";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users"); // 'users', 'restaurants', 'stats'
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    activeDonors: 0,
    activeReceivers: 0,
    pendingApprovals: 0,
    totalRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editingRestaurant, setEditingRestaurant] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [usersRes, restaurantsRes, statsRes] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getRestaurants(),
        adminAPI.getStats(),
      ]);
      setUsers(usersRes.data);
      setRestaurants(restaurantsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError("Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const pieData = useMemo(
    () => [
      { name: "Active Donors", value: stats.activeDonors },
      { name: "Active Receivers", value: stats.activeReceivers },
      { name: "Pending", value: stats.pendingApprovals },
    ],
    [stats.activeDonors, stats.activeReceivers, stats.pendingApprovals],
  );

  const barData = useMemo(
    () => [
      { name: "Total Donations", count: stats.totalDonations },
      { name: "Active Donors", count: stats.activeDonors },
      { name: "Receivers", count: stats.activeReceivers },
    ],
    [stats.totalDonations, stats.activeDonors, stats.activeReceivers],
  );

  const handleApprove = async (userId) => {
    try {
      await adminAPI.approveUser(userId);
      loadData();
    } catch (err) {
      alert("Failed to approve user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await adminAPI.deleteUser(userId);
        loadData();
      } catch (err) {
        alert("Failed to delete user");
      }
    }
  };

  const handleUpdateUser = async (userId, data) => {
    try {
      await adminAPI.updateUser(userId, data);
      setEditingUser(null);
      loadData();
    } catch (err) {
      alert("Failed to update user");
    }
  };

  const handleDeleteRestaurant = async (restaurantId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this restaurant? This will also delete all associated donations.",
      )
    ) {
      try {
        await adminAPI.deleteRestaurant(restaurantId);
        loadData();
      } catch (err) {
        alert("Failed to delete restaurant");
      }
    }
  };

  const handleUpdateRestaurant = async (restaurantId, data) => {
    try {
      await adminAPI.updateRestaurant(restaurantId, data);
      setEditingRestaurant(null);
      loadData();
    } catch (err) {
      alert("Failed to update restaurant");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-notion-text">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Manage users, restaurants, and monitor system activities
        </p>
      </div>
      <button
        onClick={() => {
          setLoading(true);
          loadData();
        }}
        className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors bg-white shadow-sm font-medium"
      >
        <svg
          className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Refresh Data
      </button>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="border border-notion-border rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-1">Total Donations</p>
          <p className="text-3xl font-bold">{stats.totalDonations}</p>
        </div>
        <div className="border border-notion-border rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-1">Active Donors</p>
          <p className="text-3xl font-bold">{stats.activeDonors}</p>
        </div>
        <div className="border border-notion-border rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-1">Active Receivers</p>
          <p className="text-3xl font-bold">{stats.activeReceivers}</p>
        </div>
        <div className="border border-notion-border rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-1">Pending Approvals</p>
          <p className="text-3xl font-bold text-yellow-600">
            {stats.pendingApprovals}
          </p>
        </div>
        <div className="border border-notion-border rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-1">Total Requests</p>
          <p className="text-3xl font-bold">{stats.totalRequests || 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-notion-border">
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === "users"
              ? "border-b-2 border-black text-notion-text"
              : "text-gray-500 hover:text-notion-text"
          }`}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("restaurants")}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === "restaurants"
              ? "border-b-2 border-black text-notion-text"
              : "text-gray-500 hover:text-notion-text"
          }`}
        >
          Restaurants ({restaurants.length})
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === "stats"
              ? "border-b-2 border-black text-notion-text"
              : "text-gray-500 hover:text-notion-text"
          }`}
        >
          Analytics
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="border border-notion-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-notion-gray">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-notion-border">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-notion-gray transition-colors"
                  >
                    <td className="px-6 py-4 text-sm">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="capitalize">{user.role}</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.approved
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {user.approved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        {!user.approved && (
                          <button
                            onClick={() => handleApprove(user.id)}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Restaurants Tab */}
      {activeTab === "restaurants" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 py-12">
              No restaurants registered yet
            </p>
          ) : (
            restaurants.map((restaurant) => (
              <div key={restaurant.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{restaurant.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">
                      {restaurant.type}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>
                    <span className="font-medium">Owner:</span>{" "}
                    {restaurant.owner_name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {restaurant.owner_email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {restaurant.phone}
                  </p>
                  <p>
                    <span className="font-medium">Address:</span>{" "}
                    {restaurant.address}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-notion-gray rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Total Donations</p>
                    <p className="text-xl font-bold">
                      {restaurant.total_donations || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Active</p>
                    <p className="text-xl font-bold text-green-600">
                      {restaurant.active_donations || 0}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeleteRestaurant(restaurant.id)}
                    className="flex-1 text-sm py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "stats" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <div className="card shadow-sm border border-notion-border">
            <h3 className="text-lg font-semibold mb-6">User Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={1000}
                  >
                    <Cell fill="#4ade80" />
                    <Cell fill="#60a5fa" />
                    <Cell fill="#facc15" />
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="card shadow-sm border border-notion-border">
            <h3 className="text-lg font-semibold mb-6">Platform Statistics</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]}>
                    <Cell fill="#10b981" />
                    <Cell fill="#3b82f6" />
                    <Cell fill="#8b5cf6" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
