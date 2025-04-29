import React from "react";
import { Search } from "lucide-react";

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      <input
        type="text"
        placeholder="Search questions..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-950 border border-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    </div>
  );
};

export default SearchBar;
