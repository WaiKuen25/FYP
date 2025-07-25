import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Box,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from "@mui/material";
import { ArrowBack, ExpandMore } from "@mui/icons-material";
import { usePDF } from 'react-to-pdf';

const ReportGenerator = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
    const { toPDF, targetRef } = usePDF({
    filename: `post_report_${new Date().toISOString().split('T')[0]}.pdf`,
    page: { 
      margin: 20,
      format: 'a4',
      orientation: 'portrait' 
    },
    canvas: {
      mimeType: 'image/png',
      qualityRatio: 1
    }
  });

  useEffect(() => {
    // 檢查是否有傳遞的帖子數據
    if (location.state?.selectedPosts) {
      console.log("接收到的帖子數據:", location.state.selectedPosts);
      setPosts(location.state.selectedPosts);
      
      // 獲取每個帖子的所有消息
      fetchPostMessages(location.state.selectedPosts);
    } else {
      // 如果沒有選擇帖子，則返回到管理頁面
      navigate("/admin/posts/manage");
    }
  }, [location, navigate]);

  // 獲取每個帖子的所有消息
  const fetchPostMessages = async (postsData) => {
    setLoading(true);
    const messagesObj = {};
    
    try {
      for (const post of postsData) {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/data/messages/${post.postId}`,
          {
            headers: {
              AdminAuthorization: `Bearer ${localStorage.getItem("admintoken")}`,
            },
          }
        );
        
        if (response.data && response.data.length > 0) {
          messagesObj[post.postId] = response.data;
        } else {
          messagesObj[post.postId] = [];
        }
      }
      
      setMessages(messagesObj);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    setLoading(true);
    
    toPDF()
      .then(() => {
        setReportGenerated(true);
        setTimeout(() => setReportGenerated(false), 3000);
      })
      .catch(err => console.error("Error generating PDF:", err))
      .finally(() => setLoading(false));
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && Object.keys(messages).length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 p-4 sm:p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/admin/posts/manage")}
            className="mr-4 text-black dark:text-white"
          >
            Back
          </Button>
          <Typography
            variant="h5"
            className="font-bold text-black dark:text-white"
          >
            Post Report Generator
          </Typography>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="contained"
            onClick={handleGenerateReport}
            disabled={loading || posts.length === 0}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            {loading ? <CircularProgress size={24} /> : "Generate PDF Report"}
          </Button>
        
        </div>
      </div>

      {reportGenerated && (
        <Box className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
          Report generated successfully!
        </Box>
      )}

      <Paper elevation={3} className="p-4 mb-6 print-container" ref={targetRef}>
        <Box className="mb-4 p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200">
          <Typography variant="h6" className="font-bold text-black dark:text-white">
            Post Management Report
          </Typography>
          <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
            Generated On: {new Date().toLocaleString()}
          </Typography>
          <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
            Selected Posts: {posts.length}
          </Typography>
        </Box>

        <Box className="mb-6 border border-gray-200 rounded">
          <Box className="p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200">
            <Typography variant="subtitle1" className="font-semibold text-black dark:text-white">
              Posts Summary
            </Typography>
          </Box>
          
          <TableContainer>
            <Table className="min-w-full" aria-label="post table">
              <TableHead>
                <TableRow className="bg-gray-50 dark:bg-gray-700">
                  <TableCell className="font-bold text-black dark:text-white border-r border-gray-200">Post ID</TableCell>
                  <TableCell className="font-bold text-black dark:text-white border-r border-gray-200">User Name</TableCell>
                  <TableCell className="font-bold text-black dark:text-white border-r border-gray-200">Category</TableCell>
                  <TableCell className="font-bold text-black dark:text-white border-r border-gray-200">Title</TableCell>
                  <TableCell className="font-bold text-black dark:text-white border-r border-gray-200">Post Time</TableCell>
                  <TableCell className="font-bold text-black dark:text-white">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.postId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell className="text-black dark:text-white border-r border-gray-200">{post.postId}</TableCell>
                    <TableCell className="text-black dark:text-white border-r border-gray-200">{post.userName}</TableCell>
                    <TableCell className="text-black dark:text-white border-r border-gray-200">{post.category}</TableCell>
                    <TableCell className="text-black dark:text-white border-r border-gray-200">{post.title}</TableCell>
                    <TableCell className="text-black dark:text-white border-r border-gray-200">{formatDate(post.postTime)}</TableCell>
                    <TableCell className="text-black dark:text-white">
                      <span className={`px-2 py-1 rounded-full text-xs ${post.disable ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {post.disable ? "Disabled" : "Active"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {posts.length > 0 && (
          <Box className="border border-gray-200 rounded">
            <Box className="p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200">
              <Typography variant="subtitle1" className="font-semibold text-black dark:text-white">
                Posts and Messages Details
              </Typography>
            </Box>
            
            {posts.map((post) => (
              <Box key={post.postId} className="border-b border-gray-200 last:border-b-0">
                <Accordion defaultExpanded>
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    className="bg-gray-50 dark:bg-gray-700"
                  >
                    <Typography variant="subtitle1" className="font-bold text-black dark:text-white">
                      Post #{post.postId} - {post.title}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails className="p-4">
                    {messages[post.postId] && messages[post.postId].length > 0 && (
                      <Box className="mt-4">
                        <Typography variant="body2" className="font-semibold text-black dark:text-white mb-2">
                          All Messages ({messages[post.postId].length}):
                        </Typography>
                        
                        <TableContainer className="border border-gray-200 rounded">
                          <Table size="small">
                            <TableHead>
                              <TableRow className="bg-gray-50 dark:bg-gray-700">
                                <TableCell className="font-semibold text-black dark:text-white border-r border-gray-200">ID</TableCell>
                                <TableCell className="font-semibold text-black dark:text-white border-r border-gray-200">User</TableCell>
                                <TableCell className="font-semibold text-black dark:text-white border-r border-gray-200">Time</TableCell>
                                <TableCell className="font-semibold text-black dark:text-white border-r border-gray-200">Content</TableCell>
                                <TableCell className="font-semibold text-black dark:text-white border-r border-gray-200">Likes</TableCell>
                                <TableCell className="font-semibold text-black dark:text-white border-r border-gray-200">Dislikes</TableCell>
                                <TableCell className="font-semibold text-black dark:text-white">Status</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {messages[post.postId].map((message) => (
                                <TableRow key={`${post.postId}-${message.messageId}`}>
                                  <TableCell className="text-black dark:text-white border-r border-gray-200">
                                    {message.messageId}
                                  </TableCell>
                                  <TableCell className="text-black dark:text-white border-r border-gray-200">
                                    {message.user_name || "Unknown"}
                                  </TableCell>
                                  <TableCell className="text-black dark:text-white border-r border-gray-200">
                                    {formatDate(message.createdAt)}
                                  </TableCell>
                                  <TableCell className="text-black dark:text-white border-r border-gray-200">
                                    <div className="max-h-20 overflow-y-auto whitespace-pre-line">
                                      {message.content || "No content"}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-black dark:text-white border-r border-gray-200">
                                    {message.likes || 0}
                                  </TableCell>
                                  <TableCell className="text-black dark:text-white border-r border-gray-200">
                                    {message.dislikes || 0}
                                  </TableCell>
                                  <TableCell className="text-black dark:text-white">
                                    <span className={`px-2 py-1 rounded-full text-xs ${message.isDisabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                      {message.isDisabled ? "Disabled" : "Active"}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              </Box>
            ))}
          </Box>
        )}
        
        <Divider className="my-4" />
        
        <Typography variant="body2" className="mt-3 text-gray-500 dark:text-gray-400 text-right">
          Report generated by {localStorage.getItem("username") || "Admin User"} at {new Date().toLocaleString()}
        </Typography>
      </Paper>
      
      <style jsx="true">{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          button, .bg-green-100 {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportGenerator; 