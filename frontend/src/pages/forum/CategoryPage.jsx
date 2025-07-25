import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Forum/Navbar";
import Sidebar from "../../components/Forum/Sidebar";
import FollowCard from "../../components/Forum/Category/FollowCard";
import useScreenSize from "../../hooks/useScreenSize";
import { useCreatePost } from "../../context/CreatePostContext";
import useCheckUser from "../../hooks/useCheckUser";

export default function CategoryPage() {
  const { isCreatePostOpen, toggleCreatePost } = useCreatePost();
  const [categories, setCategories] = useState([]);
  const isLoggedIn = useCheckUser();
  const [followedCategories, setFollowedCategories] = useState([]);
  useScreenSize();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/data/category`
        );
        const categoriesData = response.data.map((category) => ({
          id: category.categoryId,
          name: category.categoryName,
          description: category.description || "No description available",
          imageUrl: category.photo || "",
        }));
        setCategories(categoriesData);

        const userConfig = JSON.parse(localStorage.getItem("userConfig")) || {};
        if (userConfig.followCategory) {
          setFollowedCategories(userConfig.followCategory);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleFollow = async (categoryId) => {
    if (!isLoggedIn) {
      alert("Please login first！");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/userConfig/category/${categoryId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const updatedFollowedCategories = response.data.followCategory;
        setFollowedCategories(updatedFollowedCategories);

        const storedUserConfig = JSON.parse(localStorage.getItem("userConfig")) || {};
        storedUserConfig.followCategory = updatedFollowedCategories;
        localStorage.setItem("userConfig", JSON.stringify(storedUserConfig));
        window.location.reload();
      }
    } catch (error) {
      console.error("Error following category:", error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto pt-16 p-4">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">
            Follow Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <FollowCard
                key={category.id}
                category={category}
                isFollowed={followedCategories.includes(Number(category.id))}
                onFollow={handleFollow}
              />
            ))}
          </div>
        </div>
      </div>
      {isCreatePostOpen && <CreatePostCard onClose={toggleCreatePost} />}
    </>
  );
}
