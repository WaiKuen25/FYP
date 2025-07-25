/*
ContentPost call by MainPage
Url: http://localhost:5173/

Also call by MainPage(categoryId)
Url: http://localhost/c/{categoryId}
Use to every posts in a message (index1)


(Call Url (get data) --> call<Post> to show each post)
*/

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { MenuItem, Select, FormControl } from "@mui/material";
import useStyles from "../../service/useStyle";
import Post from "../../components/Forum/Post/Post";
import axios from "axios";
import io from "socket.io-client";
const socket = io(import.meta.env.VITE_BACKEND_URL);

const Content = ({ sortOption: initialSortOption }) => {
  const classes = useStyles();
  const { categoryId } = useParams();
  const location = useLocation();
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [timeRange, setTimeRange] = useState("7");
  const [shouldReset, setShouldReset] = useState(false);
  
  const getInitialSortOption = () => {
    if (location.pathname === '/hots') return 'top';
    if (location.pathname === '/news') return 'new';
    return initialSortOption || 'new';
  };

  const [sortOption, setSortOption] = useState(getInitialSortOption());

  useEffect(() => {
    const newSortOption = location.pathname === '/hots' ? 'top' : 
                         location.pathname === '/news' ? 'new' : 
                         initialSortOption || 'new';
    setSortOption(newSortOption);
  }, [location.pathname, initialSortOption]);

  const observer = useRef();

  const lastPostElementRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore]
  );

  console.log(data);
  useEffect(() => {
    setShouldReset(true);
  }, [categoryId, sortOption, timeRange]);

  const handleReactionUpdate = (postId, updatedPost) => {
    setData(prevData => {
      const newData = prevData.map(post => 
        post.postId === postId ? updatedPost : post
      );
      return newData;
    });
  };

  const handleSortOptionChange = (event) => {
    setSortOption(event.target.value);
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        if (shouldReset && page !== 1) {
          setPage(1);
          return;
        }

        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        let url;
        if (sortOption === "new") {
          url = categoryId
            ? `${import.meta.env.VITE_BACKEND_URL}/api/data/category/${categoryId}/content?page=${page}`
            : `${import.meta.env.VITE_BACKEND_URL}/api/data/global/content?page=${page}`;
        } else {
          url = `${import.meta.env.VITE_BACKEND_URL}/api/data/hot/content?timeRange=${timeRange}&page=${page}`;
          if (categoryId) {
            url += `&categoryId=${categoryId}`;
          }
        }

        const response = await axios.get(url, { headers });
        
        if (!isMounted) return;

        if (response.data.length === 0) {
          setHasMore(false);
        } else {
          setData(prevData => {
            if (shouldReset || page === 1) {
              setShouldReset(false);
              return response.data;
            }
            const newData = [...prevData, ...response.data];
            const uniqueData = Array.from(
              new Set(newData.map(item => item.postId))
            ).map(id => newData.find(item => item.postId === id));
            return uniqueData;
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();

    return () => {
      isMounted = false;
    };
  }, [categoryId, page, sortOption, timeRange, shouldReset]);

  useEffect(() => {
    if (sortOption === 'top') {
      return;
    }

    socket.on("connect", () => {
      console.log("Socket connected!");
    });

    const eventName = categoryId ? `dbDataCategory-${categoryId}` : "dbData";
    
    socket.on(eventName, (newData) => {
      setData(prevData => {
        const updatedData = [...newData, ...prevData];
        const uniqueData = Array.from(
          new Set(updatedData.map(item => item.postId))
        ).map(id => {
          const newItem = updatedData.find(item => item.postId === id);
          const oldItem = prevData.find(item => item.postId === id);
          if (oldItem && newItem) {
            return {
              ...newItem,
              userReaction: oldItem.userReaction,
              likeCount: oldItem.likeCount,
              dislikeCount: oldItem.dislikeCount
            };
          }
          return newItem;
        });
        return uniqueData;
      });
    });

    socket.on("newPost", (newPost) => {
      if (sortOption === 'top') return;

      setData(prevData => {
        const updatedData = [newPost, ...prevData];
        const uniqueData = Array.from(
          new Set(updatedData.map(item => item.postId))
        ).map(id => {
          const newItem = updatedData.find(item => item.postId === id);
          const oldItem = prevData.find(item => item.postId === id);
          if (oldItem && newItem) {
            return {
              ...newItem,
              userReaction: oldItem.userReaction,
              likeCount: oldItem.likeCount,
              dislikeCount: oldItem.dislikeCount
            };
          }
          return newItem;
        });
        return uniqueData;
      });
    });

    return () => {
      socket.off(eventName);
      socket.off("newPost");
    };
  }, [categoryId, sortOption]);

  return (
    <div className="flex-2 w-full dark:bg-dark bg-white">
      <div className="pt-2 pl-10 flex items-center gap-4">
        <FormControl size="small">
          <Select
            value={sortOption}
            onChange={handleSortOptionChange}
            className={`${classes.select} h-10 w-32`}
          >
            <MenuItem value="new" className={classes.menuItem} >
            <div className="dark:text-white">
            Latest
            </div>
            </MenuItem>
            <MenuItem value="top" className={classes.menuItem}>
              Popular
            </MenuItem>
          </Select>
        </FormControl>

        {sortOption === "top" && (
          <FormControl size="small">
            <Select
              value={timeRange}
              onChange={handleTimeRangeChange}
              className={`${classes.select} h-10 w-38`}
            >
              <MenuItem value="7" className={classes.menuItem}>
                Last 7 Days
              </MenuItem>
              <MenuItem value="30" className={classes.menuItem}>
                Last 30 Days
              </MenuItem>
              <MenuItem value="all" className={classes.menuItem}>
                All Time
              </MenuItem>
            </Select>
          </FormControl>
        )}
      </div>

      <div className="w-11/12 mx-auto border-b-1 border-gray-200 pt-2 dark:border-gray-700" />

      {data.length === 0 && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
              />
            );
          }
        })}
      </div>

      {!hasMore && data.length > 0 && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          No more posts
        </div>
      )}
    </div>
  );
};

export default Content;