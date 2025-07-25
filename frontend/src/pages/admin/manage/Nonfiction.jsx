import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Box,
    Typography,
    Alert,
    Snackbar,
    CircularProgress
} from '@mui/material';
import axios from 'axios';

const Nonfiction = () => {
    const [notifications, setNotifications] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [loading, setLoading] = useState(true);

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        const adminToken = localStorage.getItem("admintoken");
        return {
            Authorization: `Bearer ${token}`,
            AdminAuthorization: `Bearer ${adminToken}`,
        };
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/notifications/broadcast`,
                { headers: getAuthHeaders() }
            );
            setNotifications(response.data.notifications || []);
        } catch (error) {
            if (error.response?.status === 401) {
                setSnackbar({
                    open: true,
                    message: "請重新登錄",
                    severity: "error",
                });
            } else {
                console.error("Error fetching notifications:", error);
                setSnackbar({
                    open: true,
                    message: "獲取通知失敗",
                    severity: "error",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setBroadcastMessage('');
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleSendBroadcast = async () => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/notifications/broadcast`,
                {
                    content: broadcastMessage,
                    type: 'broadcast'
                },
                { headers: getAuthHeaders() }
            );
            
            if (response.status === 200) {
                setSnackbar({
                    open: true,
                    message: "廣播發送成功",
                    severity: "success",
                });
                handleCloseDialog();
                fetchNotifications();
            }
        } catch (error) {
            if (error.response?.status === 401) {
                setSnackbar({
                    open: true,
                    message: "請重新登錄",
                    severity: "error",
                });
            } else {
                console.error("Error sending broadcast:", error);
                setSnackbar({
                    open: true,
                    message: "廣播發送失敗",
                    severity: "error",
                });
            }
        }
    };

    return (
        <Box className="p-4 bg-white dark:bg-gray-800 w-full h-full">
            <Box className="mb-4 flex justify-between items-center">
                <Typography variant="h5" component="h2">
                    Broadcast Notifications Management
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleOpenDialog}
                >
                    Send New Broadcast
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Message</TableCell>
                            <TableCell>Sent Time</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : notifications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    No broadcast notifications found
                                </TableCell>
                            </TableRow>
                        ) : (
                            notifications.map((notification) => (
                                <TableRow key={notification.notificationId}>
                                    <TableCell>{notification.content}</TableCell>
                                    <TableCell>
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog 
                open={openDialog} 
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Send Broadcast Notification</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Broadcast Message"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button 
                        onClick={handleSendBroadcast} 
                        variant="contained" 
                        color="primary"
                        disabled={!broadcastMessage.trim()}
                    >
                        Send
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Nonfiction;