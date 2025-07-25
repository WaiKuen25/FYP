import axios from "axios";
import React, { useState, useEffect } from "react";

const ShowReply = ({ postId, index, depth = 0 }) => {
  const [replyChain, setReplyChain] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReplyChain = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/data/post/content?postId=${postId}&index=${index}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        setReplyChain(response.data.chain || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching reply chain:", error);
        setLoading(false);
      }
    };

    if (postId && index) {
      fetchReplyChain();
    }
  }, [postId, index]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="reply-chain">
      {replyChain.map((reply, idx) => (
        <div 
          key={reply.messageId} 
          className="flex" 
          style={{ 
            marginLeft: idx === 0 ? 0 : `${idx * 24}px`,
            position: 'relative'
          }}
        >
          {idx > 0 && (
            <div 
              className="absolute left-0"
              style={{
                width: '24px',
                height: '24px',
                borderLeft: '2px solid #d1d5db',
                borderBottom: '2px solid #d1d5db',
                borderBottomLeftRadius: '8px',
                borderTopWidth: '0',
                borderRightWidth: '0',
              }}
            />
          )}
          <p
            className="mb-4 p-3 flex-grow bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            style={{ 
              marginLeft: idx > 0 ? '24px' : '0'
            }}
            onClick={() => {
              const element = document.getElementById(`post-${reply.messageId}`);
              if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
          >
            {reply.content}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ShowReply;
