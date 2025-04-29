import { useState } from "react";
import axios from "axios";

const OTPVerification = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);

  const sendOTP = async () => {
    try {
      await axios.post("http://localhost:5000/api/otp/send-otp", { email });
      setIsOtpSent(true);
      alert("OTP sent successfully!");
    } catch (error) {
      alert("Error sending OTP");
    }
  };

  const verifyOTP = async () => {
    try {
      await axios.post("http://localhost:5000/api/otp/verify-otp", { email, otp });
      alert("OTP verified successfully!");
    } catch (error) {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="p-5 flex flex-col items-center">
      <h2 className="text-2xl font-bold">OTP Verification</h2>
      
      {!isOtpSent ? (
        <>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 m-2"
          />
          <button onClick={sendOTP} className="gradient
 text-white px-4 py-2">Send OTP</button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="border p-2 m-2"
          />
          <button onClick={verifyOTP} className="gradient
 text-white px-4 py-2">Verify OTP</button>
        </>
      )}
    </div>
  );
};

export default OTPVerification;
