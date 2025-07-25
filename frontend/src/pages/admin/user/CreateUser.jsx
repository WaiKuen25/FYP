import { useState } from "react";
import axios from 'axios';
import { 
  Typography, 
  TextField, 
  Button, 
  MenuItem, 
  Select, 
  InputLabel, 
  FormControl, 
  Box,
  Paper
} from "@mui/material";
import Notification from "../../../components/ui/Notification";
import { setNofication } from "../../../service/nofication";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const CreateUser = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nickName: "",
    department: ""
  });

  const [message, setMessage] = useState({
    type: "",
    message: ""
  });

  const navigate = useNavigate(); // Initialize the navigate function

  const departments = [
    "Health and Life Sciences",
    "Business",
    "Childcare, Elderly and Community Services",
    "Design",
    "Engineering",
    "Hospitality",
    "Information Technology",
    "Campus Secretariat"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setNofication(setMessage, "error", "The passwords do not match");
      return;
    }

    const registerData = {
      email: formData.email.toLowerCase(),
      password: formData.password,
      nickName: formData.nickName,
      department: formData.department,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/registerTestAccount`,
        registerData,
        {
          headers: {
            'Content-Type': 'application/json',
            'AdminAuthorization': `Bearer ${localStorage.getItem("admintoken")}`,
          },
        }
      );
      
      if (response.data.success) {
        setNofication(setMessage, "success", response.data.message);
        // Navigate to the manage users page with the new user's nickname as a search query
        navigate(`/admin/users/manage?search=${encodeURIComponent(formData.nickName)}`);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred while creating the user";
      setNofication(setMessage, "error", errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen bg-white mt-2 p-2 flex-wrap justify-center gap-10 dark:bg-black">
      <Paper 
        elevation={2} 
        sx={{
          p: 4, 
          width: { xs: '100%', lg: '60%' },  
          height: 620,
          mb: { xs: 2, lg: 0 }
        }}
      >
        <Typography
          variant="h5"
          sx={{ 
            fontWeight: "bold", 
            mb: 4, 
            color: "#1a1a1a",
            textAlign: "left"
          }}
        >
          Create New User
        </Typography>

        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          sx={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: 3 
          }}
        >
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            fullWidth
            variant="outlined"
            sx={{ bgcolor: "white" }}
          />

          <TextField
            label="Nickname"
            name="nickName"
            value={formData.nickName}
            onChange={handleChange}
            required
            fullWidth
            variant="outlined"
            sx={{ bgcolor: "white" }}
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            fullWidth
            variant="outlined"
            sx={{ bgcolor: "white" }}
          />

          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            fullWidth
            variant="outlined"
            sx={{ bgcolor: "white" }}
          />

          <FormControl fullWidth required>
            <InputLabel>Department</InputLabel>
            <Select
              name="department"
              value={formData.department}
              onChange={handleChange}
              label="Department"
              sx={{ bgcolor: "white" }}
            >
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            sx={{ 
              mt: 2,
              py: 1.5,
              bgcolor: "#1976d2",
              '&:hover': { bgcolor: "#115293" },
              textTransform: "none",
              fontSize: "1.1rem"
            }}
          >
            Create User
          </Button>
        </Box>
      </Paper>
      {message.type && (
        <Notification type={message.type} message={message.message} />
      )}
    </div>
  );
};

export default CreateUser;