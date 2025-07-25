import React, { createContext, useState } from 'react';

export const PostContext = createContext();

export const PostProvider = ({ children }) => {
    const [postData, setPostData] = useState(null);

    return (
        <PostContext.Provider value={{ postData, setPostData }}>
            {children}
        </PostContext.Provider>
    );
};