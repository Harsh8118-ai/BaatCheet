import React, { useEffect, useState } from "react";
import QuestionCard from "./QuestionCard";
import { useAuth } from "../../store/UseAuth";
import { QuestionModal } from "./QuestionModal";
import SearchBar from "./SearchBar";
import CategoryFilter from "./CategoryFilter";
import { FaSearch, FaPlus } from "react-icons/fa";
import { AddQuestionModal } from "./AddQuestionModal";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";



const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const TrendingQues = () => {
    const { user } = useAuth();
    const [trendingQuestions, setTrendingQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [open, setOpen] = useState(false);
    const [newQuestion, setNewQuestion] = useState({ title: "", answer: "", tags: "" });

    useEffect(() => {
        AOS.init({ duration: 800 });
    }, []);

    const addQuestion = () => {
        setQuestions([...questions, newQuestion]);
        setNewQuestion({ title: "", answer: "", tags: "" });
        setOpen(false);
    };


    useEffect(() => {
        const fetchTrendingQuestions = async () => {
            try {
                const response = await fetch(`${BASE_URL}/ques/trending`);
                if (!response.ok) {
                    throw new Error("Failed to fetch trending questions");
                }

                const data = await response.json();
                

                // Ensure each question has the correct data structure
                const formattedData = Array.isArray(data) ? data.map(q => ({
                    ...q,
                    likes: typeof q.likes === 'number' ? q.likes : (
                        Array.isArray(q.likes) ? q.likes.length : 0
                    ),
                    likedByUser: Array.isArray(q.likedByUser) ? q.likedByUser : []
                })) : [];

                setTrendingQuestions(formattedData);
                fetchAnswersCount(formattedData);
                setLoading(false);

            } catch (error) {
                console.error("Error fetching trending questions:", error);
                setError("Failed to load questions.");
                setLoading(false);
            }
        };

        fetchTrendingQuestions();
    }, []);

    const filteredQuestions = trendingQuestions.filter(
        (q) =>
            q.question.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (selectedCategory === "All" ||
                (Array.isArray(q.tags) && q.tags.includes(selectedCategory)))
    );

    const likeQuestion = async (questionId, isLiked) => {
        if (!user) return alert("Please log in to like questions");

        // Optimistically update the UI by toggling the like count
        setTrendingQuestions((prev) =>
            prev.map((q) =>
                q._id === questionId
                    ? { ...q, likes: isLiked ? q.likes - 1 : q.likes + 1 }
                    : q
            )
        );

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`${BASE_URL}/ques/${questionId}/like`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId: user._id }), // ✅ Send userId
            });

            if (!response.ok) throw new Error("Failed to like/unlike question");

            const data = await response.json();
            console.log("Updated likes:", data.likes);

            // After receiving the response, update the like count with the actual data from the server
            setTrendingQuestions((prev) =>
                prev.map((q) =>
                    q._id === questionId ? { ...q, likes: data.likes } : q
                )
            );
        } catch (error) {
            console.error("Error liking/unliking question:", error);

            // In case of error, revert the optimistic update
            setTrendingQuestions((prev) =>
                prev.map((q) =>
                    q._id === questionId
                        ? { ...q, likes: isLiked ? q.likes + 1 : q.likes - 1 }
                        : q
                )
            );
        }
    };

    const fetchAnswersCount = async (questions) => {
        try {
            const updatedQuestions = await Promise.all(
                questions.map(async (q) => {
                    const answerResponse = await fetch(`${BASE_URL}/ques/${q._id}/answer`);
                    const answerData = await answerResponse.json();
                    return { ...q, answers: answerData.answers?.length || 0, answer: answerData.answers || [] };
                })
            );

            setTrendingQuestions(updatedQuestions);
        } catch (error) {
            console.error("Error fetching answers count:", error);
        }
    };

    if (loading) return <p className="text-gray-400">Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="space-y-4 py-4">

            {/* ✅ Search + Category Filter */}
            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 w-full">
                
                {/* 🔍 Search Bar (Full width on small screens, shrinks on large screens) */}
                <div className="flex-1 min-w-[200px]">
                    <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </div>

                {/* ➕ Add Question Button (Responsive, scales well) */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setOpen(true)}
                    className="gradient text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center gap-2 shadow-lg transition-all duration-300"
                >
                    <FaPlus className="text-sm sm:text-base" /> Add Question
                </motion.button>
            </div>

            <CategoryFilter selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />



            {filteredQuestions.length > 0 ? (
        filteredQuestions.map((q, index) => {
                    // Check if user has liked this question
                    const isLiked = user && Array.isArray(q.likedByUser) && q.likedByUser.includes(user._id);

                    return (
                        <QuestionCard
                            key={`${q._id}-${index}`}
                            title={q.question}
                            author={q.username}
                            time={new Date(q.createdAt).toLocaleDateString()}
                            answers={q.answers || 0}
                            likes={typeof q.likes === 'number' ? q.likes : 0}
                            tags={q.tags || "General"}
                            tagColor={"purple"}
                            isLiked={isLiked}
                            onLike={() => likeQuestion(q._id, isLiked)}
                            onAnswer={() => setSelectedQuestion(q)}
                            answerPreview={q.answer?.length > 0 ? q.answer[0]?.text : "No answers yet."}
                        />
                    );
                })
            ) : (
                <p className="text-gray-400">No public questions available.</p>
            )}

            {selectedQuestion && (
                    <QuestionModal
                      open={!!selectedQuestion}
                      setOpen={() => setSelectedQuestion(null)}
                      question={selectedQuestion}
                    />
                  )}
            
                  {/* ➕ Add Question Modal */}
                  <AddQuestionModal
                    open={open}
                    setOpen={setOpen}
                    newQuestion={newQuestion}
                    setNewQuestion={setNewQuestion}
                    addQuestion={addQuestion}
                  />
                </div>
            
    );
};

export default TrendingQues;