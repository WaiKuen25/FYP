import React, { useState, useContext } from 'react';
import { TextField, Button, Typography, Box } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PostContext } from '../../../context/PostContext';
import axios from 'axios';

const SelectPost = () => {
  const [postId, setPostId] = useState('');
  const [pinContent, setPinContent] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const { setPostData } = useContext(PostContext);

  const check = async () => {
    try {
      if (!startTime || !endTime) {
        alert('Please set both start and end times.');
        return false;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/data/getPinContent?postId=${postId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const postData = response.data?.[0];
      if (!postData) {
        alert('There is no such postId');
        return false;
      }

      const postData2 = {
        pinContent: pinContent || 'Default Pin Content',
        userName: postData.userName || 'Unknown User',
        title: postData.title || 'No Title',
        timestamp: postData.timestamp || 'Unknown Timestamp',
        mediaName: postData.mediaName || 'No Media',
        likeCount: postData.likeCount || '0',
        dislikeCount: postData.dislikeCount || '0',
        userReaction: postData.userReaction || null,
        messageContent: postData.messageContent || 'No Content Available',
        postId: postId,
      };
      setPostData(postData2);
      console.log('Post data successfully fetched:', postData2);
      return true;
    } catch (error) {
      console.error('Error fetching post data:', error);
      alert('Failed to fetch post data. Please try again later.');
      return false;
    }
  };

  const createPost = async () => {
    const isValid = await check();
    if (!isValid) return;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/data/postContent`,
        {
          postId,
          pinContent,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            AdminAuthorization: `Bearer ${localStorage.getItem('admintoken')}`,
          },
        }
      );

      if (response) {
        alert('The pin content was successfully created!');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        padding: 4,
        bgcolor: '#ffffff',
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        maxWidth: 600,
        mx: 'auto',
      }}
    >
      <Typography
        variant="h5"
        sx={{ fontWeight: 'bold', mb: 3, color: '#1a1a1a' }}
      >
        Select Post for Notification
      </Typography>
      <form>
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Post ID"
            type="number"
            variant="outlined"
            fullWidth
            value={postId}
            onChange={(e) => setPostId(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
          />
        </Box>
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Pin Title"
            variant="outlined"
            fullWidth
            value={pinContent}
            onChange={(e) => setPinContent(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
          />
        </Box>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ mb: 3 }}>
            <DateTimePicker
              label="Start Date & Time"
              value={startTime}
              onChange={(newValue) => setStartTime(newValue)}
              renderInput={(params) => (
                <TextField {...params} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }} />
              )}
            />
          </Box>
          <Box sx={{ mb: 3 }}>
            <DateTimePicker
              label="End Date & Time"
              value={endTime}
              onChange={(newValue) => setEndTime(newValue)}
              renderInput={(params) => (
                <TextField {...params} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }} />
              )}
            />
          </Box>
        </LocalizationProvider>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={check}
            sx={{ flex: 1, py: 1.5, borderRadius: 1 }}
          >
            Check
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={createPost}
            sx={{ flex: 1, py: 1.5, borderRadius: 1 }}
          >
            Create
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default SelectPost;