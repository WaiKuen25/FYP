import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar } from "@mui/material";
import { stringAvatar } from "../../../service/avatar";
import { checkAvatarExists } from "../../../service/checkAvatarExists";
import {
  faThumbsUp,
  faThumbsDown,
  faShareAlt,
  faEllipsisH,
  faCopy,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import handleReaction from "../../../service/handleReaction";
import timeAgo from "../../../service/timeago";

const Post = ({ postId, post, onReactionUpdate }) => {
  const [openOptions, setOpenOptions] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    const fetchAvatarUrl = async () => {
      const exists = await checkAvatarExists(post.userId);
      if (exists) {
        setAvatarUrl(
            `${import.meta.env.VITE_BACKEND_URL}/api/cdn/avator/${
                post.userId
            }/${post.userId}.png`
        );
      }
    };

    fetchAvatarUrl();
  }, [post.userId]);

  const toPost = async () => {
    try {
      // 記錄瀏覽歷史
      const token = localStorage.getItem("token");
      if (token) {
        console.log(`Recording history for post: ${post.postId}`);
        
        await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/userConfig/history/${post.postId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          }
        ).catch(error => {
          console.error("Error recording history:", error);
          // 即使記錄失敗也繼續導航到帖子頁面
        });
      }
      
      // 導航到帖子頁面
      navigate(`/post/${post.postId}`);
    } catch (error) {
      console.error("Error in toPost:", error);
      // 出錯時仍然嘗試導航
      navigate(`/post/${post.postId}`);
    }
  };

  const handleReactionClick = async (event, reaction) => {
    event.stopPropagation();
    console.log("Reaction clicked:", reaction, "Current post:", post);
    const success = await handleReaction(post.postId, 1, reaction);
    console.log("handleReaction success:", success);
    if (success) {
      const updatedPost = { ...post };
      if (reaction === 1) {
        if (post.userReaction === 1) {
          updatedPost.likeCount = parseInt(post.likeCount || 0) - 1;
          updatedPost.userReaction = null;
        } else {
          updatedPost.likeCount = parseInt(post.likeCount || 0) + 1;
          if (post.userReaction === 0) {
            updatedPost.dislikeCount = parseInt(post.dislikeCount || 0) - 1;
          }
          updatedPost.userReaction = 1;
        }
      } else if (reaction === 0) {
        if (post.userReaction === 0) {
          updatedPost.dislikeCount = parseInt(post.dislikeCount || 0) - 1;
          updatedPost.userReaction = null;
        } else {
          updatedPost.dislikeCount = parseInt(post.dislikeCount || 0) + 1;
          if (post.userReaction === 1) {
            updatedPost.likeCount = parseInt(post.likeCount || 0) - 1;
          }
          updatedPost.userReaction = 0;
        }
      }
      console.log("Updated post:", updatedPost);
      onReactionUpdate(updatedPost);
    } else {
      console.error("Reaction update failed");
    }
  };

  const toggleOptions = (e) => {
    e.stopPropagation();
    setOpenOptions((prev) => !prev);
  };

  const handleCollectionClick = async (e) => {
    e.stopPropagation();
    setOpenOptions(!openOptions);
    try {
      const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/userConfig/favourite/${post.postId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
          }
      );

      if (res.ok) {
        console.log("Post added to favorites successfully!");
      } else {
        console.error("Failed to add post to favorites.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    setShowShareModal(true);
  };

  const handleCopyLink = async (e) => {
    e.stopPropagation();
    const postUrl = `${window.location.origin}/post/${post.postId}`;
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const closeShareModal = (e) => {
    e.stopPropagation();
    setShowShareModal(false);
  };

  const getReactionButtonClass = (isActive, reaction) => {
    const baseClass = "flex items-center gap-1.5 px-3 py-2 rounded-md transition-all duration-200";
    if (isActive) {
      return `${baseClass} ${
          reaction === 1
              ? "text-green-500 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30"
              : "text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
      }`;
    }
    return `${baseClass} bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100`;
  };

  return (
      <div className="sm:max-w-md md:max-w-2xl lg:max-w-7xl mx-auto my-4 cursor-pointer" onClick={toPost}>
        <div className="ml-4 p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-150">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                  <img
                      src={avatarUrl}
                      alt={`${post.userName}'s avatar`}
                      className="w-10 h-10 rounded-full object-cover"
                  />
              ) : (
                  <Avatar {...stringAvatar(post.userName)} className="w-10 h-10" />
              )}
              <div>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {post.userName}
                <span className="pl-2 text-sm text-gray-500 dark:text-gray-400">
                  /{post.category} • {timeAgo(post.timestamp)}
                </span>
              </span>
              </div>
            </div>
            <div className="relative">
              <button
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                  onClick={toggleOptions}
              >
                <FontAwesomeIcon
                    icon={faEllipsisH}
                    className="text-gray-500 dark:text-gray-400"
                />
              </button>
              {openOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20">
                    <button className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150" onClick={handleCollectionClick}>
                      Collection
                    </button>
                  </div>
              )}
            </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            {post.title}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            {post.messageContent}
          </p>

          {post.mediaName && (
              <div className="mb-4">
                <img
                    src={`${
                        import.meta.env.VITE_BACKEND_URL
                    }/api/cdn/post/${post.postId}/${post.mediaName}`}
                    alt="Post media"
                    className="w-full max-h-96 object-contain rounded-lg"
                />
              </div>
          )}

          <div className="flex items-center gap-3">
            <button
                className={getReactionButtonClass(post.userReaction === 1, 1)}
                onClick={(e) => handleReactionClick(e, 1)}
            >
              <FontAwesomeIcon icon={faThumbsUp} className="h-4 w-4" />
              <span>{post.likeCount || 0}</span>
            </button>
            <button
                className={getReactionButtonClass(post.userReaction === 0, 0)}
                onClick={(e) => handleReactionClick(e, 0)}
            >
              <FontAwesomeIcon icon={faThumbsDown} className="h-4 w-4" />
              <span>{post.dislikeCount || 0}</span>
            </button>
            <button
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-500 dark:text-gray-400 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100"
                onClick={handleShareClick}
            >
              <FontAwesomeIcon icon={faShareAlt} className="h-4 w-4" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {showShareModal && (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={closeShareModal}
            >
              <div
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
                  onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Share Post</h3>
                <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <input
                      type="text"
                      value={`${window.location.origin}/post/${post.postId}`}
                      readOnly
                      className="flex-1 bg-transparent border-none outline-none text-gray-700 dark:text-gray-300"
                  />
                  <button
                      onClick={handleCopyLink}
                      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <FontAwesomeIcon
                        icon={copied ? faCheck : faCopy}
                        className={`h-5 w-5 ${copied ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}`}
                    />
                  </button>
                </div>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Click to copy the link or click outside to close
                </p>
              </div>
            </div>
        )}
      </div>
  );
};

export default Post;