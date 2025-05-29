import { useEffect, useState, useRef } from "react";
import { Bell, Search, Users, Settings, MoreVertical, X, User, LogOut, UserPlus } from "lucide-react";
import FindUser from "./components/pages/Friends-User/FindUser";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import ChatList from "./components/pages/Chat/ChatList";
import { moodThemes } from "./components/store/theme";


const Home = () => {
    const [searchActive, setSearchActive] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [friends, setFriends] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const [userMood, setUserMood] = useState("default");
    const mood = userMood;
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;



    useEffect(() => {
        const fetchUserMood = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const res = await axios.get(`${BASE_URL}/auth/user`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const currentMood = res.data?.user?.currentMood || "default";
                setUserMood(currentMood);
            } catch (err) {
                console.error("Failed to fetch user mood.");
            }
        };

        fetchUserMood();
    }, []);


    useEffect(() => {
        const fetchFriends = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            try {
                const res = await axios.get(`${BASE_URL}/friends/friends-list`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFriends(res.data.friends || []);
            } catch (err) {
                console.error("Failed to fetch friends.");
            }
        };
        fetchFriends();
    }, []);

    const filteredFriends = friends.filter(friend =>
        friend.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    useEffect(() => {
        if (searchActive && inputRef.current) {
            inputRef.current.focus();
        }
    }, [searchActive]);

   // ✉️ Navigate to Chat Function
  const handleMessage = (friendId, friendUsername, friendProfileUrl) => {
  navigate(`/chat/${friendId}`, {
    state: {
      friendUsername,
      friendProfileUrl
    }
  });
};




    return (
        <div className={`${moodThemes[mood]?.bg} px-4 py-3 shadow-sm relative h-screen`}>
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold text-purple-600 flex items-center gap-2">
                    <span className="bg-purple-100 text-purple-600 p-1 rounded-full">💬</span>
                    Baat-Cheet
                </h1>

                <div className="flex items-center gap-4 text-gray-500 relative">
                    {/* Search Input */}
                    <div className="relative transition-all duration-300">
                        <div className="flex items-center space-x-2">
                            <div
                                className={`transition-all duration-300 ease-in-out ${searchActive ? "w-48 opacity-100" : "w-0 opacity-0"
                                    } overflow-hidden`}
                            >
                                <input
                                    type="text"
                                    ref={inputRef}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search friends..."
                                    className="px-3 py-1 w-full text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                                />
                            </div>
                            {!searchActive ? (
                                <Search
                                    className="w-5 h-5 cursor-pointer"
                                    onClick={() => setSearchActive(true)}
                                />
                            ) : (
                                <X
                                    className="w-5 h-5 cursor-pointer"
                                    onClick={() => {
                                        setSearchActive(false);
                                        setSearchTerm("");
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Friends Icon */}
                    <Link to="/friends">
                        <Users className="w-5 h-5 cursor-pointer" />
                    </Link>

                    {/* Settings Dropdown */}
                    <div className="relative">
                        <Settings
                            className="w-5 h-5 cursor-pointer"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        />
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50 py-2 text-sm text-gray-700">
                                <Link
                                    to="/profile"
                                    className="flex items-center px-4 py-2 hover:bg-gray-100"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    <User className="w-4 h-4 mr-2" />
                                    Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center w-full px-4 py-2 hover:bg-gray-100"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Horizontal Scroll Section */}
            <div className="flex gap-4 overflow-x-auto pb-2" >
                <div className="flex flex-col items-center text-sm text-gray-700">
                    <FindUser />
                </div>

                {(searchActive ? filteredFriends : friends).map((friend, idx) => (
                    <div key={idx} className="relative flex flex-col items-center text-sm text-gray-700" onClick={() => handleMessage(friend._id, friend.username, friend.profileUrl)}>
                        <div className="relative">
                            {friend.profileUrl ? (
                                <img
                                    src={friend.profileUrl}
                                    alt={friend.username}
                                    className="w-16 h-16 rounded-full object-cover border-2 border-purple-400"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-purple-400 to-blue-400 flex items-center justify-center text-white">
                                    <span className="text-base">{friend.username?.slice(0, 2).toUpperCase()}</span>
                                </div>
                            )}
                            <MoreVertical className="absolute top-0 -right-2 w-4 h-4 text-gray-600" />
                        </div>

                        <span className="text-gray-900 font-bold text-sm">{friend.username}</span>
                    </div>
                ))}
            </div>

            <ChatList />
        </div>
    );
};

export default Home;
