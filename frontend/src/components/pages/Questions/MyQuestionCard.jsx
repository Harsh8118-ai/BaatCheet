import React, { useState } from "react";

const MyQuestionCard = ({ title, author, time, answers, likes, tag, isPublic, onEdit, onToggleVisibility, onDelete, onAnswer, answerPreview }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className="w-full bg-gray-950 rounded-lg p-6 mb-4 border border-gray-800 relative">

      {/* Header Section */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-white text-xl font-medium">{title.length > 50 ? `${title.substring(0, 50)}...` : title}</h2>
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(tag) ? tag : [tag]).map((t, index) => (
              <span
                key={index}
                className="bg-gray-800 text-purple-400 px-3 py-1 rounded-md text-sm font-medium"
              >
                {t}
              </span>
            ))}
          </div>



          {/* Dropdown Button */}
          <button className="text-gray-400 hover:text-white" onClick={toggleMenu}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-6 top-16 w-40 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-10">
              <ul className="py-1">
                <li>
                  <button onClick={() => { onEdit(); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-800">
                    Edit Question
                  </button>
                </li>
                <li>
                  <button onClick={() => { onToggleVisibility(); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-800">
                    Make {isPublic ? "Private" : "Public"}
                  </button>
                </li>
                <li>
                  <button onClick={() => { onDelete(); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800">
                    Delete
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Answer Preview */}
      {answerPreview && (
        <div>
          <p className="hidden sm:block text-gray-400 text-sm w-3/4  mb-3">
            {answerPreview.substring(0, 250)}...
          </p>
          <p className="sm:hidden text-gray-400 text-sm w-3/4  mb-3">
            {answerPreview.substring(0, 80)}...
          </p></div>
      )}

      {/* Author & Time Section */}
      <div className="flex items-center mt-2 mb-4">
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs">
            {author.charAt(0)}
          </div>
          <span className="text-gray-400 text-sm ml-2">{author}</span>
        </div>
        <span className="text-gray-500 text-sm ml-2">• {time}</span>
        <span className="text-gray-500 text-sm ml-2">• {isPublic ? "Public" : "Private"}</span>
      </div>

      {/* Stats Section */}
      <div className="flex items-center text-gray-400 text-sm">
        
        {/* Answers Count */}
        <div className="flex items-center mr-4 cursor-pointer" onClick={onAnswer}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span>{answers} Answers</span>
        </div>

        {/* Likes Count */}
        <div className="flex items-center cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          <span>{likes} Likes</span>
        </div>

        {/* View Button */}
        <div className="ml-auto">
          <button className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm" onClick={onAnswer}>
            View
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyQuestionCard;
