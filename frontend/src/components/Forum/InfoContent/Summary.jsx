import React from 'react';
import { useParams } from 'react-router-dom';

const Summary = ({ selectedContent }) => {
    const [summary, setSummary] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        const generateSummary = async () => {
            if (!selectedContent || selectedContent.length < 50) {
                setSummary("");
                return;
            }

            try {
                setIsLoading(true);
                const response = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/data/summary/${selectedContent.postId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                
                if (!response.ok) {
                    throw new Error('Failed to generate summary');
                }
                
                const data = await response.json();
                setSummary(data.summary);
            } catch (error) {
                console.error("Error generating summary:", error);
                setSummary("");
            } finally {
                setIsLoading(false);
            }
        };

        generateSummary();
    }, [selectedContent]);

    if (!selectedContent) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                內容摘要
            </h2>
            
            {isLoading ? (
                <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : summary ? (
                <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300">{summary}</p>
                </div>
            ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">
                    {selectedContent.length < 50 ? "內容太短，無需生成摘要" : "無法生成摘要"}
                </p>
            )}
        </div>
    );
};

export default Summary; 