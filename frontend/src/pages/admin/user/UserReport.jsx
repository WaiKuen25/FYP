import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Typography, 
  Paper, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Divider, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Box,
  CircularProgress
} from "@mui/material";
import axios from "axios";
import { usePDF } from 'react-to-pdf';

const UserReport = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [reportGenerated, setReportGenerated] = useState(false);
  const { toPDF, targetRef } = usePDF({
    filename: `user_report_${userId}_${new Date().toISOString().split('T')[0]}.pdf`,
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
    const storedReport = localStorage.getItem("userReport");
    
    if (storedReport) {
      try {
        setReport(JSON.parse(storedReport));
        setLoading(false);
      } catch (e) {
        // If parsing fails, fetch from API
        fetchReportData();
      }
    } else {
      // If no data in local storage, fetch from API
      fetchReportData();
    }
  }, [userId]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Get admin token
      const adminToken = localStorage.getItem("admintoken");
      if (!adminToken) {
        setError("Admin token not found. Please log in again.");
        setLoading(false);
        return;
      }
      
      console.log("Using token:", adminToken);
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/generate/${userId}`,
        {
          headers: {
            AdminAuthorization: `Bearer ${adminToken}`,
          },
        }
      );
      setReport(response.data);
      // Update local storage
      localStorage.setItem("userReport", JSON.stringify(response.data));
      setLoading(false);
    } catch (err) {
      console.error("Error fetching report data:", err);
      let errorMessage = "Unable to retrieve user report data. Please try again later.";
      
      if (err.response) {
        console.error("Error response:", err.response.data);
        if (err.response.status === 401) {
          errorMessage = "Insufficient permissions or unauthorized. Please ensure you are logged in as an admin.";
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/admin/users/manage");
  };

  const handleGeneratePDF = () => {
    setLoading(true);
    
    // Use react-to-pdf to generate PDF
    toPDF()
      .then(() => {
        setReportGenerated(true);
        setTimeout(() => setReportGenerated(false), 3000);
      })
      .catch(err => console.error("Error generating PDF:", err))
      .finally(() => setLoading(false));
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !report) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
        <Typography className="ml-3">Loading...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center min-h-screen p-6">
        <Typography color="error">{error}</Typography>
        <Button variant="contained" onClick={handleBack} sx={{ mt: 2 }}>
          Back
        </Button>
      </div>
    );
  }

  if (!report || !report.userInfo) {
    return (
      <div className="flex flex-col items-center min-h-screen p-6">
        <Typography color="error">Unable to load user report data</Typography>
        <Button variant="contained" onClick={handleBack} sx={{ mt: 2 }}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black p-6">
      <div className="flex justify-between items-center mb-5">
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1a1a1a" }}>
          User Report
        </Typography>
        <div className="flex gap-3">
          <Button variant="outlined" onClick={handleBack}>
            Back
          </Button>
          <Button 
            variant="contained" 
            onClick={handleGeneratePDF}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Generate PDF"}
          </Button>
        </div>
      </div>

      {reportGenerated && (
        <Box sx={{ mb: 4, p: 3, bgcolor: '#e8f5e9', borderRadius: 1, color: '#2e7d32' }}>
          PDF generated successfully!
        </Box>
      )}

      <Paper elevation={3} sx={{ p: 4, mb: 4 }} className="print-container" ref={targetRef}>
        {/* User Basic Information */}
        <Box sx={{ mb: 4, border: '1px solid #ccc', borderRadius: '4px' }}>
          <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #ccc' }}>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              User ID: {report.userInfo.id} - {report.userInfo.nickName}
            </Typography>
          </Box>
          
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="user info table">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f9f9f9' }}>
                  <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #ddd' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #ddd' }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #ddd' }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #ddd' }}>Posts</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #ddd' }}>Comments</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Disabled</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ borderRight: '1px solid #ddd' }}>{report.userInfo.email}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid #ddd' }}>{report.userInfo.role || "Not Set"}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid #ddd' }}>{report.userInfo.department || "Not Set"}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid #ddd' }}>{report.activity.postCount}</TableCell>
                  <TableCell sx={{ borderRight: '1px solid #ddd' }}>{report.activity.commentCount}</TableCell>
                  <TableCell>{report.userInfo.disable ? "Yes" : "No"}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* User Message List */}
        {report.messages && report.messages.length > 0 ? (
          <Box sx={{ mb: 4, border: '1px solid #ccc', borderRadius: '4px' }}>
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #ccc' }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                User Message History
              </Typography>
            </Box>
            
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="messages table">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f9f9f9' }}>
                    <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #ddd' }}>Message ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #ddd' }}>Post ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #ddd' }}>Post Title</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', borderRight: '1px solid #ddd' }}>Message Content</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.messages
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((message) => (
                    <TableRow key={`${message.postId}-${message.messageId}`} sx={{ '&:nth-of-type(even)': { bgcolor: '#f9f9f9' } }}>
                      <TableCell sx={{ borderRight: '1px solid #ddd' }}>{message.messageId}</TableCell>
                      <TableCell sx={{ borderRight: '1px solid #ddd' }}>{message.postId}</TableCell>
                      <TableCell sx={{ borderRight: '1px solid #ddd' }}>{message.postTitle}</TableCell>
                      <TableCell 
                        sx={{ 
                          borderRight: '1px solid #ddd',
                          maxWidth: 300,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {message.content}
                      </TableCell>
                      <TableCell>{formatDate(message.messageTime)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={report.messages.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Rows per page:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
            />
          </Box>
        ) : (
          <Box sx={{ my: 4, p: 3, border: '1px solid #ccc', borderRadius: '4px', bgcolor: '#f9f9f9' }}>
            <Typography align="center">This user has not sent any messages yet</Typography>
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />
        
        <Typography variant="body2" sx={{ mt: 3, color: "text.secondary", textAlign: 'right' }}>
          Report generated at: {formatDate(report.generatedAt)}
        </Typography>
      </Paper>
    </div>
  );
};

export default UserReport;