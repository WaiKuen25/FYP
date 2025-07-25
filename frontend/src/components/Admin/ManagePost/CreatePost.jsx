import React, { useState, useContext } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PostContext } from '../../../context/PostContext';
import axios from 'axios';

const CreatePost = () => {
  const [pinContent, setPinContent] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [media, setMedia] = useState(null);
  const { setPostData } = useContext(PostContext);

  const handleSubmit = async () => {
    try {
      if (!startTime || !endTime) {
        alert('Please set both start and end times.');
        return;
      }

      if (!pinContent.trim()) {
        alert('Please enter pin content.');
        return;
      }

      if (!title.trim() || !content.trim() || !category) {
        alert('Please fill in all required fields.');
        return;
      }

      // First create the regular post
      const postFormData = new FormData();
      postFormData.append("title", title);
      postFormData.append("content", content);
      postFormData.append("category", category);
      if (media) {
        postFormData.append("media", media);
      }

      console.log('Sending post data:', {
        title,
        content,
        category,
        hasMedia: !!media
      });

      const postResponse = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/data/posts`,
        postFormData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            AdminAuthorization: `Bearer ${localStorage.getItem("admintoken")}`,
          },
        }
      );

      console.log('Post response:', postResponse.data);

      // Check the response structure
      const postId = postResponse.data?.id || postResponse.data?._id || postResponse.data?.postId;

      if (postId) {
        console.log('Creating pin content with postId:', postId);
        // 使用新的管理員專用API路由
        const pinData = {
          postId: postId,
          pinContent: pinContent,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString()
        };

        console.log('Sending pin content data:', pinData);

        const pinResponse = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/data/admin/pinContent`,
          pinData,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              AdminAuthorization: `Bearer ${localStorage.getItem("admintoken")}`,
            },
          }
        );

        console.log('Pin response:', pinResponse.data);

        if (pinResponse.data && pinResponse.data.success) {
          // Update the PostContext with the new data
          const newPostData = {
            pinContent: pinContent,
            title: title,
            content: content,
            category: category,
            mediaName: media ? media.name : null,
            postId: postId,
          };
          setPostData(newPostData);
          alert('The post and pin content were successfully created!');
        } else {
          console.error('Pin response error:', pinResponse.data);
          throw new Error(pinResponse.data?.error || 'Failed to create pin content');
        }
      } else {
        console.error('Post response data:', postResponse.data);
        throw new Error('Failed to get postId from response. Response data: ' + JSON.stringify(postResponse.data));
      }
    } catch (error) {
      console.error('Error creating post:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Failed to create post: ${error.response?.data?.error || error.message}. Please check the console for details.`);
    }
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedia(file);
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
        Create Notification Post
      </Typography>
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Pin Title"
            variant="outlined"
            fullWidth
            value={pinContent}
            onChange={(e) => setPinContent(e.target.value)}
          required
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
          />
        </Box>
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Post Title"
            variant="outlined"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          required
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
          />
        </Box>
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Post Content"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          required
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
          />
        </Box>
        <Box sx={{ mb: 3 }}>
        <FormControl fullWidth required>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Category"
              sx={{ borderRadius: 1 }}
            >
              <MenuItem value="" disabled>
                Select a category
              </MenuItem>
              <MenuItem value="1">Global</MenuItem>
              <MenuItem value="2">Health and Life Sciences</MenuItem>
              <MenuItem value="3">Business</MenuItem>
              <MenuItem value="4">Childcare, Elderly and Community Services</MenuItem>
              <MenuItem value="5">Design</MenuItem>
              <MenuItem value="6">Engineering</MenuItem>
              <MenuItem value="7">Hospitality</MenuItem>
              <MenuItem value="8">Information Technology</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ mb: 3 }}>
            <DateTimePicker
              label="Start Date & Time"
              value={startTime}
              onChange={(newValue) => setStartTime(newValue)}
              renderInput={(params) => (
              <TextField {...params} fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }} />
              )}
            />
          </Box>
          <Box sx={{ mb: 3 }}>
            <DateTimePicker
              label="End Date & Time"
              value={endTime}
              onChange={(newValue) => setEndTime(newValue)}
              renderInput={(params) => (
              <TextField {...params} fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }} />
              )}
            />
          </Box>
        </LocalizationProvider>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: '#555', mb: 1 }}>
            Upload Media
          </Typography>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleMediaChange}
            style={{ display: 'block', padding: '10px 0' }}
          />
          {media && (
            <Typography variant="body2" sx={{ mt: 1, color: '#777' }}>
              Selected: {media.name}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
          onClick={handleSubmit}
            sx={{ flex: 1, py: 1.5, borderRadius: 1 }}
          >
            Create
          </Button>
        </Box>
    </Box>
  );
};

export default CreatePost;