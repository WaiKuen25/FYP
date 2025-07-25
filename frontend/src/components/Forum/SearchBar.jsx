import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faHistory,
  faTimes,
  faUser,
  faCalendarAlt,
  faTag,
  faThumbsUp,
  faThumbsDown,
  faComment,
  faArrowRight
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load search history
    const history = localStorage.getItem("searchHistory");
    if (history) {
      setSearchHistory(JSON.parse(history));
    }

    // Listen for click events to close search results
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      // Clear search timer
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Search function
  const handleSearch = async (searchTerm = searchKeyword) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/data/search?keyword=${searchTerm}`, 
        { headers }
      );
      
      if (response.data.success) {
        // Filter duplicate posts (based on postId)
        const uniqueResults = [];
        const postIds = new Set();
        
        response.data.data.forEach(result => {
          if (!postIds.has(result.postId)) {
            postIds.add(result.postId);
            uniqueResults.push(result);
          }
        });
        
        setSearchResults(uniqueResults);
        setShowSearchResults(true);
        
        // Save to search history, keep only the most recent 3
        const updatedHistory = [searchTerm, ...searchHistory.filter(item => item !== searchTerm)].slice(0, 3);
        setSearchHistory(updatedHistory);
        localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchKeyword(value);
    
    // Show search box immediately on each keystroke
    setShowSearchResults(true);
    
    // Clear previous timer
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // If input is empty, clear search results
    if (!value.trim()) {
      setSearchResults([]);
      setSearchSuggestions([]);
      return;
    }
    
    // Generate suggestions
    // Only use the input keyword as a suggestion
    setSearchSuggestions([value]);
    
    // Execute delayed search (delay only for backend requests)
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300); // Reduce delay time to improve responsiveness
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter" && searchKeyword.trim()) {
      handleSearch();
    }
  };

  const handleNavigateToPost = (postId) => {
    setShowSearchResults(false);
    setSearchKeyword("");
    navigate(`/post/${postId}`);
  };

  const handleNavigateToSearch = (term) => {
    setShowSearchResults(false);
    navigate(`/search?term=${encodeURIComponent(term)}`);
  };

  const handleHistoryItemClick = (term) => {
    setSearchKeyword(term);
    handleSearch(term);
  };

  const clearSearchInput = () => {
    setSearchKeyword("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Format date display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 day, show hours ago
    if (diff < 86400000) { // 24 * 60 * 60 * 1000
      const hours = Math.floor(diff / 3600000);
      return hours > 0 ? `${hours} hours ago` : "just now";
    }
    
    // Less than 7 days, show days ago
    if (diff < 604800000) { // 7 * 24 * 60 * 60 * 1000
      const days = Math.floor(diff / 86400000);
      return `${days} days ago`;
    }
    
    // Otherwise show complete date
    return date.toLocaleDateString();
  };

  // Highlight matching text
  const highlightMatch = (text, keyword) => {
    if (!keyword || !text) return text;

    // Avoid regex special character issues
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedKeyword})`, 'gi');
    
    // Split text into matching and non-matching parts
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      // Check if it matches the keyword (case-insensitive)
      if (part.toLowerCase() === keyword.toLowerCase()) {
        return <span key={index} className="text-red-600 font-bold">{part}</span>;
      }
      return part;
    });
  };

  const SearchResults = () => (
    <div 
      className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-[100] mt-2 dark:bg-dark dark:border-gray-700" 
      style={{ width: '100%', minWidth: '280px', maxWidth: '480px' }}
    >
      {isSearching ? (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400 flex justify-center items-center space-x-2">
          <div className="animate-spin h-5 w-5 border-2 border-gray-500 rounded-full border-t-transparent"></div>
          <span>Searching...</span>
        </div>
      ) : (
        <div className="max-h-[450px] overflow-y-auto">
          {/* Search history - show when there's no input */}
          {!searchKeyword && searchHistory.length > 0 && (
            <div className="p-3 border-b dark:border-gray-700">
              <div className="text-gray-500 dark:text-gray-400 text-sm px-2 mb-2 font-medium">Search History</div>
              <div className="space-y-1">
                {searchHistory.map((term, index) => (
                  <div 
                    key={`history-${index}`}
                    className="flex items-center px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded-md transition-colors"
                    onClick={() => handleHistoryItemClick(term)}
                  >
                    <FontAwesomeIcon icon={faHistory} className="text-gray-400 mr-3" />
                    <span className="text-gray-700 dark:text-gray-300">{term}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show search keyword options */}
          {searchKeyword && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div
                className="flex items-center px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded-md transition-colors"
                onClick={() => handleNavigateToSearch(searchKeyword)}
              >
                <FontAwesomeIcon icon={faSearch} className="text-blue-500 mr-3" />
                <span className="text-gray-800 dark:text-gray-200">
                  Search for more results of "<span className="font-medium text-blue-500">{searchKeyword}</span>"
                </span>
                <FontAwesomeIcon icon={faArrowRight} className="text-blue-500 ml-auto" />
              </div>
            </div>
          )}
          
          {/* Search results */}
          {searchResults.length > 0 && (
            <div>
              <div className="px-5 py-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                  Matching results ({searchResults.length})
                </div>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {searchResults.map((result) => (
                  <div 
                    key={`result-${result.messageId}`}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    onClick={() => handleNavigateToPost(result.postId)}
                  >
                    <div className="flex justify-between items-start space-x-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 dark:text-white text-base mb-1.5 line-clamp-1">
                          {highlightMatch(result.postTitle, searchKeyword)}
                        </h3>
                        
                        <div className="flex flex-wrap items-center text-xs text-gray-500 dark:text-gray-400 mb-2 space-x-2">
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={faUser} className="text-gray-400 mr-1" />
                            <span>{result.userName}</span>
                          </div>
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 mr-1" />
                            <span>{formatDate(result.timestamp)}</span>
                          </div>
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={faTag} className="text-gray-400 mr-1" />
                            <span>{result.category}</span>
                          </div>
                        </div>
                        
                        <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm line-clamp-2 leading-relaxed font-medium">
                          {highlightMatch(result.messageContent, searchKeyword)}
                        </p>
                        
                        <div className="flex items-center mt-3 text-xs space-x-4">
                          <div className="flex items-center text-gray-500">
                            <FontAwesomeIcon icon={faThumbsUp} className="mr-1" />
                            <span>{result.likeCount}</span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <FontAwesomeIcon icon={faThumbsDown} className="mr-1" />
                            <span>{result.dislikeCount}</span>
                          </div>
                          {result.replyCount > 0 && (
                            <div className="flex items-center text-gray-500">
                              <FontAwesomeIcon icon={faComment} className="mr-1" />
                              <span>{result.replyCount}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {result.mediaName && (
                        <div className="flex-shrink-0">
                          <img 
                            src={`${import.meta.env.VITE_BACKEND_URL}/api/cdn/post/${result.postId}/${result.mediaName}`} 
                            alt="" 
                            className="w-20 h-20 object-cover rounded-md border border-gray-200 dark:border-gray-700"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* No results prompt - only shown when search is complete and there are no results */}
          {searchKeyword && searchResults.length === 0 && !isSearching && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400 border-t dark:border-gray-700">
              <div className="text-5xl mb-3">🔍</div>
              <div className="text-lg font-medium mb-1">No results found</div>
              <div className="text-sm">Try different keywords or shorter phrases</div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex-1 flex justify-center mx-4 h-10 relative" ref={searchRef} style={{ maxWidth: '480px' }}>
      <div className="flex items-center px-4 py-2 rounded-2xl border-2 overflow-visible w-full dark:bg-lightdark dark:border-gray-700 relative">
        <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search messages"
          className="w-full outline-none bg-transparent text-gray-600 text-sm pl-2 dark:text-white"
          value={searchKeyword}
          onChange={handleSearchInputChange}
          onKeyPress={handleSearchKeyPress}
          onFocus={() => {
            setShowSearchResults(true);
          }}
        />
        {searchKeyword && (
          <button 
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            onClick={clearSearchInput}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
        {showSearchResults && <SearchResults />}
      </div>
    </div>
  );
};

export default SearchBar; 