import React, { useEffect, useState } from "react";
import axios from "axios";
import MyQuestionCard from "./MyQuestionCard";
import { QuestionModal } from "./QuestionModal";
import SearchBar from "./SearchBar";
import CategoryFilter from "./CategoryFilter";
import { FaSearch, FaPlus } from "react-icons/fa"; // Icons
import { AddQuestionModal } from "./AddQuestionModal";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;


const MyQues = ({ userId }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
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


  // Fetch questions from the backend
  const fetchQuestions = async () => {
    if (!userId) {
      console.error("User ID is undefined, cannot fetch questions.");
      return;
    }
    try {
      const response = await axios.get(`${BASE_URL}/ques/user/${userId}`, {
        params: { viewerId: userId },
      });
      console.log("Fetched Questions:", response.data.questions);

      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchQuestions();
  }, []);

  const filteredQuestions = questions.filter((question) => {
    const tagsArray = Array.isArray(question.tags)
      ? question.tags
      : typeof question.tags === "string"
        ? question.tags.split(",").map((tag) => tag.trim())
        : [];

    return (
      question.question.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "All" || tagsArray.includes(selectedCategory))
    );
  });


  // Edit a question
  const handleEdit = async (questionId, updatedData) => {
    try {
      await axios.put(`http://localhost:5000/api/ques/${userId}/${questionId}`, updatedData);
      fetchQuestions();
    } catch (error) {
      console.error("Error editing question:", error);
    }
  };

  // Delete a question
  const handleDelete = async (questionId) => {
    try {
      await axios.delete(`http://localhost:5000/api/ques/${userId}/${questionId}`);
      setQuestions(questions.filter((q) => question._id !== questionId));
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  // Like a question
  const handleLike = async (questionId) => {
    try {
      await axios.post(`http://localhost:5000/api/ques/${questionId}/like`, { userId });
      fetchQuestions();
    } catch (error) {
      console.error("Error liking question:", error);
    }
  };

  // Toggle visibility
  const handleToggleVisibility = async (questionId, currentStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/ques/${userId}/${questionId}/toggle-visibility`);
      fetchQuestions();
    } catch (error) {
      console.error("Error toggling visibility:", error);
    }
  };

  

  if (loading) return <p>Loading questions...</p>;

  return (
    <div className="space-y-4 py-4">
      {/* ✅ Search + Category Filter */}
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 w-full">
        {/* 🔍 Search Bar */}
        <div className="flex-1 min-w-[200px]">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>

        {/* ➕ Add Question Button */}
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
        filteredQuestions.map((question) => (
          <MyQuestionCard
            key={question._id}
            title={question.question}
            author="You"
            time={new Date(question.createdAt).toLocaleDateString()}
            answers={question.answers.length}
            likes={question.likes.length}
            tag={Array.isArray(question.tags) ? question.tags : (typeof question.tags === "string" ? question.tags.split(",").map(tag => tag.trim()) : ["General"])}
            tagColor="purple"
            isPublic={question.isPublic}
            onEdit={(updatedData) => handleEdit(question._id, updatedData)}
            onToggleVisibility={() => handleToggleVisibility(question._id)}
            onDelete={() => handleDelete(question._id)}
            onLike={() => handleLike(question._id)}
            onAnswer={() => setSelectedQuestion(question)}
            answerPreview={question.answers?.length > 0 ? question.answers[0]?.text : "No answers yet."}
          />
        ))
      ) : (
        <p>No questions posted yet.</p>
      )}

      {/* Question Modal */}
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

export default MyQues;
