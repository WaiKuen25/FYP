import axios from "axios";
import { useEffect, useState } from "react";
import Post from "../../components/Forum/Post/Post"; 

const History = () => {
    const [historyData, setHistoryData] = useState([]);
    const [postData, setPostData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch history data
    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/userConfig/getHistory`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                console.log("History Response:", response.data.history);
                // 確保歷史記錄是唯一的
                const uniqueHistory = response.data.history.reduce((acc, current) => {
                    const exists = acc.find(item => item.postId === current.postId);
                    if (!exists) {
                        acc.push(current);
                    }
                    return acc;
                }, []);
                setHistoryData(uniqueHistory);
            } catch (error) {
                console.error("Error fetching history:", error);
                setHistoryData([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchHistory();
    }, []);

    // Fetch post details for each postId
    useEffect(() => {
        const fetchPosts = async () => {
            if (historyData.length === 0) return;

            setLoading(true);
            try {
                const postPromises = historyData.map(async (historyItem) => {
                    try {
                        console.log(`Fetching post data for postId: ${historyItem.postId}`);
                        const response = await axios.get(
                            `${import.meta.env.VITE_BACKEND_URL}/api/data/first/${historyItem.postId}`,
                            {
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                                },
                            }
                        );
                        console.log(`Post ${historyItem.postId} Response:`, response.data);
                        if (!response.data) {
                            console.log(`No data returned for postId: ${historyItem.postId}`);
                            return null;
                        }
                        
                        // 確保返回的數據包含所有必需的字段，設置默認值防止缺失字段
                        return {
                            ...response.data,
                            userId: response.data.userId || response.data.authorId || 0,
                            userName: response.data.userName || "Unknown User",
                            title: response.data.title || "Untitled Post",
                            messageContent: response.data.messageContent || "",
                            category: response.data.category || "General",
                            likeCount: response.data.likeCount || "0",
                            dislikeCount: response.data.dislikeCount || "0",
                            timestamp: historyItem.time,
                            postId: historyItem.postId,
                            uniqueKey: `${historyItem.postId}-${historyItem.time}` // 添加唯一key
                        };
                    } catch (err) {
                        console.error(`Error fetching post ${historyItem.postId}:`, err);
                        return null;
                    }
                });

                const posts = await Promise.all(postPromises);
                const validPosts = posts.filter(post => post !== null);
                console.log("All Fetched Posts:", validPosts);
                
                if(validPosts.length === 0) {
                    console.log("No valid posts found after fetching. Check API responses.");
                }
                
                setPostData(validPosts);
            } catch (error) {
                console.error("Error fetching post details:", error);
                setPostData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [historyData]);

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
            });
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
                <h1 className="text-2xl font-bold">History</h1>
            </div>
            {loading ? (
                <p>Loading...</p>
            ) : postData.length > 0 ? (
                <div className="w-11/12 mx-auto flex flex-col gap-6">
                    {Object.entries(groupedPosts)
                        .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
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
                                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                        .map((response) => (
                                            <div key={response.uniqueKey} className="w-full">
                                                <Post
                                                    postId={response.postId}
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
                                                            postData.findIndex(p => p.uniqueKey === response.uniqueKey),
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
                <p>No history found</p>
            )}
        </div>
    );
};

export default History;