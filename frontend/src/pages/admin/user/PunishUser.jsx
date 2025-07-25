import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Divider,
  Chip
} from "@mui/material";
import axios from "axios";

const PunishUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [punishments, setPunishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Punishment form
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("30");
  const [submitting, setSubmitting] = useState(false);
  const [revokingId, setRevokingId] = useState(null);

  // Default punishment duration options
  const durationOptions = [
    { value: "1", label: "1 Day" },
    { value: "3", label: "3 Days" },
    { value: "7", label: "7 Days" },
    { value: "30", label: "30 Days" },
    { value: "90", label: "90 Days" },
    { value: "180", label: "180 Days" },
    { value: "365", label: "1 Year" },
    { value: "forever", label: "Permanent" }
  ];

  useEffect(() => {
    fetchUserData();
    fetchPunishments();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/getUserInfo/${userId}`,
        {
          headers: {
            AdminAuthorization: `Bearer ${localStorage.getItem("admintoken")}`,
          },
        }
      );
      setUserInfo(response.data);
    } catch (error) {
      console.error("Error getting user information:", error);
      setError("Unable to retrieve user information");
    } finally {
      setLoading(false);
    }
  };

  const fetchPunishments = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/getUserPunishments/${userId}`,
        {
          headers: {
            AdminAuthorization: `Bearer ${localStorage.getItem("admintoken")}`,
          },
        }
      );
      setPunishments(response.data);
    } catch (error) {
      console.error("Error retrieving punishment records:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError(null);

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/punishUser`,
        {
          userId,
          reason,
          duration
        },
        {
          headers: {
            AdminAuthorization: `Bearer ${localStorage.getItem("admintoken")}`,
          },
        }
      );
      
      setSuccess("Punishment successful!");
      setReason(""); // Clear reason input
      fetchPunishments(); // Refresh punishment records
    } catch (error) {
      console.error("Error when punishing user:", error);
      setError("Punishment failed: " + (error.response?.data?.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate("/admin/users/manage");
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

  // Revoke punishment
  const handleRevokePunishment = async (punishmentId) => {
    if (revokingId) return; // Prevent multiple clicks
    
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
        ? "Punishment revoked, user has been unbanned"
        : "Punishment revoked, but user still has other active punishments");
        
      fetchPunishments(); // Refresh punishment records
    } catch (error) {
      console.error("Error revoking punishment:", error);
      setError("Failed to revoke punishment: " + (error.response?.data?.message || "Unknown error"));
    } finally {
      setRevokingId(null);
    }
  };

  if (loading) {
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
          User Punishment
        </Typography>
        <Button variant="outlined" onClick={handleBack}>
          Back
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
        <Typography variant="h6" sx={{ mb: 3 }}>
          Punish User: {userInfo?.nickName || userId}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Reason for Punishment"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              fullWidth
              multiline
              rows={3}
              placeholder="Please enter the reason for punishment..."
            />

            <FormControl fullWidth>
              <InputLabel>Duration</InputLabel>
              <Select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                label="Duration"
                required
              >
                {durationOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              color="error"
              disabled={submitting}
              sx={{ alignSelf: "flex-start" }}
            >
              Execute Punishment
            </Button>
          </Box>
        </form>
      </Paper>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Punishment History
        </Typography>

        {punishments.length > 0 ? (
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="punishment history table">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f9f9f9' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Punishment ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Start Time</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>End Time</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Admin</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {punishments.map((punishment) => {
                  const status = getPunishmentStatus(punishment);
                  return (
                    <TableRow key={punishment.punishmentId}>
                      <TableCell>{punishment.punishmentId}</TableCell>
                      <TableCell>{punishment.reason}</TableCell>
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
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography align="center" sx={{ py: 3 }}>
            This user has no punishment records
          </Typography>
        )}
      </Paper>
    </div>
  );
};

export default PunishUser; 