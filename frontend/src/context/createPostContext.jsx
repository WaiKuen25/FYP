import React, { createContext, useContext, useState } from 'react';

const CreatePostContext = createContext();

export const CreatePostProvider = ({ children }) => {
  const [isCreatePostOpen, setCreatePostOpen] = useState(false);

  const toggleCreatePost = () => {
    setCreatePostOpen((prev) => !prev);
  };

  return (
    <CreatePostContext.Provider value={{ isCreatePostOpen, toggleCreatePost }}>
      {children}
    </CreatePostContext.Provider>
  );
};

export const useCreatePost = () => {
  return useContext(CreatePostContext);
};
