import React, { useState, useEffect } from "react";
import { restaurantAPI, donationAPI, requestAPI } from "../services/api";

const DonorDashboard = () => {
  const [activeTab, setActiveTab] = useState("donations"); // 'donations' or 'requests'
  const [restaurantRegistered, setRestaurantRegistered] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showEditRestaurant, setShowEditRestaurant] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [restaurantData, setRestaurantData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    type: "restaurant",
  });

  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);

  const [formData, setFormData] = useState({
    foodName: "",
    quantity: "",
    expiryTime: "",
    imageUrl: "",
  });

  useEffect(() => {
    checkRestaurant();
  }, []);

  const checkRestaurant = async () => {
    try {
      const response = await restaurantAPI.get();
      setRestaurantData(response.data);
      setRestaurantRegistered(true);
      loadData();
    } catch (err) {
      if (err.response?.status === 404) {
        setRestaurantRegistered(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [donationsRes, requestsRes] = await Promise.all([
        donationAPI.getMyDonations(),
        donationAPI.getRequests(),
      ]);
      setDonations(donationsRes.data);
      setRequests(requestsRes.data);
    } catch (err) {
      console.error("Load data error:", err);
    }
  };

  const handleRestaurantSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (showEditRestaurant) {
        await restaurantAPI.update(restaurantData);
        alert("Restaurant details updated successfully!");
        setShowEditRestaurant(false);
      } else {
        await restaurantAPI.register(restaurantData);
        setRestaurantRegistered(true);
      }
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      setError("Please upload an image for the donation.");
      return;
    }
    setError("");

    try {
      await donationAPI.create(formData);
      setFormData({ foodName: "", quantity: "", expiryTime: "", imageUrl: "" });
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create donation");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append("image", file);

    setUploading(true);
    try {
      const response = await import("../services/api").then((m) =>
        m.uploadAPI.uploadImage(uploadFormData),
      );
      setFormData({ ...formData, imageUrl: response.data.imageUrl });
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this donation?")) {
      try {
        await donationAPI.delete(id);
        loadData();
      } catch (err) {
        alert("Failed to delete donation");
      }
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await requestAPI.updateStatus(requestId, "approved");
      alert("Request approved successfully!");
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve request");
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (window.confirm("Are you sure you want to reject this request?")) {
      try {
        await requestAPI.updateStatus(requestId, "rejected");
        loadData();
      } catch (err) {
        alert("Failed to reject request");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!restaurantRegistered) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-white via-notion-gray to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-notion-text mb-2">
              Register Your Restaurant
            </h1>
            <p className="text-gray-600">
              Please register your restaurant details before adding food
              donations
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="card shadow-card-hover">
            <form onSubmit={handleRestaurantSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-notion-text mb-2">
                  Restaurant/Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={restaurantData.name}
                  onChange={(e) =>
                    setRestaurantData({
                      ...restaurantData,
                      name: e.target.value,
                    })
                  }
                  className="input-field"
                  placeholder="e.g., Spice Garden, Tasty Treats, Ocean Breeze"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-notion-text mb-2">
                  Type *
                </label>
                <select
                  value={restaurantData.type}
                  onChange={(e) =>
                    setRestaurantData({
                      ...restaurantData,
                      type: e.target.value,
                    })
                  }
                  className="input-field"
                >
                  <option value="restaurant">Restaurant</option>
                  <option value="cafe">Cafe</option>
                  <option value="bakery">Bakery</option>
                  <option value="mess">Mess</option>
                  <option value="grocery">Grocery Store</option>
                  <option value="individual">Individual</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-notion-text mb-2">
                  Address *
                </label>
                <textarea
                  required
                  value={restaurantData.address}
                  onChange={(e) =>
                    setRestaurantData({
                      ...restaurantData,
                      address: e.target.value,
                    })
                  }
                  className="input-field"
                  placeholder="Full address with city and pincode"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-notion-text mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={restaurantData.phone}
                    onChange={(e) =>
                      setRestaurantData({
                        ...restaurantData,
                        phone: e.target.value,
                      })
                    }
                    className="input-field"
                    placeholder="10-digit mobile number"
                    pattern="[0-9]{10}"
                    title="Please enter a 10-digit mobile number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-notion-text mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={restaurantData.email}
                    onChange={(e) =>
                      setRestaurantData({
                        ...restaurantData,
                        email: e.target.value,
                      })
                    }
                    className="input-field"
                    placeholder="contact@restaurant.com"
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full">
                Register Restaurant
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-white to-notion-gray py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-notion-text">
              {restaurantData.name}
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your food donations and requests
            </p>
            <button
              onClick={() => {
                setShowEditRestaurant(true);
              }}
              className="mt-2 text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              Edit Restaurant Details
            </button>
          </div>
          {activeTab === "donations" && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary"
            >
              {showForm ? "Cancel" : "+ Add Donation"}
            </button>
          )}
        </div>

        {/* Edit Restaurant Modal */}
        {showEditRestaurant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Edit Restaurant Details</h2>
                <button
                  onClick={() => setShowEditRestaurant(false)}
                  className="text-gray-500 hover:text-black"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l18 18"
                    />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleRestaurantSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={restaurantData.name}
                    onChange={(e) =>
                      setRestaurantData({
                        ...restaurantData,
                        name: e.target.value,
                      })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={restaurantData.type}
                    onChange={(e) =>
                      setRestaurantData({
                        ...restaurantData,
                        type: e.target.value,
                      })
                    }
                    className="input-field"
                  >
                    <option value="restaurant">Restaurant</option>
                    <option value="cafe">Cafe</option>
                    <option value="bakery">Bakery</option>
                    <option value="mess">Mess</option>
                    <option value="grocery">Grocery Store</option>
                    <option value="individual">Individual</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={restaurantData.phone}
                      onChange={(e) =>
                        setRestaurantData({
                          ...restaurantData,
                          phone: e.target.value,
                        })
                      }
                      className="input-field"
                      pattern="[0-9]{10}"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={restaurantData.email}
                      onChange={(e) =>
                        setRestaurantData({
                          ...restaurantData,
                          email: e.target.value,
                        })
                      }
                      className="input-field"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Address *
                  </label>
                  <textarea
                    required
                    value={restaurantData.address}
                    onChange={(e) =>
                      setRestaurantData({
                        ...restaurantData,
                        address: e.target.value,
                      })
                    }
                    className="input-field"
                    rows="3"
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  Update Details
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-notion-border">
          <button
            onClick={() => setActiveTab("donations")}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === "donations"
                ? "border-b-2 border-black text-notion-text"
                : "text-gray-500 hover:text-notion-text"
            }`}
          >
            My Donations ({donations.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === "requests"
                ? "border-b-2 border-black text-notion-text"
                : "text-gray-500 hover:text-notion-text"
            }`}
          >
            Pickup Requests ({requests.length})
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Donations Tab */}
        {activeTab === "donations" && (
          <>
            {showForm && (
              <div className="mb-8 card shadow-card">
                <h2 className="text-2xl font-semibold mb-6">
                  Add Food Donation
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-notion-text mb-2">
                        Food Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.foodName}
                        onChange={(e) =>
                          setFormData({ ...formData, foodName: e.target.value })
                        }
                        className="input-field"
                        placeholder="e.g., Pizza, Sandwiches"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-notion-text mb-2">
                        Quantity
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({ ...formData, quantity: e.target.value })
                        }
                        className="input-field"
                        placeholder="e.g., 10 pieces, 5 kg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-notion-text mb-2">
                        Expiry Time
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.expiryTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            expiryTime: e.target.value,
                          })
                        }
                        className="input-field"
                        placeholder="e.g., 2 hours, 1 day"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-notion-text mb-2">
                        Food Image *
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="input-field pt-2"
                        required={!formData.imageUrl}
                      />
                      {uploading && (
                        <p className="text-xs text-blue-600 mt-1">
                          Uploading image...
                        </p>
                      )}
                      {formData.imageUrl && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Image uploaded successfully
                        </p>
                      )}
                    </div>
                  </div>

                  <button type="submit" className="btn-primary">
                    Submit Donation
                  </button>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {donations.length === 0 ? (
                <p className="col-span-full text-center text-gray-500 py-12">
                  No donations yet. Click "Add Donation" to create your first
                  donation.
                </p>
              ) : (
                donations.map((donation) => (
                  <div key={donation.id} className="card">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold">
                        {donation.food_name}
                      </h3>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          donation.status === "available"
                            ? "bg-green-100 text-green-800"
                            : donation.status === "requested"
                              ? "bg-yellow-100 text-yellow-800"
                              : donation.status === "completed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {donation.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p>
                        <span className="font-medium">Quantity:</span>{" "}
                        {donation.quantity}
                      </p>
                      <p>
                        <span className="font-medium">Expires in:</span>{" "}
                        {donation.expiry_time}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(donation.id)}
                        className="flex-1 text-sm py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <p className="text-center text-gray-500 py-12">
                No pickup requests yet. Requests will appear here when receivers
                request your donations.
              </p>
            ) : (
              requests.map((request) => (
                <div
                  key={request.id}
                  className={`card ${request.status === "approved" ? "border-2 border-green-500" : ""}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {request.food_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        from {request.restaurant_name}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        request.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : request.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : request.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">
                        Donation Details
                      </h4>
                      <p className="text-sm text-gray-600">
                        Quantity: {request.quantity}
                      </p>
                      <p className="text-sm text-gray-600">
                        Expires: {request.expiry_time}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2">
                        Receiver Details
                      </h4>
                      <p className="text-sm text-gray-600">
                        Name: {request.receiver_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Email: {request.receiver_email}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Requested:{" "}
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {request.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Approve Pickup
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {request.status === "approved" && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                      ✓ Pickup approved! Receiver has been notified.
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;
