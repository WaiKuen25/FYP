import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faThumbsUp,
  faThumbsDown,
  faShareAlt,
  faEllipsisH,
  faMessage,
  faReply,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import handleReaction from "../../../service/handleReaction";
import { Avatar } from "@mui/material";
import { stringAvatar } from "../../../service/avatar";
import ShowReply from "./showReply";
import ReplyComment from "./ReplyComment";
import ReplyList from "./ReplyList";
import { checkAvatarExists } from "../../../service/checkAvatarExists";
import useToggleState from "../../../hooks/useToggleState";

const OptionCard = ({
  postId,
  usePin,
  useDelete,
  useReport,
  messageId,
  messageContent,
  onToggleOptions,
  onReport,
  onGenerateSummary
}) => {
  const handlePin = async () => {
    try {
      console.log("Pin Message", messageId);
      const token = localStorage.getItem("token");
      
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/data/pin/${postId}/${messageId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        window.location.reload();
      } else {
        alert("Failed to pin the message");
      }
    } catch (error) {
      console.error("Error pinning the message:", error);
      alert("Error occurred while pinning the message");
    }
    onToggleOptions(null);
  };

  const handleDelete = async () => {
    try {
      console.log("Delete Message", messageId);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/data/disable/${postId}/${messageId}`,
        { 
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        window.location.reload();
      } else {
        alert("Failed to delete the message");
      }
    } catch (error) {
      console.error("Error deleting the message:", error);
      alert("Error occurred while deleting the message");
    }
    onToggleOptions(null);
  };

  return (
    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20">
      {usePin && (
        <button
          className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
          onClick={handlePin}
        >
          Pin Message
        </button>
      )}
      {messageContent && messageContent.length >= 50 && (
        <button
          className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
          onClick={() => {
            onGenerateSummary && onGenerateSummary(postId, messageId, messageContent);
            onToggleOptions(null);
          }}
        >
          Generate Summary
        </button>
      )}
      {useDelete && (
        <button
          className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
          onClick={handleDelete}
        >
          Delete Message
        </button>
      )}
      {useReport && (
        <button
          className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
          onClick={onReport}
        >
          Report Message
        </button>
      )}
    </div>
  );
};

const ReportModal = ({ isOpen, onClose, onSubmit, messageId }) => {
  const [type, setType] = useState("");
  const [reason, setReason] = useState("");

  const reportTypes = [
    { value: "spam", label: "Spam" },
    { value: "harassment", label: "Harassment" },
    { value: "inappropriate", label: "Inappropriate Content" },
    { value: "violence", label: "Violence" },
    { value: "other", label: "Other" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ type, reason, messageId });
    setType("");
    setReason("");
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-4">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Report Message</h3>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Report Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            >
              <option value="">Select Report Type</option>
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Report Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-h-[100px]"
              placeholder="Please provide detailed reason..."
              required
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Post2 = ({ 
  postId, 
  response, 
  onReactionUpdate, 
  currentUrl,
  onGenerateSummary,
  isFirstMessage 
}) => {
  const [userId, setUserId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [openOptions, setOpenOptions] = useState(null);
  const [openChats, setOpenChats] = useState(false);
  const [openReplyList, toggleReplyList] = useToggleState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const handleShareClick = () => {
    setShowShareModal(true);
  };

  const handleCopyLink = async () => {
    const shareUrl = `${currentUrl}?messageId=${response.messageId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link has been copied to clipboard!");
      setShowShareModal(false);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const closeShareModal = (e) => {
    if (e.target === e.currentTarget) {
      setShowShareModal(false);
    }
  };

  const getReactionButtonClass = (isActive, reaction) => {
    if (isActive) {
      return `${buttonBase} ${
        reaction === 1
          ? "text-green-500 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30"
          : "text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
      }`;
    }
    return buttonBase;
  };

  const handleReactionClick = async (event, reaction) => {
    event.stopPropagation();
    const success = await handleReaction(postId, response.messageId, reaction);
    if (success) {
      const updatedPost = { ...response };
      if (reaction === 1) {
        if (response.userReaction === 1) {
          updatedPost.likeCount = parseInt(response.likeCount || 0) - 1;
          updatedPost.userReaction = null;
        } else {
          updatedPost.likeCount = parseInt(response.likeCount || 0) + 1;
          if (response.userReaction === 0) {
            updatedPost.dislikeCount = parseInt(response.dislikeCount || 0) - 1;
          }
          updatedPost.userReaction = 1;
        }
      } else if (reaction === 0) {
        if (response.userReaction === 0) {
          updatedPost.dislikeCount = parseInt(response.dislikeCount || 0) - 1;
          updatedPost.userReaction = null;
        } else {
          updatedPost.dislikeCount = parseInt(response.dislikeCount || 0) + 1;
          if (response.userReaction === 1) {
            updatedPost.likeCount = parseInt(response.likeCount || 0) - 1;
          }
          updatedPost.userReaction = 0;
        }
      }
      onReactionUpdate(updatedPost);
    }
  };

  const handleReport = () => {
    console.log("Opening report modal");
    setShowReportModal(true);
    setOpenOptions(null);
  };

  const handleReportSubmit = async ({ type, reason, messageId }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/feedback/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          postId,
          messageId,
          type,
          reason,
        }),
      });

      if (response.ok) {
        alert("Report has been submitted, we will process it as soon as possible");
      } else {
        throw new Error("Report submission failed");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("An error occurred while submitting the report, please try again later");
    }
    setShowReportModal(false);
  };

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/getUserId`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const result = await res.json();
        setUserId(result.userId);
        
        // 檢查用戶是否是 host（第一條消息的發送者）
        setIsHost(result.userId === response.hostId);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchAvatarUrl = async () => {
      const exists = await checkAvatarExists(response.userId);
      if (exists) {
        setAvatarUrl(
          `${import.meta.env.VITE_BACKEND_URL}/api/cdn/avator/${
            response.userId
          }/${response.userId}.png`
        );
      }
    };

    if (localStorage.getItem("token")) {
      fetchUserId();
    }
    fetchAvatarUrl();
  }, [response.userId, response.hostId]);

  const timeAgo = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diff = Math.abs(now - postDate);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    return `${days} days ago`;
  };

  const toggleOptions = (messageId) => {
    setOpenOptions((prev) => (prev === messageId ? null : messageId));
  };

  const getOptions = (item) => ({
    postId,
    usePin: isHost && item.messageId !== 1, // 只有 host 可以置頂，且不能置頂第一條消息
    useDelete: userId === item.userId || isHost,
    useReport: userId && userId !== item.userId && !isHost,
    messageId: item.messageId,
    messageContent: item.messageContent,
    onToggleOptions: toggleOptions,
    onReport: handleReport,
    onGenerateSummary: onGenerateSummary,
  });

  const buttonBase =
    "flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-500 dark:text-gray-400 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100";

  return (
    <div className="mx-auto my-4 lg:max-w-7xl md:max-w-2xl" id={`post-${response.messageId}`}>
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${response.userName}'s avatar`}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <Avatar
                {...stringAvatar(response.userName)}
                className="w-10 h-10"
              />
            )}
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {response.userName}
                <span className="pl-2 text-sm text-gray-500 dark:text-gray-400">
                  /{response.category} • {timeAgo(response.timestamp)}
                </span>
              </span>
            </div>
          </div>
          <div className="relative">
            <button
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
              onClick={() => toggleOptions(response.messageId)}
            >
              <FontAwesomeIcon
                icon={faEllipsisH}
                className="text-gray-500 dark:text-gray-400"
              />
            </button>
            {openOptions === response.messageId && (
              <OptionCard {...getOptions(response)} />
            )}
          </div>
        </div>

        {response.replyIndex && (
          <ShowReply postId={postId} index={response.replyIndex} />
        )}
        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
          {response.messageContent}
        </p>

        {response.mediaName && (
          <div className="mb-4">
            <img
              src={`${
                import.meta.env.VITE_BACKEND_URL
              }/api/cdn/post/${postId}/${response.mediaName}`}
              alt="Post media"
              className="w-full max-h-96 object-contain rounded-lg"
            />
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            className={getReactionButtonClass(response.userReaction === 1, 1)}
            onClick={(e) => handleReactionClick(e, 1)}
          >
            <FontAwesomeIcon icon={faThumbsUp} className="h-4 w-4" />
            <span>{response.likeCount || 0}</span>
          </button>
          <button
            className={getReactionButtonClass(response.userReaction === 0, 0)}
            onClick={(e) => handleReactionClick(e, 0)}
          >
            <FontAwesomeIcon icon={faThumbsDown} className="h-4 w-4" />
            <span>{response.dislikeCount || 0}</span>
          </button>
          {response.replyCount > 0 && (
            <button className={buttonBase} onClick={() => toggleReplyList()}>
              <FontAwesomeIcon icon={faMessage} className="h-4 w-4" />
              <span>{response.replyCount}</span>
            </button>
          )}
          <button
            className={buttonBase}
            onClick={() => setOpenChats(!openChats)}
          >
            <FontAwesomeIcon icon={faReply} className="h-4 w-4" />
            <span></span>
          </button>
          <button className={buttonBase} onClick={handleShareClick}>
            <FontAwesomeIcon icon={faShareAlt} className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>
        {openReplyList && (
          <ReplyList
            postId={postId}
            messageId={response.messageId}
            original={response}
            toggle={toggleReplyList}
          />
        )}

        {openChats && (
          <ReplyComment
            postId={postId}
            replyId={response.messageId}
            onClose={() => setOpenChats(false)}
            onCommentSuccess={(messageId) => {
              const newSearchParams = new URLSearchParams(window.location.search);
              newSearchParams.set('messageId', messageId);
              window.history.replaceState(null, '', `?${newSearchParams.toString()}`);
              setOpenChats(false);
            }}
          />
        )}
      </div>

      {showShareModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeShareModal}
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Share Comment</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Copy the link below to share this comment:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={`${currentUrl}?messageId=${response.messageId}`}
                readOnly
                className="flex-1 p-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReportSubmit}
          messageId={response.messageId}
        />
      )}
    </div>
  );
};

export default Post2;
