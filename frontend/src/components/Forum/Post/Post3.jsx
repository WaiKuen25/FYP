import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, Divider } from "@mui/material";
import { stringAvatar } from "../../../service/avatar";
import { checkAvatarExists } from "../../../service/checkAvatarExists";
import {
  faThumbsUp,
  faThumbsDown,
  faShareAlt,
  faEllipsisH,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import handleReaction from "../../../service/handleReaction";
import timeAgo from "../../../service/timeago";

const Post3 = ({ response, onReactionUpdate }) => {
  const [openOptions, setOpenOptions] = useState(false);
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
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

    fetchAvatarUrl();
  }, [response.userId]);

  const toPost = () => {
    navigate(`/post/${response.postId}`);
  };

  const handleReactionClick = async (event, reaction) => {
    event.stopPropagation();
    const success = await handleReaction(response.postId, 1, reaction);
    if (success) {
      const newResponse = { ...response };
      if (reaction === 1) {
        newResponse.likeCount = response.likeCount + 1;
        if (response.userReaction === 0) newResponse.dislikeCount -= 1;
      } else if (reaction === 0) {
        newResponse.dislikeCount = response.dislikeCount + 1;
        if (response.userReaction === 1) newResponse.likeCount -= 1;
      }
      newResponse.userReaction = reaction;
      onReactionUpdate(newResponse);
    }
  };

  const toggleOptions = (e) => {
    e.stopPropagation();
    setOpenOptions((prev) => !prev);
  };

  const buttonBase =
    "flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-500 dark:text-gray-400 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100";

  return (
    <div className="max-w-3xl mx-auto my-4 cursor-pointer" onClick={toPost}>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-yellow-400 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-150">
        <span className="font-bold text-xl">{response.pinContent}</span>
        <Divider/>
        <div className="flex justify-between items-start mb-4 pt-2">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={`${response.userName}'s avatar`}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <Avatar {...stringAvatar(response.userName)} className="w-10 h-10" />
            )}
            <div>

              <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {response.userName}
                <span className="pl-2 text-xs text-gray-500 dark:text-gray-400">
                  • {timeAgo(response.timestamp)}
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
                {/* Add options here if needed, similar to Post2 */}
                <button className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150">
                  Placeholder Option
                </button>
              </div>
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          {response.title}
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
          {response.messageContent}
        </p>

        {response.mediaName && (
          <div className="mb-4">
            <img
              src={`${
                import.meta.env.VITE_BACKEND_URL
              }/api/cdn/post/${response.postId}/${response.mediaName}`}
              alt="Post media"
              className="w-full max-h-96 object-contain rounded-lg"
            />
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            className={`${buttonBase} ${
              response.userReaction === 1
                ? "text-green-500 bg-green-50 dark:bg-green-900/20"
                : ""
            }`}
            onClick={(e) => handleReactionClick(e, 1)}
          >
            <FontAwesomeIcon icon={faThumbsUp} className="h-4 w-4" />
            <span>{response.likeCount}</span>
          </button>
          <button
            className={`${buttonBase} ${
              response.userReaction === 0
                ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                : ""
            }`}
            onClick={(e) => handleReactionClick(e, 0)}
          >
            <FontAwesomeIcon icon={faThumbsDown} className="h-4 w-4" />
            <span>{response.dislikeCount}</span>
          </button>
          <button className={buttonBase}>
            <FontAwesomeIcon icon={faShareAlt} className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Post3;
