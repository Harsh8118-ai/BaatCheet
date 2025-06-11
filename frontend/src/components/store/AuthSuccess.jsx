import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import ProfileModal from "./ProfileModal";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    const username = searchParams.get("username");

    if (token) {
      try {
        console.log(token)
        localStorage.setItem("token", token);
        const decoded = jwtDecode(token);
        const userId = decoded.id;
        localStorage.setItem("userId", userId);

        const newUser = { id: userId, username };
        setUser(newUser);

        // Fetch user details to check if profile photo exists
        axios
          .get(`${BASE_URL}/auth/user`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })
          .then((res) => {
            const userData = res.data.user;
            if (!userData.profileUrl) {
              setProfileModalOpen(true);
            } else {
              navigate("/home");
            }

          })
          .catch((err) => {
            console.error("Failed to fetch user details:", err);
            navigate("/home");
          });
      } catch (error) {
        console.error("❌ Invalid Token:", error);
        localStorage.removeItem("token");
        navigate("/");
      }
    } else {
      console.warn("⚠ No token found in URL");
      navigate("/");
    }
  }, [searchParams, navigate]);

  return (
    <>
      <h1>Welcome, {user?.username || "Guest"}!</h1>

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => {
          setProfileModalOpen(false);
          navigate("/home");
        }}
        userId={user?.id}
        onProfileUploaded={(url) => {
          console.log("✅ Profile photo uploaded:", url);
          navigate("/home");
        }}
      />
    </>
  );
};

export default AuthSuccess;
