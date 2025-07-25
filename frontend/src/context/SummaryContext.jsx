import React, { createContext, useState, useContext } from 'react';

const SummaryContext = createContext();

export const useSummary = () => {
  const context = useContext(SummaryContext);
  if (!context) {
    throw new Error('useSummary must be used within a SummaryProvider');
  }
  return context;
};

export const SummaryProvider = ({ children }) => {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateSummary = async (postId, messageId, content) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/data/summary/message/${postId}/${messageId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        }
      });
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. The API endpoint might be wrong or the server encountered an error.');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate summary');
      }
      
      setSummary(data.summary);
    } catch (err) {
      console.error('Error generating summary:', err);
      setError(err.message || 'An error occurred while generating summary');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SummaryContext.Provider value={{ 
      summary, 
      isLoading, 
      error, 
      generateSummary, 
      updateSummary: setSummary 
    }}>
      {children}
    </SummaryContext.Provider>
  );
}; 