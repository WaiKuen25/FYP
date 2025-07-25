import React from "react";
import Navbar from "../../components/Forum/Navbar";
import Sidebar from "../../components/Forum/Sidebar";
import InfoContent from "./InfoContent";
import { useCreatePost } from "../../context/CreatePostContext";
import CreatePostCard from "../../components/Forum/CreatePost";

export default function MainPage({ content }) {
  const { isCreatePostOpen, toggleCreatePost } = useCreatePost();

  return (
    <>
      <Navbar />
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto pt-16">
          <div className="flex flex-1">
            {content}
            <InfoContent />
          </div>
        </div>
      </div>
      {isCreatePostOpen && <CreatePostCard onClose={toggleCreatePost} />}
    </>
  );
}