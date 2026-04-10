import React, { useState, useEffect } from "react";
import { donationAPI, requestAPI } from "../services/api";

const ReceiverDashboard = () => {
  const [availableDonations, setAvailableDonations] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
    // Auto-refresh every 30 seconds to check for updates
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [donationsRes, requestsRes] = await Promise.all([
        donationAPI.getAll(),
        requestAPI.getMyRequests(),
      ]);
      setAvailableDonations(donationsRes.data);
      setMyRequests(requestsRes.data);
    } catch (err) {
      setError("Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (donationId) => {
    try {
      await requestAPI.create({ donationId });
      alert("Request sent successfully!");
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create request");
    }
  };

  // Count approved requests for notification
  const approvedCount = myRequests.filter(
    (r) => r.status === "approved",
  ).length;

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
        <h1 className="text-3xl font-bold text-notion-text">
          Receiver Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Browse and request available food donations
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Notification Banner for Approved Requests */}
      {approvedCount > 0 && (
        <div className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-green-800 font-semibold">
                🎉 {approvedCount} Request{approvedCount > 1 ? "s" : ""}{" "}
                Approved!
              </h3>
              <p className="text-green-700 text-sm mt-1">
                Your pickup request{approvedCount > 1 ? "s have" : " has"} been
                approved by the donor. Check "My Requests" below for pickup
                details.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* My Requests Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">My Requests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myRequests.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 py-8">
              No requests yet. Browse available donations below to make a
              request.
            </p>
          ) : (
            myRequests.map((request) => (
              <div
                key={request.id}
                className={`border rounded-lg p-4 ${
                  request.status === "approved"
                    ? "border-green-500 bg-green-50 shadow-lg"
                    : "border-notion-border"
                }`}
              >
                {request.status === "approved" && (
                  <div className="mb-3 flex items-center gap-2 text-green-700">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="font-semibold text-sm">
                      APPROVED - Ready for Pickup!
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{request.food_name}</h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      request.status === "approved"
                        ? "bg-green-100 text-green-800 ring-2 ring-green-500"
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

                <div className="space-y-1 text-sm text-gray-600 mb-2">
                  <p>
                    <span className="font-medium">Quantity:</span>{" "}
                    {request.quantity}
                  </p>
                  <p>
                    <span className="font-medium">From:</span>{" "}
                    {request.donor_name}
                  </p>
                </div>

                {request.status === "approved" && (
                  <div className="mt-3 p-3 bg-white border border-green-200 rounded-lg">
                    <p className="text-xs font-semibold text-green-800 mb-2">
                      📍 Pickup Information:
                    </p>
                    <p className="text-xs text-gray-700">
                      Contact the donor to arrange pickup
                    </p>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  Requested: {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Available Donations Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Available Donations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableDonations.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 py-12">
              No donations available at the moment. Check back later!
            </p>
          ) : (
            availableDonations.map((donation) => (
              <div
                key={donation.id}
                className="border border-notion-border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold mb-3">
                  {donation.food_name}
                </h3>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>
                    <span className="font-medium">Quantity:</span>{" "}
                    {donation.quantity}
                  </p>
                  <p>
                    <span className="font-medium">Expires in:</span>{" "}
                    {donation.expiry_time}
                  </p>
                  <p>
                    <span className="font-medium">Posted at:</span>{" "}
                    {new Date(donation.created_at).toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium">Donor:</span>{" "}
                    {donation.donor_name}
                  </p>
                  <p>
                    <span className="font-medium">Location:</span>{" "}
                    {donation.location}
                  </p>
                  {donation.donor_phone && (
                    <p>
                      <span className="font-medium">Contact:</span>{" "}
                      {donation.donor_phone}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleRequest(donation.id)}
                  className="w-full px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                  Request Pickup
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiverDashboard;
