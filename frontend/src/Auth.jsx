import React, { useState } from 'react';
import Login from './components/pages/Login';
import Signup from './components/pages/Signup';


const Auth = () => { 
  const [activeTab, setActiveTab] = useState('login');
 
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-950 text-black font-sans px-4">
    
      {/* Logo and Branding */} 
      <div className="text-center mb-6 transition-all duration-300 ease-in-out">
        <div className="flex justify-center items-center space-x-3">
          <img
            src="https://res.cloudinary.com/dpnykjono/image/upload/v1751043740/ChatGPT_Image_Jun_26_2025_07_52_05_PM-Photoroom_rmi2vk.png" alt="BaatCheet Logo" className="w-16 h-w-16 sm:w-22 sm:h-22 object-contain" />
          <h1 className="text-5xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">Baat<span></span>Cheet</h1>
        </div>
        <p className="text-gray-500 mt-2 text-lg sm:text-base ">Connect with friends instantly</p>
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

export default Auth;
