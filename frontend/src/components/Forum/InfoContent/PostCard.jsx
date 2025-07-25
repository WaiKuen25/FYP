import { useEffect, useState } from "react";
import Post3 from "../Post/Post3";
import axios from "axios";
const PostCard = () => {
    const [posts, setPosts] = useState([{}]);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/data/getAllPinContent`);
                console.log(response);
                setPosts(response.data); 
            } catch (error) {
                console.error("Error fetching pin content:", error);
            }
        }

        fetchData();
    }, []);

    return (
        <div>
            {posts.map((post) => (
                <Post3 key={post.postId} response={post} />
            ))}
        </div>
    );
};

export default PostCard;
