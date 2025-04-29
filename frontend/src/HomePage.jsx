import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowRight } from "lucide-react"
import AOS from "aos";
import "aos/dist/aos.css";
import TrendingQues from "./components/pages/Questions/TrendingQues";
import { AddQuestionModal } from "./components/pages/Questions/AddQuestionModal";
import FriendList from "./components/pages/Friends-User/FriendList";

const HomePage = () => {
  const [stats, setStats] = useState({ users: 0, questions: 0, answers: 0, experts: 0 });
  const [questions, setQuestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ title: "", answer: "", tags: "" });

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-in-out",
    });
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/stats`);
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, newQuestion]);
    setNewQuestion({ title: "", answer: "", tags: "" });
    setOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container py-6 space-y-8">
        <div className="flex flex-col space-y-2" data-aos="fade-down">
          <h1 className="text-4xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground">Your knowledge hub for questions, answers, and discussions</p>
        </div>
        {/* 🔥 Hero Section */}
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#09090B] via-[#0F0B1D] to-[#09090B] p-8 md:p-10 shadow-lg" data-aos="zoom-in">
          {/* Glowing Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(103,63,216,0.3),_rgba(9,9,11,0.8))] opacity-30"></div>

          <div className="grid gap-4 md:grid-cols-2 md:gap-8 relative">
            {/* Left Side */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Expand your knowledge network</h2>
              <p className="text-gray-300">
                Connect with experts, ask questions, and participate in discussions to grow your skills and knowledge.
              </p>
              <div className="flex gap-4 items-center">
                <Link to="/signup"><button className="gradient px-6 py-1 rounded-lg text-white w-fit" data-aos="fade-right">
                  Get Started
                </button></Link>
                <button className="bg-gray-800 px-6 py-1 rounded-lg text-white flex items-center gap-2 w-fit" data-aos="fade-left">
                  Learn More <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Right Side (Glows & Effects) */}
            <div className="hidden md:block relative">
              <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-purple-400 opacity-10 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-purple-600 opacity-10 blur-2xl"></div>
            </div>
          </div>
        </div>


        {/* 🎯 Main Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6">
          <div className="bg-gray-900 p-4 rounded-lg text-center" data-aos="fade-right" data-aos-delay="200">
            <h3 className="text-lg font-semibold">Ask a Question</h3>
            <p className="text-gray-400">Get answers from the community</p>
            <button className="bg-purple-500 px-4 py-2 mt-2 rounded-lg" onClick={() => setOpen(true)}>New Question</button>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg text-center" data-aos="fade-up" data-aos-delay="200">
            <h3 className="text-lg font-semibold">Join Discussions</h3>
            <p className="text-gray-400">Participate in public conversations</p>
            <Link to="/questions">
              <button className="bg-blue-500 px-4 py-2 mt-2 rounded-lg" >Browse Topics</button>
            </Link>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg text-center" data-aos="fade-left" data-aos-delay="400">
            <h3 className="text-lg font-semibold">Connect with Friends</h3>
            <p className="text-gray-400">Expand your knowledge network</p>
            <Link to="/friends">
              <button className="bg-purple-500 px-4 py-2 mt-2 rounded-lg" >Find Friends</button>
            </Link>
          </div>
        </div>

        {/* 📊 Statistics */}
        <div className="hidden sm:grid sm:grid-cols-4 gap-6 p-6 text-center">
          <div className="bg-gray-800 p-4 rounded-lg" data-aos="flip-up" data-aos-delay="0">
            <p className="text-2xl font-bold">{stats.users}+</p>
            <p className="text-gray-400">Active Users</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg" data-aos="flip-up" data-aos-delay="0">
            <p className="text-2xl font-bold">{stats.questions}+</p>
            <p className="text-gray-400">Questions</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg" data-aos="flip-up" data-aos-delay="0">
            <p className="text-2xl font-bold">{stats.answers}+</p>
            <p className="text-gray-400">Answers</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg" data-aos="flip-up" data-aos-delay="0">
            <p className="text-2xl font-bold">{stats.experts}+</p>
            <p className="text-gray-400">Experts</p>
          </div>
        </div>

        {/* 🔥 Trending Topics */}
        <div >
          <TrendingQues />
        </div>


        {/* 👫 Friends Section */}
        <div >
          <h2 className="text-2xl font-bold">Recent Friend Activity</h2>
          <div>
            <FriendList />
          </div>
        </div>


        {/* 💜 Join Community Section */}
        <div className="p-6 text-center bg-gradient-to-r from-purple-800 to-indigo-900 rounded-lg" >
          <h2 className="text-2xl font-bold">Ready to join our community?</h2>
          <p>Create an account to ask questions, participate in discussions, and connect with experts.</p>
          <div className="mt-4 flex gap-4 justify-center">
            <Link to="/signup">
              <button className="bg-purple-500 px-4 py-2 rounded-lg" >Sign Up</button>
            </Link>
            <Link to="/login">
              <button className="bg-gray-800 px-4 py-2 rounded-lg" >Login</button>
            </Link>
          </div>
        </div>

        {/* ➕ Add Question Modal */}
              <AddQuestionModal
                open={open}
                setOpen={setOpen}
                newQuestion={newQuestion}
                setNewQuestion={setNewQuestion}
                addQuestion={addQuestion}
              />
      </div>
    </div>
  );
};

export default HomePage;
