import React from "react";

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


const CategoryFilter = ({ selectedCategory, setSelectedCategory }) => {
  return (
    <div className="relative w-full">
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="w-full px-4 py-2 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategoryFilter;
