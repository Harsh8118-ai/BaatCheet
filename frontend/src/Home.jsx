import React, { useState } from 'react';
import Login from './components/pages/Login';
import Signup from './components/pages/Signup';


const Home = () => {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white text-black font-sans px-4">
      {/* Logo and Branding */}
      <div className="text-center mb-6 transition-all duration-300 ease-in-out">
        <h1 className="text-3xl font-bold">Chat<span className="text-black">Sync</span></h1>
        <p className="text-gray-500">Connect with friends instantly</p>
      </div>

      {/* Tabs */}
      <div className="w-full max-w-md mb-4 transition-all duration-300 ease-in-out">
        <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
          <button
            className={`w-1/2 py-2 transition-all duration-300 ${activeTab === 'login' ? 'bg-white shadow font-semibold' : 'text-gray-500'}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`w-1/2 py-2 transition-all duration-300 ${activeTab === 'signup' ? 'bg-white shadow font-semibold' : 'text-gray-500'}`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-md px-5 transition-all duration-300 ease-in-out">
        {activeTab === 'login' ? <Login /> : <Signup />}
      </div>
    </div>
  );
};

export default Home;
