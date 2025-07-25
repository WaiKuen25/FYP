import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { MenuItem, Select, FormControl } from "@mui/material";
import useStyles from "../../service/useStyle";
import Post from "../../components/Forum/Post/Post";
import axios from "axios";

const SearchContent = () => {
  const classes = useStyles();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortOption, setSortOption] = useState("relevant");
  
  // Get search term from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const term = params.get("term");
    if (term) {
      setSearchTerm(term);
      setData([]);
      setPage(1);
      setHasMore(true);
    }
  }, [location.search]);

  // Infinite scroll setup
  const observer = useRef();
  
  const lastPostElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // Handle sort option change
  const handleSortOptionChange = (event) => {
    setSortOption(event.target.value);
    setData([]);
    setPage(1);
    setHasMore(true);
  };

  // Handle reaction updates
  const handleReactionUpdate = (postId, updatedPost) => {
    setData(prevData => 
      prevData.map(post => {
        if (post.postId === postId) {
          return {
            ...post,
            userReaction: updatedPost.userReaction,
            likeCount: updatedPost.likeCount,
            dislikeCount: updatedPost.dislikeCount
          };
        }
        return post;
      })
    );
  };

  // Fetch search result data
  useEffect(() => {
    if (!searchTerm) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        // Use extended search API
        const url = `${import.meta.env.VITE_BACKEND_URL}/api/data/search/extended`;
        const params = { 
          keyword: searchTerm,
          page: page,
          sort: sortOption
        };
        
        const response = await axios.get(url, { 
          headers,
          params
        });
        
        if (response.data.success) {
          if (response.data.data.length === 0) {
            setHasMore(false);
          } else {
            setData(prevData => {
              const newData = [...prevData, ...response.data.data];
              // Ensure no duplicate postIds
              const uniqueData = Array.from(
                new Set(newData.map(item => item.postId))
              ).map(id => newData.find(item => item.postId === id));
              return uniqueData;
            });
            // Check if there are more pages
            const { pagination } = response.data;
            if (pagination.page >= pagination.totalPages) {
              setHasMore(false);
            }
          }
        } else {
          console.error("Search API returned error:", response.data);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [searchTerm, page, sortOption]);

  // Simulate highlighting search term function
  const highlightTerm = (text, term) => {
    if (!term || !text) return text;
    // This would typically be handled by the backend, frontend just displays results
    return text;
  };

  return (
    <div className="flex-2 w-full dark:bg-dark bg-white">
      <div className="pt-2 pl-10 flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Search results: <span className="text-blue-500">"{searchTerm}"</span>
        </h2>
        
        <div className="flex-1"></div>
        
        <FormControl size="small">
          <Select
            value={sortOption}
            onChange={handleSortOptionChange}
            className={`${classes.select} h-10 w-30`}
          >
            <MenuItem value="relevant" className={classes.menuItem}>
              Relevance
            </MenuItem>
            <MenuItem value="new" className={classes.menuItem}>
              Newest
            </MenuItem>
            <MenuItem value="top" className={classes.menuItem}>
              Most Popular
            </MenuItem>
          </Select>
        </FormControl>
      </div>

      <div className="w-11/12 mx-auto border-b-1 border-gray-200 pt-2 dark:border-gray-700" />

      {loading && data.length === 0 && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!loading && data.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <div className="text-xl font-medium mb-2 text-gray-700 dark:text-gray-300">No content found related to "{searchTerm}"</div>
          <div className="text-gray-500 dark:text-gray-400">Please try using other keywords or shorter phrases</div>
        </div>
      )}

      <div className="w-auto mx-auto p-2 pt-5 h-auto">
        {data.map((post, index) => {
          if (data.length === index + 1) {
            return (
              <div ref={lastPostElementRef} key={post.postId}>
                <Post
                  postId={post.postId}
                  post={post}
                  onReactionUpdate={(updatedPost) => handleReactionUpdate(post.postId, updatedPost)}
                  highlightText={searchTerm}
                />
              </div>
            );
          } else {
            return (
              <Post
                key={post.postId}
                postId={post.postId}
                post={post}
                onReactionUpdate={(updatedPost) => handleReactionUpdate(post.postId, updatedPost)}
                highlightText={searchTerm}
              />
            );
          }
        })}
      </div>

      {loading && data.length > 0 && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!hasMore && data.length > 0 && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          No more results
        </div>
      )}
    </div>
  );
};

export default SearchContent;