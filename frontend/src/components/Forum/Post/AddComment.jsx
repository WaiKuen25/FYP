import React, { useState, useRef } from "react";
import { PlusCircle } from "lucide-react";
import { LinearProgress, Box } from "@mui/material";
import {handleCommentSubmit} from "../../../service/createMessage";
import logo from "../../../resources/logo.png";
import axios from "axios";

const AddComment = ({ postId, onCommentSuccess }) => {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleMediaUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setMedia(file);
      setUploadProgress(0);

      const uploadSimulation = setInterval(() => {
        setUploadProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(uploadSimulation);
            return 100;
          }
          return prevProgress + 10;
        });
      }, 100);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const formData = new FormData();
    formData.append("content", content);
    if (media) {
      formData.append("media", media);
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/data/createMessage/${postId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setContent("");
        setMedia(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        const messageId = response.data.messageId || response.data.data?.messageId;
        if (messageId && onCommentSuccess) {
          console.log("New message created with ID:", messageId);
          onCommentSuccess(messageId);
        } else {
          console.error("No messageId received from server");
        }
      }
    } catch (error) {
      console.error("Error creating message:", error);
    }
  };

  return (
    <div className="pb-4 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="relative rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
            <textarea
              placeholder="Share your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] w-full rounded-lg px-4 py-3 text-sm bg-transparent 
                       text-gray-700 dark:text-gray-200 placeholder:text-gray-400 
                       dark:placeholder:text-gray-500 focus:outline-none focus:ring-0 
                       disabled:opacity-50 
                       transition-all duration-200 resize-none"
              style={{
                borderBottomLeftRadius: uploadProgress > 0 ? 0 : undefined,
                borderBottomRightRadius: uploadProgress > 0 ? 0 : undefined,
              }}
            />
            
            {uploadProgress > 0 && (
              <Box
                sx={{
                  width: "100%",
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  borderBottomLeftRadius: "0.5rem",
                  borderBottomRightRadius: "0.5rem",
                  overflow: "hidden",
                }}
              >
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{
                    height: 4,
                    borderRadius: 0,
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "#3b82f6",
                    },
                    backgroundColor: "#e2e8f0",
                  }}
                />
              </Box>
            )}

            <div className="absolute bottom-3 right-3 flex items-center gap-5">
              <label htmlFor="media-upload" className="cursor-pointer">
                <div className="h-14 w-14 rounded-full bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors">
                  <PlusCircle className="h-8 w-8 text-gray-600 dark:text-gray-300" />
                </div>
                <input
                  id="media-upload"
                  type="file"
                  accept=".jpg,.jpeg,.png,.mp4"
                  className="hidden"
                  onChange={handleMediaUpload}
                  ref={fileInputRef}
                />
              </label>
              
              <button
                type="submit"
                disabled={!content.trim()}
                className="inline-flex items-center justify-center rounded-full h-14 w-14
                          border-none focus:outline-none bg-transparent
                          hover:bg-gray-200 dark:hover:bg-gray-600
                          transition-colors duration-200"
              >
                <img src={logo} alt="Send" className="h-8 w-8 object-contain" />
              </button>
            </div>
          </div>

          {media && (
            <div className="mt-3 px-2 text-sm text-gray-600 dark:text-gray-300 
                         flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 
                         rounded-md py-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {uploadProgress > 0 && uploadProgress < 100
                    ? "Uploading: "
                    : "Selected file: "}
                </span>
                <span className="text-blue-500 dark:text-blue-400 truncate max-w-[200px]">
                  {media.name}
                </span>
              </div>
              {uploadProgress > 0 && (
                <span className="text-blue-500 dark:text-blue-400 font-medium">
                  {uploadProgress}%
                </span>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddComment;