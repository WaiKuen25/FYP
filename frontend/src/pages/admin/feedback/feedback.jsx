import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Pagination,
  Card,
  CardContent,
  Typography,
  Grid,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTimes,
  faEye,
  faSort,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

const Feedback = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ types: [], status: {} });
  
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    search: "",
    sortBy: "createdAt",
    sortOrder: "DESC",
    page: 1,
    limit: 10,
  });
  
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });

  const fetchReports = async () => {
    try {
      const adminToken = localStorage.getItem("admintoken");
      if (!adminToken) {
        console.error("Admin token not found");
        return;
      }

      const queryFilters = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "all" && value !== "") {
          queryFilters[key] = value;
        }
      });

      const queryParams = new URLSearchParams(queryFilters).toString();

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/feedback/all?${queryParams}`,
        {
          headers: {
            "Content-Type": "application/json",
            AdminAuthorization: `Bearer ${adminToken}`,
          },
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch reports");
      }

      const data = await response.json();
      setReports(data.reports || []);
      setPagination(data.pagination || { total: 0, totalPages: 0 });
      setStats(data.stats || { types: [], status: {} });
    } catch (error) {
      console.error("Error fetching reports:", error);
      setReports([]);
      setPagination({ total: 0, totalPages: 0 });
      setStats({ types: [], status: {} });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1,
    }));
  };

  const handleSort = (field) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortOrder === "ASC" ? "DESC" : "ASC",
    }));
  };

  const handlePageChange = (event, value) => {
    setFilters(prev => ({
      ...prev,
      page: value,
    }));
  };

  const handleStatusUpdate = async (feedbackId, isAccept) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/feedback/${feedbackId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            AdminAuthorization: `Bearer ${localStorage.getItem("admintoken")}`,
          },
          body: JSON.stringify({ isAccept }),
        }
      );

      if (response.ok) {
        setReports((prevReports) =>
          prevReports.map((report) =>
            report.feedbackId === feedbackId
              ? { ...report, isAccept }
              : report
          )
        );
        fetchReports(); // Refresh the list to update statistics
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("An error occurred while processing the report");
    }
  };

  const getStatusChip = (status) => {
    if (status === null) {
      return <Chip label="Pending" color="warning" />;
    } else if (status === 1) {
      return <Chip label="Accepted" color="success" />;
    } else {
      return <Chip label="Rejected" color="error" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Report Management
      </h1>

      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Reports
              </Typography>
              <Typography variant="h4">
                {stats.status.pending || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Accepted Reports
              </Typography>
              <Typography variant="h4" className="text-green-600">
                {stats.status.accepted || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Rejected Reports
              </Typography>
              <Typography variant="h4" className="text-red-600">
                {stats.status.rejected || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box className="mb-4 flex flex-wrap gap-4">
        <FormControl size="small" style={{ minWidth: 120 }}>
          <InputLabel>Report Type</InputLabel>
          <Select
            value={filters.type}
            label="Report Type"
            onChange={(e) => handleFilterChange("type", e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            {stats.types.map((type) => (
              <MenuItem key={type.type} value={type.type}>
                {type.type} ({type.count})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" style={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="accepted">Accepted</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          InputProps={{
            startAdornment: (
              <FontAwesomeIcon icon={faSearch} className="mr-2 text-gray-400" />
            ),
          }}
          sx={{ minWidth: 200 }}
        />
      </Box>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("createdAt")}
                    >
                      Report Time
                      <FontAwesomeIcon icon={faSort} className="ml-1" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("reporterName")}
                    >
                      Reporter
                      <FontAwesomeIcon icon={faSort} className="ml-1" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("postTitle")}
                    >
                      Post Title
                      <FontAwesomeIcon icon={faSort} className="ml-1" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("type")}
                    >
                      Report Type
                      <FontAwesomeIcon icon={faSort} className="ml-1" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("isAccept")}
                    >
                      Status
                      <FontAwesomeIcon icon={faSort} className="ml-1" />
                    </div>
                  </TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.feedbackId}>
                    <TableCell>{formatDate(report.createdAt)}</TableCell>
                    <TableCell>{report.reporterName}</TableCell>
                    <TableCell>{report.postTitle}</TableCell>
                    <TableCell>{report.type}</TableCell>
                    <TableCell>{getStatusChip(report.isAccept)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Tooltip title="View Details">
                          <IconButton
                            onClick={() => {
                              setSelectedReport(report);
                              setViewDialogOpen(true);
                            }}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </IconButton>
                        </Tooltip>
                        {report.isAccept === null && (
                          <>
                            <Tooltip title="Accept">
                              <IconButton
                                color="success"
                                onClick={() =>
                                  handleStatusUpdate(report.feedbackId, 1)
                                }
                              >
                                <FontAwesomeIcon icon={faCheck} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                color="error"
                                onClick={() =>
                                  handleStatusUpdate(report.feedbackId, 0)
                                }
                              >
                                <FontAwesomeIcon icon={faTimes} />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box className="mt-4 flex justify-center">
            <Pagination
              count={pagination.totalPages}
              page={filters.page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}

      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedReport && (
          <>
            <DialogTitle>Report Details</DialogTitle>
            <DialogContent>
              <div className="space-y-4 mt-2">
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                    Report Information
                  </h3>
                  <p>Report Time: {formatDate(selectedReport.createdAt)}</p>
                  <p>Reporter: {selectedReport.reporterName}</p>
                  <p>Report Type: {selectedReport.type}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                    Report Reason
                  </h3>
                  <p className="whitespace-pre-wrap">{selectedReport.reason}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                    Reported Message
                  </h3>
                  <p>Post Title: {selectedReport.postTitle}</p>
                  <p>Author: {selectedReport.messageAuthorName}</p>
                  <p className="whitespace-pre-wrap">
                    Content: {selectedReport.messageContent}
                  </p>
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
              {selectedReport.isAccept === null && (
                <>
                  <Button
                    color="success"
                    onClick={() => {
                      handleStatusUpdate(selectedReport.feedbackId, 1);
                      setViewDialogOpen(false);
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    color="error"
                    onClick={() => {
                      handleStatusUpdate(selectedReport.feedbackId, 0);
                      setViewDialogOpen(false);
                    }}
                  >
                    Reject
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
};

export default Feedback;
