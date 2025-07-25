import React, { useState } from "react";
import { Select, MenuItem } from "@mui/material";
import axios from "axios";

const CreatePostCard = ({ onClose }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("1");
  const [media, setMedia] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      const postFormData = new FormData();
      postFormData.append("title", title);
      postFormData.append("content", content);
      postFormData.append("category", category);
      if (media) {
        postFormData.append("media", media);
      }

      const postResponse = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/data/posts`,
        postFormData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Post created successfully");
      onClose();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black opacity-50 z-40"
        onClick={onClose}
      ></div>
      <div className="relative bg-white dark:bg-dark p-6 rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3 z-50 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Create Post</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-lightdark dark:border-gray-700 dark:text-white"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Content
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-lightdark dark:border-gray-700 dark:text-white"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-14 p-2 border border-gray-300 rounded-md dark:bg-lightdark dark:border-gray-700 dark:text-white"
            >
              <MenuItem value="" disabled>
                Select a category
              </MenuItem>
              <MenuItem value="1">Global</MenuItem>
              <MenuItem value="2">Health and Life Sciences</MenuItem>
              <MenuItem value="3">Business</MenuItem>
              <MenuItem value="4">
                Childcare, Elderly and Community Services
              </MenuItem>
              <MenuItem value="5">Design</MenuItem>
              <MenuItem value="6">Engineering</MenuItem>
              <MenuItem value="7">Hospitality</MenuItem>
              <MenuItem value="8">Information Technology</MenuItem>
            </Select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              Media
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.mp4"
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-lightdark dark:border-gray-700 dark:text-white"
              onChange={(e) => setMedia(e.target.files[0])}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="mr-2 px-4 py-2 bg-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md dark:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostCard; 