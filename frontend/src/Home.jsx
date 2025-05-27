import React, { useState } from 'react';
import Login from './components/pages/Login';
import Signup from './components/pages/Signup';


const Home = () => {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-950 text-black font-sans px-4">
      {/* Logo and Branding */}
      <div className="text-center mb-6 transition-all duration-300 ease-in-out">
        <h1 className="text-3xl font-bold text-gray-200">Chat<span className="text-gray-200">Sync</span></h1>
        <p className="text-gray-500">Connect with friends instantly</p>
      </div>

      {/* Tabs */}
      <div className="w-full max-w-md mb-4 transition-all duration-300 ease-in-out">
        <div className="flex border border-white/10 rounded-lg overflow-hidden bg-gray-950">
          <button
            className={`w-1/2 py-2 transition-all duration-300 ${activeTab === 'login' ? 'bg-gray-800 shadow font-semibold text-gray-500' : 'text-gray-200'}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`w-1/2 py-2 transition-all duration-300 ${activeTab === 'signup' ? 'bg-gray-800 shadow font-semibold text-gray-500' : 'text-gray-200'}`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-md bg-gray-950 rounded-xl shadow-md px-5 transition-all duration-300 ease-in-out">
        {activeTab === 'login' ? <Login /> : <Signup />}
      </div>
    </div>
  );
};

export default Home;
