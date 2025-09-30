import React, { useState } from 'react';
import Signup from './components/pages/Signup';


const Auth = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-950 text-black font-sans px-4">

      <div className="text-center mb-6 transition-all duration-300 ease-in-out">
        <div className="flex justify-center items-center space-x-3">
          <img
            src="https://res.cloudinary.com/dpnykjono/image/upload/v1751043740/ChatGPT_Image_Jun_26_2025_07_52_05_PM-Photoroom_rmi2vk.png" alt="BaatCheet Logo" className="w-16 h-w-16 sm:w-22 sm:h-22 object-contain" />
          <h1 className="text-5xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">Baat<span></span>Cheet</h1>
        </div>
        <p className="text-gray-500 mt-2 text-lg sm:text-base ">Connect with friends instantly</p>
      </div>

      <div className="w-full max-w-md bg-gray-950 rounded-xl shadow-md px-5 transition-all duration-300 ease-in-out">
        <Signup />
      </div>

      <div className="mt-16 text-center space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-200 text-balance">Ready to start chatting?</h2>
        <p className="text-slate-400 max-w-md mx-auto">Login and connect with your friends in seconds</p>
      </div>

      {/* Footer  */}
      <footer className="border-t border-slate-800 bottom-0 fixed">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-md text-slate-500">© 2025 BaatCheet. All rights reserved.</p>
          </div>
        </div>
      </footer> 
    </div>


  );
};

export default Auth;
