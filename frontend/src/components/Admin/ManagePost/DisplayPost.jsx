import React, { useContext } from 'react';
import Post3 from "../../Forum/Post/Post3";
import { PostContext } from '../../../context/PostContext'; // 引入上下文

const DisplayPost = () => {
    const { postData } = useContext(PostContext); // 使用上下文

    return(
        <div className="p-2 pt-12 w-full h-full">
            {postData ? <Post3 response={postData}/> : null} {/* 根據上下文中的數據渲染 */}
        </div>
    );
}

export default DisplayPost;

const response = {
    "pinContent": "This is a Pin Test",
    "userName": "230335287",
    "title": "gdgdg",
    "timestamp": "2025-02-10T01:29:22.000Z",
    "mediaName": null,
    "likeCount": "2",
    "dislikeCount": "0",
    "userReaction": null,
    "messageContent": "gdgdgdg",
    "postId": 8
};