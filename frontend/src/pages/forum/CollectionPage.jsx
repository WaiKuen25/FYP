import axios from "axios";
import { useEffect, useState } from "react";
import Post from "../../components/Forum/Post/Post"; 

const CollectionPage = () => {
    const [collectionData, setCollectionData] = useState([]);
    const [postData, setPostData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch collection data
    useEffect(() => {
        const fetchCollection = async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/userConfig/getFavourite`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                console.log("Collection Response:", response.data.favourite);
                setCollectionData(response.data.favourite || []);
            } catch (error) {
                console.error("Error fetching collection:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchCollection();
    }, []);

    // Fetch post details for each postId
    useEffect(() => {
        const fetchPosts = async () => {
            if (collectionData.length === 0) return;

            setLoading(true);
            try {
                const postPromises = collectionData.map(async (collectionItem) => {
                    try {
                        const response = await axios.get(
                            `${import.meta.env.VITE_BACKEND_URL}/api/data/first/${collectionItem.postId}`,
                            {
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                                },
                            }
                        );
                        console.log(`Post ${collectionItem.postId} Response:`, response.data);
                        return {
                            ...response.data,
                            timestamp: collectionItem.time, // Use collection visit time
                            postId: collectionItem.postId
                        };
                    } catch (err) {
                        console.error(`Error fetching post ${collectionItem.postId}:`, err);
                        return null;
                    }
                });

                const posts = await Promise.all(postPromises);
                const validPosts = posts.filter(post => post !== null);
                console.log("All Fetched Posts:", validPosts);
                setPostData(validPosts);
            } catch (error) {
                console.error("Error fetching post details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [collectionData]);

    const handleReactionUpdate = (index, updatedPost) => {
        const updatedPosts = [...postData];
        updatedPosts[index] = updatedPost;
        setPostData(updatedPosts);
    };

    // Group posts by date
    const groupPostsByDate = () => {
        const grouped = {};
        postData.forEach((post) => {
            const date = new Date(post.timestamp).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
            }); // e.g., "April 4"
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(post);
        });
        return grouped;
    };

    const groupedPosts = groupPostsByDate();

    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-full text-center py-4">
                <h1 className="text-2xl font-bold">Collection</h1>
            </div>
            {loading ? (
                <p>Loading...</p>
            ) : postData.length > 0 ? (
                <div className="w-11/12 mx-auto flex flex-col gap-6">
                    {Object.entries(groupedPosts)
                        .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA)) // Sort date groups newest to oldest
                        .map(([date, posts]) => (
                            <div key={date} className="w-full">
                                <div className="flex items-center justify-center my-4">
                                    <hr className="w-1/4 border-gray-300" />
                                    <span className="px-4 text-lg font-semibold text-gray-600">
                                        {date}
                                    </span>
                                    <hr className="w-1/4 border-gray-300" />
                                </div>
                                <div className="flex flex-col gap-4">
                                    {posts
                                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Sort posts newest to oldest
                                        .map((response, index) => (
                                            <div key={response.postId || index} className="w-full">
                                                <Post
                                                    post={{
                                                        postId: response.postId,
                                                        userId: response.userId,
                                                        userName: response.userName,
                                                        category: response.category,
                                                        title: response.title,
                                                        messageContent: response.messageContent,
                                                        mediaName: response.mediaName,
                                                        timestamp: response.timestamp,
                                                        likeCount: response.likeCount,
                                                        dislikeCount: response.dislikeCount,
                                                        userReaction: response.userReaction
                                                    }}
                                                    onReactionUpdate={(updatedPost) =>
                                                        handleReactionUpdate(
                                                            postData.findIndex(p => p.postId === response.postId),
                                                            updatedPost
                                                        )
                                                    }
                                                />
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                </div>
            ) : (
                <p>No collection found</p>
            )}
        </div>
    );
};

export default CollectionPage;
