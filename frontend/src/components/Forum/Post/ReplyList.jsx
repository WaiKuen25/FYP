import { useState, useEffect } from "react";
import Post2 from "./Post2";
import axios from "axios";

const ReplyList = ({ original, postId, messageId, toggle }) => {
  const [post, setPost] = useState(null);
  const [originalPost, setOriginalPost] = useState(original);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/data/message/reply?postId=${postId}&messageId=${messageId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setPost(response.data);
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    fetchPost();
  }, [postId, messageId]);

  // 處理原始貼文的反應更新
  const handleOriginalReactionUpdate = (updatedPost) => {
    setOriginalPost(updatedPost);
  };

  // 處理回覆的反應更新
  const handleReplyReactionUpdate = (messageId, updatedPost) => {
    setPost(prevPost => {
      if (!prevPost || !prevPost.data) return prevPost;
      return {
        ...prevPost,
        data: prevPost.data.map(item => 
          item.messageId === messageId ? updatedPost : item
        )
      };
    });
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
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={toggle}
      >
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full h-full z-50 overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b-2 border-gray-400 dark:border-gray-600 mx-4">
            <Post2
              response={originalPost}
              postId={postId}
              onReactionUpdate={handleOriginalReactionUpdate}
            />
          </div>
          {post ? (
            <div id="comments-section" className="h-full p-4">
              {post.data &&
                post.data.map((response) => (
                  <Post2
                    key={response.messageId}
                    postId={postId}
                    response={response}
                    onReactionUpdate={(updatedPost) =>
                      handleReplyReactionUpdate(response.messageId, updatedPost)
                    }
                  />
                ))}
            </div>
          ) : (
            <p className="p-4 text-gray-600 dark:text-gray-400">Loading...</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ReplyList;
