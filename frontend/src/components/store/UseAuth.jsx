import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export function useAuth() {
  const [user, setUser] = useState(null);
  const [inviteCode, setInviteCode] = useState(null);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const generateInviteCode = (userId) => {
    const last6Chars = userId.slice(-6);
    let numericCode = parseInt(last6Chars, 16) % 1000000;
    return `${numericCode.toString().padStart(6, "0")}`;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("⚠️ No token found in localStorage");
        if (!["/", "/login", "/signup"].includes(location.pathname)) {
          navigate("/login");
        }
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/auth/user`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            setUser(null);
            if (!["/", "/login", "/signup"].includes(location.pathname)) {
              navigate("/login");
            }
            return;
          }
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.user || !data.user._id) {
          throw new Error("Invalid response: user ID not found");
        }

        const userInviteCode = data.user.inviteCode;
        setUser(data.user);
        setInviteCode(userInviteCode);
        localStorage.setItem("inviteCode", userInviteCode);

        // 👉 Fetch question stats AFTER setting user
        fetchUserQuestionStats(data.user._id);
      } catch (error) {
        console.error("❌ Error fetching user:", error.message);
        if (!["/", "/login", "/signup"].includes(location.pathname)) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchUserQuestionStats = async (userId) => {
      try {
        const response = await axios.get(`${BASE_URL}/ques/user/${userId}`, {
          params: { viewerId: userId },
        });

        const userQuestions = response.data.questions || [];
        setQuestionsCount(userQuestions.length); // ✅ Set count
      } catch (error) {
        console.error("Error fetching user questions:", error.message);
        setQuestionsCount(0); // fallback
      }
    };

    fetchUserData();
  }, [navigate, location.pathname]);

  return { user, inviteCode, loading, questionsCount };
}
