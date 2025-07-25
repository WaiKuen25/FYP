import React, { useEffect, useState } from "react";
import CategoryCard from "../../components/Forum/InfoContent/CategoryCard";
import PostCard from "../../components/Forum/InfoContent/PostCard";
import { useParams } from "react-router-dom";
import { useSummary } from '../../context/SummaryContext';

const InfoContent = () => {
  const { categoryId } = useParams();
  const { summary, isLoading, error } = useSummary();
  const [showSummary, setShowSummary] = useState(false);
  
  // 當摘要生成時顯示摘要區塊
  useEffect(() => {
    if (summary) {
      setShowSummary(true);
    }
  }, [summary]);

  return (
    <div className="p-2 flex-1 h-full md:block sm:hidden bg-white dark:bg-dark dark:text-white flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg">
      {(showSummary || isLoading) && (
        <div className="mb-4">
          {isLoading && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Content Summary</h3>
                <button 
                  onClick={() => setShowSummary(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-300">Generating summary...</span>
              </div>
            </div>
          )}

          {error && !isLoading && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-900">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Content Summary</h3>
                <button 
                  onClick={() => setShowSummary(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              <h4 className="text-md font-medium mb-2">Error</h4>
              <div className="text-sm">{error}</div>
            </div>
          )}
          
          {summary && !isLoading && !error && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Content Summary</h3>
                <button 
                  onClick={() => setShowSummary(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-sm">
                {summary}
              </div>
            </div>
          )}
        </div>
      )}

      <CategoryCard categoryId={categoryId}/>
      <PostCard/>
    </div>
  );
};

export default InfoContent;
