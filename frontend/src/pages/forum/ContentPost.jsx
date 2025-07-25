import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowLeft, 
  faLayerGroup,
  faTimes,
  faChevronUp 
} from "@fortawesome/free-solid-svg-icons";
import { Divider } from "@mui/material";
import Post2 from "../../components/Forum/Post/Post2";
import AddComment from "../../components/Forum/Post/AddComment";
import { useSummary } from "../../context/SummaryContext";
import axios from "axios";
import io from "socket.io-client";
const socket = io(import.meta.env.VITE_BACKEND_URL);

const POSTS_PER_PAGE = 10;

const ContentPost = () => {
  const { postId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigate();
  const [posts, setPosts] = useState([]);
  const [pinInfo, setPinInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showPageSelector, setShowPageSelector] = useState(false);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const observer = useRef();
  const location = useLocation();
  const initialLoad = useRef(true);
  const targetMessageId = useRef(searchParams.get("messageId"));
  const { generateSummary } = useSummary();

  const handleGenerateSummary = (postId, messageId, content) => {
    // 直接使用傳入的參數調用 generateSummary
    generateSummary(postId, messageId, content);
  };

  const scrollToMessage = (messageId) => {
    const element = document.getElementById(`post-${messageId}`);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlight-comment');
        setTimeout(() => element.classList.remove('highlight-comment'), 2000);
      }, 100);
      return true;
    }
    return false;
  };

  // 獲取特定頁面的帖子
  const fetchPagePosts = async (page, isInitialFetch = false) => {
    try {
      setIsLoadingMore(true);
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/data/post/${postId}/page/${page}`,
        { headers }
      );

      if (response.data && response.data.success) {
        const { messages, hostId, pinInfo } = response.data;
        setPinInfo(pinInfo);  // 設置 pinInfo 狀態
        const formattedPosts = messages.map(message => ({
          ...message,
          hostId // 添加 hostId 到每個消息中
        }));

        if (page === 1 || isInitialFetch) {
          setPosts(formattedPosts);
        } else {
          setPosts(prev => {
            const existingMessageIds = new Set(prev.map(post => post.messageId));
            const uniqueNewPosts = formattedPosts.filter(post => !existingMessageIds.has(post.messageId));
            return [...prev, ...uniqueNewPosts];
          });
        }

        // 計算總頁數（假設每頁 10 條消息）
        const totalPagesCount = Math.ceil(messages.length / POSTS_PER_PAGE) || 1;
        setTotalPages(totalPagesCount);
        setHasMore(page < totalPagesCount);

        // 檢查目標消息是否在新加載的數據中
        if (targetMessageId.current) {
          const found = formattedPosts.some(post => post.messageId.toString() === targetMessageId.current);
          if (found) {
            setTimeout(() => scrollToMessage(targetMessageId.current), 100);
            targetMessageId.current = null;
          } else if (hasMore && page < totalPagesCount) {
            fetchPagePosts(page + 1);
          }
        }
      } else {
        console.error("Invalid response format:", response.data);
        setError("Failed to load posts. Invalid response format.");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to load posts. Please try again.");
    } finally {
      setIsLoadingMore(false);
      setLoading(false);
    }
  };

  // 監聽 URL 參數變化
  useEffect(() => {
    const messageId = searchParams.get("messageId");
    const page = parseInt(searchParams.get("page")) || 1;

    if (messageId) {
      targetMessageId.current = messageId;
    }

    if (initialLoad.current) {
      initialLoad.current = false;
      fetchPagePosts(page, true);
    }

    if (messageId && posts.length > 0) {
      const targetPost = posts.find(post => post.messageId.toString() === messageId);
      if (targetPost) {
        const element = document.getElementById(`post-${messageId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('highlight-comment');
          setTimeout(() => element.classList.remove('highlight-comment'), 2000);
        }
      } else {
        // 如果在當前頁面找不到目標消息，加載下一頁
        if (hasMore && !isLoadingMore) {
          fetchPagePosts(currentPage + 1);
        }
      }
    }
  }, [searchParams, posts, hasMore, isLoadingMore, currentPage]);

  // 處理反應更新
  const handleReactionUpdate = useCallback((updatedPost) => {
    setPosts((prevPosts) => {
      return prevPosts.map((post) => {
        if (post.messageId === updatedPost.messageId) {
          return {
            ...post,
            likeCount: updatedPost.likeCount,
            dislikeCount: updatedPost.dislikeCount,
            userReaction: updatedPost.userReaction,
          };
        }
        return post;
      });
    });
  }, []);

  // 最後一個元素的引用回調函數
  const lastPostElementRef = useCallback((node) => {
    if (loading || isLoadingMore || !hasMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setCurrentPage(prevPage => {
          const nextPage = prevPage + 1;
          fetchPagePosts(nextPage);
          // 更新 URL
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.set('page', nextPage.toString());
          setSearchParams(newSearchParams, { replace: true });
          return nextPage;
        });
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, isLoadingMore]);

  const handlePageChange = (newPage) => {
    if (newPage === currentPage) return;
    
    setCurrentPage(newPage);
    setShowPageSelector(false);
    
    // 更新 URL
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', newPage.toString());
    // 如果是通過頁面按鈕切換，清除 messageId
    if (searchParams.has('messageId')) {
      newSearchParams.delete('messageId');
    }
    setSearchParams(newSearchParams);
    
    // 加載新頁面數據
    fetchPagePosts(newPage, true);
    
    // 滾動到頁面頂部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Socket 連接處理
  useEffect(() => {
    socket.on(`newReply-${postId}`, (newReply) => {
      setPosts(prevPosts => {
        if (prevPosts.some(post => post.messageId === newReply.messageId)) {
          return prevPosts;
        }
        const updatedPosts = [...prevPosts];
        const insertIndex = updatedPosts.findIndex(post => 
          new Date(post.timestamp) > new Date(newReply.timestamp)
        );
        if (insertIndex === -1) {
          updatedPosts.push(newReply);
        } else {
          updatedPosts.splice(insertIndex, 0, newReply);
        }
        return updatedPosts;
      });
    });

    return () => {
      socket.off(`newReply-${postId}`);
    };
  }, [postId]);

  // 記錄訪問歷史
  useEffect(() => {
    const recordHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token && postId) {
          console.log(`Recording history for post ID: ${postId} in ContentPost page`);
          
          await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/userConfig/history/${postId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              }
            }
          );
        }
      } catch (error) {
        console.error("Error recording history:", error);
      }
    };
    
    recordHistory();
  }, [postId]);

  if (loading && posts.length === 0) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  return (
    <div className="flex-2 w-full dark:bg-dark bg-white relative">
      <div className="w-full h-12 bg-slate-100 text-black flex items-center">
        <div className="flex items-center pl-2">
          <FontAwesomeIcon
            icon={faArrowLeft}
            size="lg"
            onClick={() => navigation(-1)}
            className="cursor-pointer"
          />
        </div>
        <div className="flex-1 pl-4 text-lg text-center font-semibold">
          {posts && posts.length > 0 && posts[0].title ? posts[0].title : "Post"}
        </div>
      </div>

      {posts && posts.length > 0 && pinInfo && (
        <div 
          className="w-full h-12 bg-yellow-200 text-black flex items-center hover:bg-yellow-100 cursor-pointer"
          onClick={() => {
            const messageId = pinInfo.messageId;
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set('messageId', messageId);
            setSearchParams(newSearchParams);
            scrollToMessage(messageId);
          }}
        >
          <div className="flex-1 pl-11 text-lg text-center font-semibold">
            {pinInfo.messageContent}
          </div>
        </div>
      )}

      <div className="p-4">
        <AddComment 
          postId={postId} 
          onCommentSuccess={(messageId) => {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set('messageId', messageId);
            setSearchParams(newSearchParams);
          }}
        />
        <div>
          {Array.isArray(posts) && posts.length > 0 ? (
            posts.map((post, index) => {
              const postIndex = index + 1;
              const currentPageNumber = Math.ceil(postIndex / POSTS_PER_PAGE);
              const isFirstInPage = postIndex % POSTS_PER_PAGE === 1;

              return (
                <React.Fragment key={post.messageId}>
                  {isFirstInPage && (
                    <div 
                      id={`page-${currentPageNumber}-start`}
                      className="my-6"
                    >
                      <Divider>
                        <span className="px-4 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium">
                          Page {currentPageNumber}
                        </span>
                      </Divider>
                    </div>
                  )}
                  <div
                    ref={index === posts.length - 1 ? lastPostElementRef : null}
                    id={`post-${post.messageId}`}
                  >
                    <Post2
                      postId={postId}
                      response={{
                        ...post,
                        hostId: post.hostId
                      }}
                      onReactionUpdate={handleReactionUpdate}
                      currentUrl={`${window.location.origin}${location.pathname}`}
                      onGenerateSummary={handleGenerateSummary}
                      isFirstMessage={index === 0}
                    />
                  </div>
                </React.Fragment>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No messages found
            </div>
          )}
          {isLoadingMore && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>

      {/* 固定在右下角的按鈕組 */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4">
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-12 h-12 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faChevronUp} />
          </button>
        )}
        
        {totalPages > 1 && (
          <button
            onClick={() => setShowPageSelector(!showPageSelector)}
            className="w-12 h-12 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
          >
            <FontAwesomeIcon icon={showPageSelector ? faTimes : faLayerGroup} />
          </button>
        )}
      </div>

      {/* 頁碼選擇器彈出框 */}
      {showPageSelector && (
        <div 
          className="fixed bottom-24 right-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4"
          style={{ maxHeight: '60vh', overflowY: 'auto' }}
        >
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  pageNum === currentPage
                    ? 'bg-blue-500 text-white'
                    : pageNum <= Math.ceil(posts.length / POSTS_PER_PAGE)
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentPost;

// 添加到文件末尾的 CSS
const styles = `
  .highlight-comment {
    animation: highlight 2s ease-out;
  }

  @keyframes highlight {
    0% {
      background-color: rgba(59, 130, 246, 0.1);
      transform: scale(1.01);
    }
    100% {
      background-color: transparent;
      transform: scale(1);
    }
  }
`;

// 將樣式添加到 document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);