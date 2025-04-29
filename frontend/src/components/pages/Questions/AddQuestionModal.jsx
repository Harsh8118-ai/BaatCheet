import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";
import { Switch } from "../../ui/switch"; 
import { useAuth } from "../../store/UseAuth"; 
import { Link, useNavigate } from "react-router-dom";


const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export function AddQuestionModal({ open, setOpen, newQuestion, setNewQuestion }) {
  const { user } = useAuth(); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPublic, setIsPublic] = useState(true); 
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const categories = [
    "All", 
    "General",
    "JavaScript", 
    "React", 
    "Node.js", 
    "Python", 
    "Machine Learning", 
    "AI & Deep Learning", 
    "Cybersecurity", 
    "Blockchain", 
    "Cloud Computing", 
    "Game Development", 
    "AR/VR", 
    "IoT", 
    "Database Management", 
    "Software Testing",
  ];

  // Convert tags string to array
  const selectedTags = newQuestion.tags ? newQuestion.tags.split(",").filter(Boolean) : [];

  // Select a category (add tag)
  const selectCategory = (category) => {
    if (!selectedTags.includes(category)) {
      const updatedTags = [...selectedTags, category];
      setNewQuestion({ ...newQuestion, tags: updatedTags.join(",") });
    }
    setShowDropdown(false);
  };

  // Remove a tag
  const removeTag = (tagToRemove) => {
    const updatedTags = selectedTags.filter(tag => tag !== tagToRemove);
    setNewQuestion({ ...newQuestion, tags: updatedTags.join(",") });
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addQuestion = async () => {
    if (!newQuestion.title.trim()) {
      setError("Question title and answer cannot be empty!");
      return;
    }

    if (!user?._id) {
      setError("User is not authenticated!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formattedTitle = newQuestion.title.trim().endsWith("?")
        ? newQuestion.title.trim()
        : newQuestion.title.trim() + "?";


      const response = await fetch(`${BASE_URL}/ques`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user._id,
          username: user.username || "Anonymous",
          questions: [
            {
              question: formattedTitle,
              answer: newQuestion.answer.trim(),
              tags: newQuestion.tags
                ? newQuestion.tags.split(",").map(tag => tag.trim())
                : [],
              isPublic: isPublic,   
            },
          ],
        }),
      });

      const data = await response.json();
      console.log("Response Data:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to add question");
      }

      navigate("/questions");
      window.location.reload();

      setNewQuestion({ title: "", answer: "", tags: "" });
      setOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md md:max-w-lg w-full p-6 rounded-lg shadow-lg bg-gray-950 text-white">

        {/* 🔥 Animated Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Add New Question</DialogTitle>
          </DialogHeader>
        </motion.div>

        {/* 📝 Input Fields with Animation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-col gap-4"
        >
          <Input
            placeholder="Question Title"
            className="bg-gray-800 text-white border-gray-600"
            value={newQuestion.title}
            onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
          />
          <Textarea
            placeholder="Your Answer"
            className="bg-gray-800 text-white border-gray-600"
            value={newQuestion.answer}
            onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
          />
          {/* Tags Selection Dropdown */}
          <div className="relative">
      {/* Selected Tags Display */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map((tag, index) => (
          <span 
            key={index} 
            className="bg-gray-700 text-white px-2 py-1 rounded-md flex items-center gap-1"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="text-red-400 hover:text-red-600 focus:outline-none"
            >
              ❌
            </button>
          </span>
        ))}
      </div>

      {/* Input Field (Clickable to Open Dropdown) */}
      <Input
        placeholder="Click to select tags"
        className="bg-gray-800 text-white border-gray-600 cursor-pointer"
        value=""
        readOnly
        onClick={() => setShowDropdown(!showDropdown)}
      />

      {/* Dropdown (Shows on Click) */}
      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute left-0 mt-2 w-full bg-gray-900 border border-gray-700 rounded-md shadow-lg max-h-48 overflow-auto z-10"
        >
          {categories.map((category, index) => (
            <div
              key={index}
              className="p-2 hover:bg-gray-700 cursor-pointer text-white"
              onClick={() => selectCategory(category)}
            >
              {category}
            </div>
          ))}
        </div>
      )}
    </div>


          {/* Public/Private Toggle */}
          <div className="flex items-center justify-between mt-2">
            <span>Make Public</span>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
        </motion.div>

        {/* ⚠️ Error Message */}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        {/* 🖱️ Animated Save Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.2 }}
          className="mt-4"
        >
          <Button
            onClick={addQuestion}
            className="w-full bg-[#4CAF50] text-white transition-all duration-300"
            disabled={loading || !newQuestion.title.trim()}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
