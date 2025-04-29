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

const PublicQues = () => {
  const { user } = useAuth();
  const [PublicQuestions, setPublicQuestions] = useState([]);
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
    if (user) {
      fetchPublicQuestions();
    } else {
      setLoading(false);
    }
  }, [user]);


  const fetchPublicQuestions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/ques/public`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch public questions");
      }

      const data = await response.json();
      


      if (data.length === 0) {
        setPublicQuestions([{ _id: "1", question: "Test Question", likes: 0, username: "Admin", createdAt: new Date(), answers: [] }]);
      } else {
        setPublicQuestions(data);
        fetchAnswersCount(data);
      }
    } catch (error) {
      console.error("Error fetching public questions:", error);
      setError("Failed to load questions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = PublicQuestions.filter(
    (q) =>
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "All" ||
        (Array.isArray(q.tags) && q.tags.includes(selectedCategory)))
  );





  const likeQuestion = async (questionId, isLiked) => {
    if (!user) return alert("Please log in to like questions");

    // Optimistically update the UI
    setPublicQuestions((prev) =>
      prev.map((q) => {
        if (q._id === questionId) {

          // Update likes count
          const currentLikesCount = typeof q.likes === 'number' ? q.likes : 0;
          const newLikesCount = isLiked ? Math.max(0, currentLikesCount - 1) : currentLikesCount + 1;

          // Update likedByUser array
          let newLikedByUser = Array.isArray(q.likedByUser) ? [...q.likedByUser] : [];
          if (isLiked) {
            newLikedByUser = newLikedByUser.filter(id => id !== user._id);
          } else if (!newLikedByUser.includes(user._id)) {
            newLikedByUser.push(user._id);
          }

          return {
            ...q,
            likes: newLikesCount,
            likedByUser: newLikedByUser
          };
        }
        return q;
      })
    );

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/ques/${questionId}/like`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user._id }),
      });

      if (!response.ok) throw new Error("Failed to like/unlike question");

      const data = await response.json();
      console.log("Updated likes:", data);

      // Update with server response data
      setPublicQuestions((prev) =>
        prev.map((q) => {
          if (q._id === questionId) {

            // Make sure we're using the likes count from the server
            const likesFromServer = typeof data.likes === 'number' ? data.likes : 0;

            // Keep track of liked status for this user
            const updatedLikedByUser = isLiked
              ? (Array.isArray(q.likedByUser) ? q.likedByUser.filter(id => id !== user._id) : [])
              : (Array.isArray(q.likedByUser) ? [...q.likedByUser, user._id] : [user._id]);

            return {
              ...q,
              likes: likesFromServer,
              likedByUser: updatedLikedByUser
            };
          }
          return q;
        })
      );
    } catch (error) {
      console.error("Error liking/unliking question:", error);

      fetchPublicQuestions();
    }
  };

  const fetchAnswersCount = async (questions) => {
    try {
      const updatedQuestions = await Promise.all(
        questions.map(async (q) => {
          const answerResponse = await fetch(`${BASE_URL}/ques/${q._id}/answer`);
          if (!answerResponse.ok) throw new Error(`Failed to fetch answers for ${q._id}`);
  
          const answerData = await answerResponse.json();
          
          return { 
            ...q, 
            answers: answerData.answers || []
          };
        })
      );
  
      setPublicQuestions(updatedQuestions); 
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
        filteredQuestions.map((q, index) => (
          <QuestionCard
            key={`${q._id}-${index}`}
            title={q.question}
            author={q.username}
            time={new Date(q.createdAt).toLocaleDateString()}
            answerPreview={q.answers?.length > 0 ? q.answers[0]?.text : "No answers yet."}
            likes={q.likes || 0}
            tags={q.tags || ["General"]}
            tagColor="purple"
            isLiked={user && q.likedByUser?.includes(user._id)}
            onLike={() => likeQuestion(q._id, user && q.likedByUser?.includes(user._id))}
            onAnswer={() => setSelectedQuestion(q)}
          />
        ))
      ) : (
        <p className="text-gray-400">No questions match your search.</p>
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

export default PublicQues;

