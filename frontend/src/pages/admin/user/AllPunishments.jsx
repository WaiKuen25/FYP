import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Paper,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Alert,
  TextField,
  IconButton
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import axios from "axios";

const AllPunishments = () => {
  const navigate = useNavigate();
  const [punishments, setPunishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [revokingId, setRevokingId] = useState(null);
  const [filteredPunishments, setFilteredPunishments] = useState([]);
  
  useEffect(() => {
    fetchAllPunishments();
  }, []);
  
  useEffect(() => {
    if (punishments.length > 0) {
      filterPunishments();
    }
  }, [searchTerm, punishments]);
  
  const fetchAllPunishments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/getAllPunishments`,
        {
          headers: {
            AdminAuthorization: `Bearer ${localStorage.getItem("admintoken")}`,
          },
        }
      );
      
      setPunishments(response.data);
      setFilteredPunishments(response.data);
    } catch (error) {
      console.error("Error fetching all punishment records:", error);
      setError("Unable to fetch punishment records");
    } finally {
      setLoading(false);
    }
  };
  
  const filterPunishments = () => {
    if (!searchTerm.trim()) {
      setFilteredPunishments(punishments);
      return;
    }
    
    const filtered = punishments.filter(punishment => {
      const term = searchTerm.toLowerCase();
      return (
        punishment.punishmentId.toString().includes(term) ||
        punishment.userId.toString().includes(term) ||
        punishment.userEmail.toLowerCase().includes(term) ||
        punishment.userNickName.toLowerCase().includes(term) ||
        punishment.reason.toLowerCase().includes(term)
      );
    });
    
    setFilteredPunishments(filtered);
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const handleRevokePunishment = async (punishmentId) => {
    if (revokingId) return;
    
    setRevokingId(punishmentId);
    setSuccess(null);
    setError(null);
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/revokePunishment/${punishmentId}`,
        {},
        {
          headers: {
            AdminAuthorization: `Bearer ${localStorage.getItem("admintoken")}`,
          },
        }
      );
      
      setSuccess(response.data.userUnbanned 
        ? "Punishment revoked, user is no longer banned"
        : "Punishment revoked, but user still has other active punishments");
        
      fetchAllPunishments();
    } catch (error) {
      console.error("Error revoking punishment:", error);
      setError("Failed to revoke punishment: " + (error.response?.data?.message || "Unknown error"));
    } finally {
      setRevokingId(null);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return "Permanent";
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getPunishmentStatus = (punishment) => {
    if (!punishment.isActive) return "Revoked";
    if (punishment.isPermanent) return "Permanent";
    
    const endDate = new Date(punishment.endDate);
    const now = new Date();
    
    if (endDate < now) return "Expired";
    return "Active";
  };
  
  const getPunishmentStatusColor = (status) => {
    switch (status) {
      case "Active": return "error";
      case "Expired": return "success";
      case "Revoked": return "info";
      case "Permanent": return "error";
      default: return "default";
    }
  };
  
  if (loading && punishments.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Typography>Loading...</Typography>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black p-6">
      <div className="flex justify-between items-center mb-5">
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1a1a1a" }}>
          All Punishment Records
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={fetchAllPunishments}
        >
          Refresh
        </Button>
      </div>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: "flex", mb: 3, gap: 2 }}>
          <TextField
            label="Search Punishment Records"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Enter ID, username, reason, etc..."
            InputProps={{
              endAdornment: (
                <IconButton>
                  <SearchIcon />
                </IconButton>
              ),
            }}
          />
        </Box>
        
        {filteredPunishments.length > 0 ? (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="punishments table">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f9f9f9' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Punishment ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>User ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Reason</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Start Time</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>End Time</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Admin</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPunishments
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((punishment) => {
                      const status = getPunishmentStatus(punishment);
                      return (
                        <TableRow key={punishment.punishmentId}>
                          <TableCell>{punishment.punishmentId}</TableCell>
                          <TableCell>{punishment.userId}</TableCell>
                          <TableCell>{punishment.userNickName}</TableCell>
                          <TableCell>
                            <Box sx={{ 
                              maxWidth: 200,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis' 
                            }}>
                              {punishment.reason}
                            </Box>
                          </TableCell>
                          <TableCell>{formatDate(punishment.startDate)}</TableCell>
                          <TableCell>{formatDate(punishment.endDate)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={status} 
                              color={getPunishmentStatusColor(status)} 
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{punishment.adminUserId}</TableCell>
                          <TableCell>
                            {status === "Active" && (
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                onClick={() => handleRevokePunishment(punishment.punishmentId)}
                                disabled={revokingId === punishment.punishmentId}
                              >
                                {revokingId === punishment.punishmentId ? "Processing..." : "Revoke Punishment"}
                              </Button>
                            )}
                            <Button
                              variant="text"
                              color="primary"
                              size="small"
                              onClick={() => navigate(`/admin/users/punish/${punishment.userId}`)}
                              sx={{ ml: 1 }}
                            >
                              View User
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredPunishments.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Rows per page:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
            />
          </>
        ) : (
          <Typography align="center" sx={{ py: 3 }}>
            {loading ? "Loading..." : "No punishment records found"}
          </Typography>
        )}
      </Paper>
    </div>
  );
};

export default AllPunishments;