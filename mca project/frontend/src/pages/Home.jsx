import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 bg-gradient-to-b from-white to-notion-gray">
      <div className="text-center max-w-4xl w-full">
        <h1 className="text-6xl font-bold mb-6 text-notion-text tracking-tight">
          ShareAbite
        </h1>
        <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto">
          Connecting donors and receivers to reduce food wastage. Join
          restaurants, individuals, NGOs, and volunteers in making a difference.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link to="/register" className="btn-primary text-lg px-10 py-4">
            Get Started
          </Link>
          <Link to="/login" className="btn-secondary text-lg px-10 py-4">
            Sign In
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
          <div className="card text-center w-64">
            <div className="text-3xl mb-3">🍕</div>
            <h3 className="font-semibold text-lg mb-2">For Donors</h3>
            <p className="text-sm text-gray-600">
              Share surplus food and reduce waste
            </p>
          </div>
          <div className="card text-center w-64">
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="font-semibold text-lg mb-2">For Receivers</h3>
            <p className="text-sm text-gray-600">
              Access free food donations nearby
            </p>
          </div>
        </div>
      </div>

      <footer className="w-full text-center py-6 mt-16 text-gray-500 border-t border-notion-border">
        <p>&copy; {new Date().getFullYear()} ShareAbite. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
