import { Typography, TextField, Button, CircularProgress, Snackbar, Alert } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Define columns outside component to prevent unnecessary re-renders
const columns = [
  { field: "postId", headerName: "Post ID", width: 90 },
  { field: "userName", headerName: "User Name", width: 200 },
  { field: "category", headerName: "Category", width: 160 },
  { field: "title", headerName: "Title", width: 250 },
  { 
    field: "postTime", 
    headerName: "Post Time", 
    width: 180, 
    // Simple direct rendering instead of using valueFormatter
    renderCell: (params) => {
      try {
        // Direct rendering of formatted date
        if (!params.value) return "-";
        const date = new Date(params.value);
        if (isNaN(date.getTime())) return "-"; // Invalid date check
        
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      } catch (error) {
        console.error("Error rendering date:", error, params.value);
        return "-";
      }
    }
  },
  {
    field: "disable",
    headerName: "Disable",
    width: 130,
    type: "boolean",
    renderCell: (params) =>
      params.value === 1 ? "Yes" : params.value === 0 ? "No" : "-",
  },
];

const ManagePost = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectionModel, setSelectionModel] = useState([]);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 5,
    page: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("info");
  const [showAlert, setShowAlert] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/posts`,
        {
          headers: {
            AdminAuthorization: `Bearer ${localStorage.getItem("admintoken")}`,
          },
        }
      );
      
      console.log("API response data:", response.data);
      
      const formattedData = response.data.map(post => {
        // Keep ISO date string as is - it will be formatted in the renderCell function
        return {
          id: post.postId,
          postId: post.postId,
          userName: post.userName,
          category: post.category,
          title: post.title,
          postTime: post.postTime, // Keep as ISO string
          disable: post.disable,
          messageContent: post.messageContent
        };
      });
      
      console.log("Formatted data:", formattedData);
      setRows(formattedData);
      setFilteredRows(formattedData);
      setError(null);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to fetch posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("search") || "";
    setSearchQuery(query);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRows(rows);
    } else {
      const filtered = rows.filter((row) => {
        const userNameMatch = row.userName?.toLowerCase().includes(searchQuery.toLowerCase());
        const idMatch = row.postId?.toString().includes(searchQuery);
        const titleMatch = row.title?.toLowerCase().includes(searchQuery.toLowerCase());
        return userNameMatch || idMatch || titleMatch;
      });
      setFilteredRows(filtered);
    }
  }, [searchQuery, rows]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleRowClick = (params) => {
    console.log("Row clicked:", params.row.postId);
    navigate(`/post/${params.row.postId}`);
  };

  const handleGenerateReport = () => {
    if (selectionModel.length === 0) {
      setAlertMsg("Please select at least one post to generate a report.");
      setAlertSeverity("warning");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }
    
    const selectedPosts = rows.filter(row => selectionModel.includes(row.id || row.postId));
    navigate("/admin/posts/report-generator", { 
      state: { selectedPosts: selectedPosts } 
    });
  };

  const handlePunishment = async () => {
    if (selectionModel.length === 0) {
      setSnackbar({
        open: true,
        message: "Please select at least one post to apply punishment.",
        severity: "warning"
      });
      return;
    }

    try {
      setLoading(true);
      
      for (const postId of selectionModel) {
        const post = rows.find(r => r.postId === postId || r.id === postId);
        const newDisableStatus = post.disable ? 0 : 1;
        
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/admin/posts/${post.postId}/status`,
          { disable: newDisableStatus },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }
      
      fetchPosts();
    } catch (error) {
      console.error("Error updating post status:", error);
      setSnackbar({
        open: true,
        message: "Failed to update post status. Please try again.",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 p-4 sm:p-6 md:p-8">
      <Typography
        variant="h5"
        className="font-bold mb-4 text-black dark:text-white"
        sx={{ fontWeight: "bold" }}
      >
        Manage Posts
      </Typography>

      <div className="flex items-center gap-4 mb-4">
        <TextField
          label="Search by User Name, Post ID or Title"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          className="flex-1 max-w-md"
        />
        
        <Button
          variant="contained"
          onClick={fetchPosts}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          Refresh
        </Button>
      </div>

      {showAlert && (
        <Alert severity={alertSeverity} className="mb-4">
          {alertMsg}
        </Alert>
      )}

      <div className="flex-grow" style={{ height: 400, width: '100%' }}>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <CircularProgress />
          </div>
        ) : error ? (
          <Typography className="text-red-500 dark:text-red-400">
            {error}
          </Typography>
        ) : filteredRows.length === 0 ? (
          <Typography className="text-black dark:text-white">
            No posts found.
          </Typography>
        ) : (
          <div style={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            getRowId={(row) => row.id || row.postId}
            onRowClick={handleRowClick}
            checkboxSelection
            onRowSelectionModelChange={(newSelection) => {
              console.log("Selection changed:", newSelection);
              setSelectionModel(newSelection);
            }}
            rowSelectionModel={selectionModel}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25]}
            className="bg-white dark:bg-gray-800 text-black dark:text-white"
          />
          </div>
        )}
              <div className="mt-4">
        <Button
          variant="contained"
          onClick={handleGenerateReport}
          className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Generate Report"}
        </Button>
      </div>
      </div>



      {snackbar.open && (
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
    </div>
  );
};

export default ManagePost;