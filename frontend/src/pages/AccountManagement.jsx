import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../style/AccountManagement.module.css";

// Import images properly to ensure they load
import avatar1 from "../style/imge/image1.png";
import avatar2 from "../style/imge/image2.png";
import avatar3 from "../style/imge/image3.png";
import avatar4 from "../style/imge/image4.png";
import avatar5 from "../style/imge/image5.png";
import avatar6 from "../style/imge/image6.png";
import avatar7 from "../style/imge/image7.png";
import avatar8 from "../style/imge/image8.png";
import avatar9 from "../style/imge/image9.png";
import avatar10 from "../style/imge/image10.png";

// Set to false to use real API data
const DEV_MODE = false;

const AccountManagement = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("account-info");
  const [isDarkTheme, setIsDarkTheme] = useState(() => 
    localStorage.getItem("darkTheme") === "true" || false
  );
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [userData, setUserData] = useState({
    userId: "",
    fullName: "",
    email: "",
    phone: "",
    studentId: "",
    department: "",
    lastLogin: "",
    avatar: avatar1,
    role: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followedCategories, setFollowedCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordStrength, setPasswordStrength] = useState("");
  
  // Block list state
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockSearchQuery, setBlockSearchQuery] = useState("");
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockUserId, setBlockUserId] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [unblockReason, setUnblockReason] = useState("");
  const [blockedUserIds, setBlockedUserIds] = useState(new Set());
  const [profileForm, setProfileForm] = useState({
    studentId: "",
    fullName: "",
    department: "",
    currentEmail: "",
    newEmail: "",
    currentFullName: "",
    currentDepartment: "",
    phone: ""
  });
  
  // Using imported images directly to ensure they load correctly
  const [availableImages, setAvailableImages] = useState([
    { id: 1, path: avatar1, name: 'Avatar 1' },
    { id: 2, path: avatar2, name: 'Avatar 2' },
    { id: 3, path: avatar3, name: 'Avatar 3' },
    { id: 4, path: avatar4, name: 'Avatar 4' },
    { id: 5, path: avatar5, name: 'Avatar 5' },
    { id: 6, path: avatar6, name: 'Avatar 6' },
    { id: 7, path: avatar7, name: 'Avatar 7' },
    { id: 8, path: avatar8, name: 'Avatar 8' },
    { id: 9, path: avatar9, name: 'Avatar 9' },
    { id: 10, path: avatar10, name: 'Avatar 10' },
  ]);
  
  const [activeTab, setActiveTab] = useState("gallery");
  const fileInputRef = useRef(null);

  // Format last login time with AM/PM in English
  const formatLastLogin = (lastLoginTime) => {
    try {
      const lastLogin = new Date(lastLoginTime);
      const today = new Date();
      
      // Format options with English AM/PM
      const timeFormatOptions = { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      };
      
      // Check if last login was today
      if (lastLogin.toDateString() === today.toDateString()) {
        return `Today at ${lastLogin.toLocaleTimeString('en-US', timeFormatOptions)}`;
      }
      
      // Check if last login was yesterday
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      if (lastLogin.toDateString() === yesterday.toDateString()) {
        return `Yesterday at ${lastLogin.toLocaleTimeString('en-US', timeFormatOptions)}`;
      }
      
      // Otherwise return formatted date
      return `${lastLogin.toLocaleDateString()} at ${lastLogin.toLocaleTimeString('en-US', timeFormatOptions)}`;
    } catch (error) {
      console.error("Error formatting last login time:", error);
      return getCurrentFormattedTime();
    }
  };

  // Get current time formatted for last login with AM/PM in English
  const getCurrentFormattedTime = () => {
    const now = new Date();
    return `Today at ${now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })}`;
  };

  // Fetch user data from API
  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get tokens and stored data from localStorage
      const token = localStorage.getItem("token");
      const userConfigString = localStorage.getItem("userConfig");
      const nickName = localStorage.getItem("nickName");
      
      if (!token) {
        console.error("No authentication token found");
        setError("Please log in to view your account information");
        navigate("/login");
        return;
      }

      // Initialize with data available from localStorage
      let initialData = {
        userId: "",
        fullName: nickName || "",
        email: "", // Don't set default email, wait for API data
        phone: "1234 5678",
        studentId: "",
        department: "", // Don't set default department, wait for API data
        lastLogin: getCurrentFormattedTime(),
        avatar: localStorage.getItem('userAvatar') || avatar1,
        role: ""
      };
      
      // Parse userConfig if available for more data
      if (userConfigString) {
        try {
          const parsedConfig = JSON.parse(userConfigString);
          if (parsedConfig) {
            initialData = {
              ...initialData,
              userId: parsedConfig.userId || initialData.userId,
              studentId: parsedConfig.studentId || parsedConfig.userId || initialData.studentId,
            };

            // Load followed categories from userConfig
            if (parsedConfig.followCategory) {
              setFollowedCategories(parsedConfig.followCategory);
            }
          }
        } catch (e) {
          console.error("Error parsing userConfig:", e);
        }
      }
      
      // Check if we have cached user data
      const cachedUserData = localStorage.getItem('user');
      if (cachedUserData) {
        try {
          const parsedData = JSON.parse(cachedUserData);
          initialData = { ...initialData, ...parsedData };
        } catch (e) {
          console.error("Error parsing cached user data:", e);
          setError("Failed to load user data. Please try again later.");
        }
      }
      
      // Set initial data for immediate display
      setUserData(initialData);
      
      // Make API request to get complete user data
      console.log("Fetching user data from API...");
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/profile`, 
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        console.log("User data API response:", response.data);
        
        if (response.data) {
          // Extract user data from API response
          const user = response.data;
          
          // Update with data from API
          const updatedUserData = {
            userId: user.userId || initialData.userId,
            fullName: user.nickName || nickName || initialData.fullName,
            email: user.email || initialData.email,
            phone: user.phone || initialData.phone,
            studentId: user.studentId || user.userId || initialData.studentId,
            department: user.department || initialData.department,
            lastLogin: user.lastLogin ? formatLastLogin(user.lastLogin) : initialData.lastLogin,
            avatar: localStorage.getItem('userAvatar') || avatar1,
            role: user.role || initialData.role
          };
          
          // Print specific fields we're concerned about
          console.log("Email from API:", user.email);
          console.log("Department from API:", user.department);
          console.log("Updated user data:", updatedUserData);
          
          setUserData(updatedUserData);
          
          // Save to localStorage for future use
          localStorage.setItem('userFormData', JSON.stringify(updatedUserData));
        } else {
          console.warn("API returned no data or empty data");
        }
      } catch (apiError) {
        console.error("API request failed:", apiError);
        
        if (apiError.response) {
          console.error("Error response status:", apiError.response.status);
          console.error("Error response data:", apiError.response.data);
        }
      }
    } catch (error) {
      console.error("Error in fetchUserData:", error);
      
      // Use fallback from localStorage if available
      const savedData = localStorage.getItem('userFormData');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          console.log("Using saved data from localStorage:", parsedData);
          setUserData(parsedData);
        } catch (e) {
          console.error("Error parsing saved user data:", e);
          setError("Failed to load user data. Please try again later.");
        }
      } else {
        setError("Failed to load user data. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch all categories to display in the tracking list
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/data/category`
      );
      
      const categoriesData = response.data.map((category) => ({
        id: category.categoryId,
        name: category.categoryName,
        description: category.description || "No description available",
        imageUrl: category.photo || "",
      }));
      
      setAllCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch blocked users
  const fetchBlockedUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        showAlert("Please log in to view blocked users", "error");
        return;
      }

      console.log("Fetching blocked users..."); // Debug log

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/userConfig/blocked`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000 // Add timeout
        }
      );

      console.log("Blocked users response:", response.data); // Debug log

      if (response.data) {
        // Create blocked users list with proper structure
        const blockedUsersList = response.data.map(user => ({
          userId: user.userId,
          nickName: user.nickName || "Unknown User",
          blockDate: user.blockDate || new Date().toISOString(),
          reason: user.reason || "No reason provided"
        }));

        console.log("Processed blocked users list:", blockedUsersList); // Debug log

        // Update state
        setBlockedUsers(blockedUsersList);
        setBlockedUserIds(new Set(blockedUsersList.map(user => user.userId)));

        // Store in localStorage for persistence
        localStorage.setItem('blockedUsers', JSON.stringify(blockedUsersList));

        // Log final state
        console.log("Updated blocked users state:", blockedUsersList);
        console.log("Updated blocked user IDs:", new Set(blockedUsersList.map(user => user.userId)));
      }
    } catch (error) {
      console.error("Error fetching blocked users:", error);
      
      // Try to load from localStorage if API fails
      const savedBlockedUsers = localStorage.getItem('blockedUsers');
      if (savedBlockedUsers) {
        try {
          const parsedUsers = JSON.parse(savedBlockedUsers);
          setBlockedUsers(parsedUsers);
          setBlockedUserIds(new Set(parsedUsers.map(user => user.userId)));
          console.log("Loaded blocked users from localStorage:", parsedUsers);
        } catch (e) {
          console.error("Error parsing saved blocked users:", e);
        }
      }
      
      if (error.response) {
        showAlert(error.response.data.message || "Failed to fetch blocked users", "error");
      } else if (error.request) {
        showAlert("Server is not responding. Please check your connection.", "error");
      } else if (error.code === 'ECONNABORTED') {
        showAlert("Request timed out. Please try again.", "error");
      } else {
        showAlert("An error occurred while fetching blocked users.", "error");
      }
    }
  };

  // Handle unfollowing a category
  const handleUnfollowCategory = async (categoryId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showAlert("Please log in to manage your followed categories", "error");
        return;
      }

      // Call API to unfollow the category
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/userConfig/category/${categoryId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Update followed categories
        const updatedFollowedCategories = response.data.followCategory;
        setFollowedCategories(updatedFollowedCategories);

        // Update userConfig in localStorage
        const storedUserConfig = JSON.parse(localStorage.getItem("userConfig")) || {};
        storedUserConfig.followCategory = updatedFollowedCategories;
        localStorage.setItem("userConfig", JSON.stringify(storedUserConfig));

        showAlert("Category unfollowed successfully");
      }
    } catch (error) {
      console.error("Error unfollowing category:", error);
      showAlert("Failed to unfollow category. Please try again.", "error");
    }
  };
  
  // Handle blocking a user
  const handleBlockUser = async (e) => {
    e.preventDefault();
    
    if (!blockUserId.trim()) {
      showAlert("Please enter a user ID", "error");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showAlert("Please log in to block users", "error");
        return;
      }

      // Get current user ID from localStorage
      const currentUserId = localStorage.getItem("userId");
      if (currentUserId === blockUserId) {
        showAlert("You cannot block yourself", "error");
        return;
      }

      console.log("Blocking user:", blockUserId); // Debug log

      // Add timeout to the request
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/userConfig/block/${blockUserId}`, 
        { reason: blockReason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000 // 5 second timeout
        }
      );
      
      console.log("Block user response:", response.data); // Debug log

      if (response.data.success) {
        showAlert("User blocked successfully");
        
        // Create new blocked user object
        const newBlockedUser = {
          userId: blockUserId,
          nickName: "Unknown User", // Will be updated when fetching full list
          blockDate: new Date().toISOString(),
          reason: blockReason || "No reason provided"
        };

        console.log("Adding new blocked user:", newBlockedUser); // Debug log

        // Update blocked users list
        setBlockedUsers(prev => {
          const updatedList = [...prev, newBlockedUser];
          // Update localStorage
          localStorage.setItem('blockedUsers', JSON.stringify(updatedList));
          console.log("Updated blocked users list:", updatedList); // Debug log
          return updatedList;
        });
        
        // Update blocked user IDs set
        setBlockedUserIds(prev => {
          const newSet = new Set([...prev, blockUserId]);
          console.log("Updated blocked user IDs:", newSet); // Debug log
          return newSet;
        });

        // Clear form and close modal
        setBlockUserId("");
        setBlockReason("");
        closeBlockModal();

        // Force a re-fetch of blocked users to get complete user details
        await fetchBlockedUsers();
      } else {
        showAlert(response.data.message || "Failed to block user. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      if (error.response) {
        showAlert(error.response.data.message || "Failed to block user. Please try again.", "error");
      } else if (error.request) {
        showAlert("Server is not responding. Please check your connection and try again.", "error");
      } else if (error.code === 'ECONNABORTED') {
        showAlert("Request timed out. Please try again.", "error");
      } else {
        showAlert("An error occurred. Please try again.", "error");
      }
    }
  };
  
  // Handle unblocking a user
  const handleUnblockUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showAlert("Please log in to unblock users", "error");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/userConfig/unblock/${userId}`, 
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000 // Add timeout
        }
      );
      
      if (response.data.success) {
        showAlert("User unblocked successfully");
        
        // Update the blocked users list
        setBlockedUsers(prev => {
          const updatedList = prev.filter(user => user.userId !== userId);
          // Update localStorage
          localStorage.setItem('blockedUsers', JSON.stringify(updatedList));
          return updatedList;
        });
        
        // Update the blocked user IDs set
        setBlockedUserIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });

        // Force a re-fetch of blocked users to ensure consistency
        await fetchBlockedUsers();
      } else {
        showAlert("Failed to unblock user. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
      if (error.response) {
        showAlert(error.response.data.message || "Failed to unblock user", "error");
      } else if (error.request) {
        showAlert("Server is not responding. Please check your connection.", "error");
      } else if (error.code === 'ECONNABORTED') {
        showAlert("Request timed out. Please try again.", "error");
      } else {
        showAlert("An error occurred while unblocking user.", "error");
      }
    }
  };

  // Load user data and categories on component mount
  useEffect(() => {
    console.log("AccountManagement component mounted");
    
    // Fetch user data
    fetchUserData();
    
    // Fetch all categories
    fetchCategories();
    
    // Fetch blocked users
    fetchBlockedUsers();
    
    // Apply dark theme if saved
    if (isDarkTheme) {
      document.documentElement.classList.add('dark-theme');
    }
    
    // Cleanup function
    return () => {
      // Any cleanup needed
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    localStorage.setItem("darkTheme", newTheme);
    document.documentElement.classList.toggle('dark-theme', newTheme);
  };

  // Profile Modal Functions
  const openProfileModal = () => {
    if (userData) {
      console.log("User data in openProfileModal:", userData); // Debug log
      setProfileForm({
        studentId: userData.userId || "",
        fullName: "",
        department: "",
        currentEmail: userData.email || "",
        newEmail: "",
        currentFullName: userData.fullName || userData.nickName || "",
        currentDepartment: userData.department || "",
        phone: userData.phone || ""
      });
    }
    setShowProfileModal(true);
  };
  const closeProfileModal = () => setShowProfileModal(false);
  
  // Block Modal Functions
  const openBlockModal = () => setShowBlockModal(true);
  const closeBlockModal = () => {
    setShowBlockModal(false);
    setBlockUserId("");
    setBlockReason("");
  };
  
  // Password Modal Functions
  const openPasswordModal = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setPasswordStrength("");
    setShowPasswordModal(true);
  };
  
  const closePasswordModal = () => setShowPasswordModal(false);

  // Handle password field changes
  const handlePasswordChange = (e) => {
    const { id, value } = e.target;
    
    if (id === 'current-password') {
      setPasswordData(prev => ({
        ...prev,
        currentPassword: value
      }));
    } else if (id === 'new-password') {
      setPasswordData(prev => ({
        ...prev,
        newPassword: value
      }));
      checkPasswordStrength(value);
    } else if (id === 'confirm-password') {
      setPasswordData(prev => ({
        ...prev,
        confirmPassword: value
      }));
    }
  };

  // Image Selector Functions
  const openImageSelector = () => {
    setShowImageSelector(true);
    setActiveTab("gallery");
  };
  
  const closeImageSelector = () => setShowImageSelector(false);
  
  const handleImageSelect = (imagePath) => {
    updateAvatar(imagePath);
    closeImageSelector();
  };

  // Handle file upload in the image selector
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showAlert('Please select an image file', 'error');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showAlert('Image size should be less than 5MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        handleImageSelect(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // User Data Functions
  const updateUserData = async (newData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Update local state first for immediate feedback
      const updatedData = { ...userData, ...newData };
      setUserData(updatedData);
      
      // Make API request to update user data
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/profile`, 
        newData, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Profile update response:", response.data);
      
      // Backup to localStorage
      localStorage.setItem('userFormData', JSON.stringify(updatedData));
      
      showAlert('Profile updated successfully');
    } catch (error) {
      console.error("Error updating user data:", error);
      
      // Revert the change if API fails
      if (!DEV_MODE) {
        fetchUserData(); // Refresh data from server
        showAlert('Failed to update profile. Please try again.', 'error');
      }
    }
  };

  const updateAvatar = async (newAvatar) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Update local state for immediate feedback
      setUserData(prev => ({ ...prev, avatar: newAvatar }));
      
      // Store in localStorage
      localStorage.setItem('userAvatar', newAvatar);
      
      // For base64 images, we need to convert to a file/blob
      let avatarFile;
      if (newAvatar.startsWith('data:image')) {
        // It's a base64 string
        const response = await fetch(newAvatar);
        const blob = await response.blob();
        avatarFile = new File([blob], "avatar.jpg", { type: "image/jpeg" });
      } else {
        // It's a URL to an image, we would need to fetch it first
        // For simplicity in this example, we'll skip actual upload in this case
      }
      
      if (avatarFile) {
        // Create form data for file upload
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        
        // Make API request to update avatar
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/avatar`, 
          formData, 
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        console.log("Avatar update response:", response.data);
      }
      
      showAlert('Profile picture updated successfully');
    } catch (error) {
      console.error("Error updating avatar:", error);
      showAlert('Failed to update profile picture. Please try again.', 'error');
    }
  };

  // Alert Function
  const showAlert = (message, type = 'success') => {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
      <div class="alert-content">
        <div class="alert-icon">
          <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        </div>
        <div class="alert-text">
          <div class="alert-title">${type === 'success' ? 'Success!' : 'Error!'}</div>
          <p class="alert-message">${message}</p>
        </div>
        <button class="alert-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="alert-progress"></div>
    `;
    document.body.appendChild(alert);

    // Add click event to close button
    const closeBtn = alert.querySelector('.alert-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        alert.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => alert.remove(), 300);
      });
    }

    setTimeout(() => {
      alert.style.animation = 'slideOut 0.3s ease-in forwards';
      setTimeout(() => alert.remove(), 300);
    }, 3000);
  };

  // Handle Form Submissions
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showAlert("Please log in to update your profile", "error");
        return;
      }

      // Validate email if provided
      if (profileForm.newEmail && !validateEmail(profileForm.newEmail)) {
        showAlert("Please enter a valid email address", "error");
        return;
      }

      // Validate phone number if provided
      if (profileForm.phone && !validatePhone(profileForm.phone)) {
        showAlert("Please enter exactly 8 digits for the phone number", "error");
        return;
      }

      const updateData = {
        nickName: profileForm.fullName || profileForm.currentFullName,
        department: profileForm.department || profileForm.currentDepartment,
        phone: profileForm.phone ? formatPhoneNumber(profileForm.phone) : null
      };

      if (profileForm.newEmail && profileForm.newEmail !== profileForm.currentEmail) {
        updateData.email = profileForm.newEmail;
      }

      console.log("Sending update data:", updateData); // Debug log

      // First, get the current user data to verify
      const currentUserResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("Current user data:", currentUserResponse.data); // Debug log

      // Then send the update request
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/profile`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Update response:", response.data); // Debug log

      if (response.data) {
        showAlert("Profile updated successfully");
        setShowProfileModal(false);
        fetchUserData(); // Refresh user data
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        showAlert(`Failed to update profile: ${error.response.data.message || "Unknown error"}`, "error");
      } else if (error.request) {
        console.error("Error request:", error.request);
        showAlert("No response from server. Please check your connection.", "error");
      } else {
        console.error("Error message:", error.message);
        showAlert(`Failed to update profile: ${error.message}`, "error");
      }
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showAlert('Please fill in all password fields', 'error');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showAlert('New password and confirm password do not match', 'error');
      return;
    }

    if (passwordStrength === 'weak') {
      const confirmWeakPassword = window.confirm(
        'Your password is weak and may be vulnerable to attacks. Are you sure you want to use this password?\n\n' +
        'Recommendations for a stronger password:\n' +
        '• Use at least 8 characters\n' +
        '• Include uppercase and lowercase letters\n' +
        '• Include numbers and special characters\n\n' +
        'Click OK to use this password anyway, or Cancel to choose a stronger password.'
      );

      if (!confirmWeakPassword) {
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // API call to change password
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/password`, 
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.message === "Password changed successfully") {
        showAlert('Password changed successfully');
        closePasswordModal();
        // Clear password fields
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        showAlert('Failed to change password. Please try again.', 'error');
      }
    } catch (error) {
      console.error("Error changing password:", error);
      if (error.response) {
        if (error.response.status === 401) {
          showAlert('Current password is incorrect', 'error');
        } else if (error.response.status === 404) {
          showAlert('User not found', 'error');
        } else {
          showAlert('Failed to change password. Please try again.', 'error');
        }
      } else {
        showAlert('Network error. Please check your connection.', 'error');
      }
    }
  };

  // Utility Functions
  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validatePhone = (phone) => {
    // Remove any non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    // Check if the cleaned phone number is exactly 8 digits
    return cleanPhone.length === 8;
  };

  const formatPhoneNumber = (phone) => {
    // Remove any non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    // Format as XXXX XXXX
    return cleanPhone.replace(/(\d{4})(\d{4})/, '$1 $2');
  };

// Enhanced password strength checker
const checkPasswordStrength = (password) => {
  // Check requirements
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  
  // Update requirement indicators
  updateRequirement('length-check', checks.length);
  updateRequirement('uppercase-check', checks.uppercase);
  updateRequirement('lowercase-check', checks.lowercase);
  updateRequirement('number-check', checks.number);
  updateRequirement('special-check', checks.special);
  
  // Calculate strength score (0-5)
  const score = Object.values(checks).filter(Boolean).length;
  
  // Update strength meter
  const strengthMeterFill = document.getElementById('strength-meter-fill');
  const strengthLabel = document.getElementById('strength-label');
  const strengthScore = document.getElementById('strength-score');
  
  if (strengthMeterFill && strengthLabel) {
    strengthMeterFill.className = styles["strength-meter-fill"];
    strengthLabel.className = styles["strength-label"];
    
    let strengthLevel = "";
    let strengthText = "";
    
    if (password === '') {
      // Empty password
      strengthMeterFill.style.width = '0';
      strengthText = 'Password strength';
      strengthLevel = '';
    } else if (score <= 2) {
      // Weak password
      strengthMeterFill.classList.add(styles.weak);
      strengthLabel.classList.add(styles.weak);
      strengthText = 'Weak';
      strengthLevel = 'weak';
    } else if (score === 3) {
      // Medium password
      strengthMeterFill.classList.add(styles.medium);
      strengthLabel.classList.add(styles.medium);
      strengthText = 'Medium';
      strengthLevel = 'medium';
    } else if (score === 4) {
      // Strong password
      strengthMeterFill.classList.add(styles.strong);
      strengthLabel.classList.add(styles.strong);
      strengthText = 'Strong';
      strengthLevel = 'strong';
    } else {
      // Very strong password
      strengthMeterFill.classList.add(styles["very-strong"]);
      strengthLabel.classList.add(styles["very-strong"]);
      strengthText = 'Very Strong';
      strengthLevel = 'very-strong';
    }
    
    strengthLabel.textContent = strengthText;
    if (strengthScore) {
      strengthScore.textContent = password ? `${score}/5` : '';
    }
    
    setPasswordStrength(strengthLevel);
  }
  
  return strengthLevel;
};
// Helper function to update requirement items
const updateRequirement = (elementId, isValid) => {
  const element = document.getElementById(elementId);
  if (element) {
    if (isValid) {
      element.classList.remove(styles.invalid);
      element.classList.add(styles.valid);
      // Change icon to check mark
      const icon = element.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-circle');
        icon.classList.add('fa-check-circle');
      }
    } else {
      element.classList.remove(styles.valid);
      element.classList.add(styles.invalid);
      // Change icon back to circle
      const icon = element.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-check-circle');
        icon.classList.add('fa-circle');
      }
    }
  }
};
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admintoken");
    localStorage.removeItem("nickName");
    localStorage.removeItem("userConfig");
    localStorage.removeItem("userFormData");
    navigate("/login");
  };

  // Go back to main page function
  const goToMainPage = () => {
    navigate("/");  // Assuming "/" is your main page route
  };

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = allCategories.find(cat => cat.id === categoryId);
    return category ? category.name : `Category ${categoryId}`;
  };

  // Enhanced Image Selector Component with Upload Option
  const ImageSelector = () => {
    return (
      <div className={styles["image-selector-overlay"]}>
        <div className={styles["image-selector-modal"]}>
          <div className={styles["image-selector-header"]}>
            <h3><i className="fas fa-images"></i> Choose an Image</h3>
            <button className={styles["close-btn"]} onClick={closeImageSelector}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className={styles["image-selector-tabs"]}>
            <button 
              className={styles["image-selector-tab"] + (activeTab === 'gallery' ? ' ' + styles["active"] : '')}
              onClick={() => setActiveTab('gallery')}
            >
              <i className="fas fa-images"></i> Gallery
            </button>
            <button 
              className={styles["image-selector-tab"] + (activeTab === 'upload' ? ' ' + styles["active"] : '')}
              onClick={() => setActiveTab('upload')}
            >
              <i className="fas fa-upload"></i> Upload
            </button>
          </div>
          
          {activeTab === 'gallery' ? (
            <div className={styles["image-selector-grid"]}>
              {availableImages.map((image) => (
                <div 
                  key={image.id} 
                  className={styles["image-item"]}
                  onClick={() => handleImageSelect(image.path)}
                >
                  <img 
                    src={image.path} 
                    alt={image.name} 
                    onError={(e) => {
                      console.error(`Failed to load image: ${image.path}`);
                      e.target.src = "https://via.placeholder.com/150?text=Image+Error";
                      e.target.style.opacity = "0.5";
                    }}
                  />
                  <div className={styles["image-item-info"]}>{image.name}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles["image-upload-section"]}>
              <div className={styles["image-upload-container"]}>
                <div 
                  className={styles["image-upload-area"]} 
                  onClick={() => fileInputRef.current.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add(styles["drag-over"]);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove(styles["drag-over"]);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove(styles["drag-over"]);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      const file = e.dataTransfer.files[0];
                      if (file.type.startsWith('image/')) {
                        if (file.size <= 5 * 1024 * 1024) {
                          const reader = new FileReader();
                          reader.onload = (e) => handleImageSelect(e.target.result);
                          reader.readAsDataURL(file);
                        } else {
                          showAlert('Image size should be less than 5MB', 'error');
                        }
                      } else {
                        showAlert('Please select an image file', 'error');
                      }
                    }
                  }}
                >
                  <i className="fas fa-cloud-upload-alt"></i>
                  <p>Click to select or drag and drop your image here</p>
                  <span>Maximum file size: 5MB</span>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className={styles["file-input"]} 
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <button 
                  className={styles["btn"] + ' ' + styles["btn-primary"] + ' ' + styles["upload-btn"]}
                  onClick={() => fileInputRef.current.click()}
                >
                  <i className="fas fa-folder-open"></i>
                  Browse Files
                </button>
              </div>
            </div>
          )}
          
          <div className={styles["image-selector-footer"]}>
            <div className={styles["image-selector-footer-info"]}>
              {activeTab === 'gallery' ? 
                'Select an image from the gallery' : 
                'Upload an image from your device'
              }
            </div>
            {activeTab === 'upload' && (
              <div className={styles["image-selector-actions"]}>
                <button 
                  className={styles["btn"] + ' ' + styles["btn-secondary"]}
                  onClick={() => setActiveTab('gallery')}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Update the renderBlockList function
  const renderBlockList = () => {
    console.log("Rendering block list with users:", blockedUsers); // Debug log
    console.log("Blocked user IDs:", blockedUserIds); // Debug log

    return (
      <div className={styles["block-list"]}>
        {blockedUsers.length === 0 ? (
          <div className={styles["no-blocked-users"]}>
            <i className="fas fa-user-check"></i>
            <p>No blocked users</p>
          </div>
        ) : (
          blockedUsers.map(user => {
            console.log("Rendering blocked user:", user); // Debug log
            return (
              <div className={styles["block-list-item"]} key={user.userId}>
                <div className={styles["block-info"]}>
                  <div className={styles["form-group"]}>
                    <label>
                      <i className="fas fa-id-card"></i>
                      User ID
                    </label>
                    <input
                      type="text"
                      value={user.userId}
                      disabled
                      className={styles["readonly-input"]}
                    />
                  </div>
                  <div className={styles["form-group"]}>
                    <label>
                      <i className="fas fa-calendar"></i>
                      Blocked on
                    </label>
                    <input
                      type="text"
                      value={user.blockDate ? new Date(user.blockDate).toLocaleDateString() : "Not specified"}
                      disabled
                      className={styles["readonly-input"]}
                    />
                  </div>
                  <div className={styles["form-group"]}>
                    <label>
                      <i className="fas fa-comment"></i>
                      Block Reason
                    </label>
                    <input
                      type="text"
                      value={user.reason || "No reason provided"}
                      disabled
                      className={styles["readonly-input"]}
                    />
                  </div>
                </div>
                <div className={styles["block-actions"]}>
                  <button
                    className={styles["unblock-btn"]}
                    onClick={() => handleUnblockUser(user.userId)}
                  >
                    <i className="fas fa-unlock"></i>
                    Unblock
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  // Update the profile modal JSX
  const renderProfileModal = () => (
    <div className={styles["modal"] + ' ' + styles["active"]}>
      <div className={styles["modal-content"]}>
        <div className={styles["modal-header"]}>
          <h2 className={styles["modal-title"]}>
            <i className="fas fa-user-edit"></i>
            Edit Profile
          </h2>
          <button onClick={closeProfileModal} className={styles["modal-close"]}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleProfileSubmit} className={styles["profile-form"]}>
          {/* Avatar Upload */}
          <div className={styles["avatar-upload"]}>
            <img 
              src={userData?.avatar || "https://via.placeholder.com/120?text=Avatar"} 
              alt="Avatar Preview" 
              className={styles["avatar-preview"]} 
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/120?text=Avatar";
              }}
            />
            <label 
              className={styles["avatar-label"]}
              onClick={(e) => {
                e.preventDefault();
                openImageSelector();
              }}
            >
              <i className="fas fa-camera"></i>
              Choose Image
            </label>
          </div>

          {/* Basic Information */}
          <div className={styles["form-section"]}>
            <h3>
              <i className="fas fa-info-circle"></i>
              Basic Information
            </h3>
            <div className={styles["form-group"]}>
              <label>
                <i className="fas fa-id-card"></i>
                Student ID
              </label>
              <input
                type="text"
                value={profileForm.studentId}
                disabled
                className={styles["readonly-input"]}
              />
            </div>
            <div className={styles["form-group"]}>
              <label>
                <i className="fas fa-user"></i>
                Current Full Name
              </label>
              <input
                type="text"
                value={profileForm.currentFullName}
                disabled
                className={styles["readonly-input"]}
              />
            </div>
            <div className={styles["form-group"]}>
              <label>
                <i className="fas fa-user"></i>
                New Full Name (Optional)
              </label>
              <input
                type="text"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Enter new full name if you want to change it"
              />
            </div>
            <div className={styles["form-group"]}>
              <label>
                <i className="fas fa-building"></i>
                Current Department
              </label>
              <input
                type="text"
                value={profileForm.currentDepartment}
                disabled
                className={styles["readonly-input"]}
              />
            </div>
            <div className={styles["form-group"]}>
              <label>
                <i className="fas fa-building"></i>
                New Department (Optional)
              </label>
              <input
                type="text"
                value={profileForm.department}
                onChange={(e) => setProfileForm(prev => ({ ...prev, department: e.target.value }))}
                placeholder="Enter new department if you want to change it"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className={styles["form-section"]}>
            <h3>
              <i className="fas fa-address-card"></i>
              Contact Information
            </h3>
            <div className={styles["form-group"]}>
              <label>
                <i className="fas fa-envelope"></i>
                Current Email
              </label>
              <input
                type="email"
                value={profileForm.currentEmail}
                disabled
                className={styles["readonly-input"]}
              />
            </div>
            <div className={styles["form-group"]}>
              <label>
                <i className="fas fa-envelope"></i>
                New Email (Optional)
              </label>
              <input
                type="email"
                value={profileForm.newEmail}
                onChange={(e) => setProfileForm(prev => ({ ...prev, newEmail: e.target.value }))}
                placeholder="Enter new email if you want to change it"
              />
            </div>
            <div className={styles["form-group"]}>
              <label>
                <i className="fas fa-phone"></i>
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter 8 digits for phone number"
              />
            </div>
          </div>

          <div className={styles["modal-footer"]}>
            <button type="button" className={styles["btn"] + ' ' + styles["btn-secondary"]} onClick={closeProfileModal}>
              <i className="fas fa-times"></i>
              Cancel
            </button>
            <button type="submit" className={styles["btn"] + ' ' + styles["btn-primary"]}>
              <i className="fas fa-save"></i>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="AM">
      <div className={styles["app-container"] + (isDarkTheme ? ' ' + styles["dark-theme"] : '')}>
        {/* Sidebar */}
        <aside className={styles["sidebar"]}>
          <div className={styles["sidebar-header"]}>
            <i className="fas fa-user-cog"></i>
            <h1>Account Management</h1>
          </div>

          <div className={styles["user-profile"]}>
            <div className={styles["user-avatar-container"]}>
              <img 
                src={userData.avatar} 
                alt="User Avatar" 
                id="user-avatar" 
                className={styles["user-avatar"]} 
                onError={(e) => {
                  console.error("Failed to load avatar");
                  e.target.src = "https://via.placeholder.com/96?text=Avatar";
                }}
              />
              <button className={styles["change-avatar-btn"]} onClick={openImageSelector}>
                <i className="fas fa-camera"></i>
              </button>
            </div>
            <div className={styles["user-info"]}>
              <span className={styles["user-name"]} id="display-name">{userData.fullName}</span>
              <span className={styles["user-email"]} id="display-email">{userData.email}</span>
              <span className={styles["user-role"]}>{userData.department}</span>
              <div className={styles["badge"] + ' ' + styles["badge-success"]}>
                <i className="fas fa-circle"></i>
                Active
              </div>
            </div>
          </div>

          <nav className={styles["nav-menu"]}>
            <div className={styles["nav-section"]}>
              <span className={styles["nav-section-title"]}>Account</span>
              <ul>
                <li className={styles["nav-item"]}>
                  <a 
                    href="#account-info" 
                    className={styles["nav-link"] + (activeSection === "account-info" ? ' ' + styles["active"] : '')}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveSection("account-info");
                    }}
                  >
                    <i className="fas fa-user"></i>
                    Account Information
                  </a>
                </li>
                <li className={styles["nav-item"]}>
                  <a 
                    href="#tracking-list" 
                    className={styles["nav-link"] + (activeSection === "tracking-list" ? ' ' + styles["active"] : '')}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveSection("tracking-list");
                    }}
                  >
                    <i className="fas fa-list"></i>
                    Followed Categories
                  </a>
                </li>
                <li className={styles["nav-item"]}>
                  <a 
                    href="#block-list" 
                    className={styles["nav-link"] + (activeSection === "block-list" ? ' ' + styles["active"] : '')}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveSection("block-list");
                      fetchBlockedUsers();
                    }}
                  >
                    <i className="fas fa-ban"></i>
                    Block List
                  </a>
                </li>
                <li className={styles["nav-item"]}>
                  <a 
                    href="#security-settings" 
                    className={styles["nav-link"] + (activeSection === "security-settings" ? ' ' + styles["active"] : '')}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveSection("security-settings");
                    }}
                  >
                    <i className="fas fa-shield-alt"></i>
                    Security Settings
                  </a>
                </li>
              </ul>
            </div>

            <div className={styles["nav-section"]}>
              <span className={styles["nav-section-title"]}>Theme</span>
              <ul>
                <li className={styles["nav-item"]}>
                  <button className={styles["nav-link"]} onClick={toggleTheme}>
                    <i className={`fas ${isDarkTheme ? 'fa-sun' : 'fa-moon'}`}></i>
                    {isDarkTheme ? 'Light Theme' : 'Dark Theme'}
                  </button>
                </li>
              </ul>
            </div>

            <div className={styles["nav-section"]}>
              <span className={styles["nav-section-title"]}>Session</span>
              <ul>
                <li className={styles["nav-item"]}>
                  <a 
                    href="#logout" 
                    className={styles["nav-link"]} 
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                    }}
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                  </a>
                </li>
              </ul>
            </div>
          </nav>

          <button className={styles["nav-link"] + ' ' + styles["back-to-main"]} onClick={goToMainPage}>
            <i className="fas fa-arrow-left"></i>
            Back to Main Page
          </button>
        </aside>

        {/* Main Content */}
        <main className={styles["main-content"]}>
          <header className={styles["header"]}>
            <div className={styles["header-content"]}>
              <h1 className={styles["header-title"]}>
                Welcome back, <span id="welcome-name">{userData.fullName}</span>!
              </h1>
              <p className={styles["header-subtitle"]}>
                <i className="fas fa-clock"></i>
                Last login: {userData.lastLogin || getCurrentFormattedTime()}
              </p>
            </div>
          </header>

          {/* Account Information Section */}
          {activeSection === "account-info" && (
            <section id="account-info" className={styles["card"]}>
              <div className={styles["card-header"]}>
                <h2 className={styles["card-title"]}>
                  <i className="fas fa-user"></i>
                  Account Information
                </h2>
                <button className={styles["btn"] + ' ' + styles["btn-primary"]} onClick={openProfileModal}>
                  <i className="fas fa-edit"></i>
                  Edit Profile
                </button>
              </div>
              <div className={styles["card-body"]}>
                <div className={styles["info-grid"]}>
                  {/* Basic Information */}
                  <div className={styles["info-section"]}>
                    <h3>
                      <i className="fas fa-info-circle"></i>
                      Basic Information
                    </h3>
                    <div className={styles["info-group"]}>
                      <label>
                        <i className="fas fa-id-card"></i>
                        Student ID
                      </label>
                      <span>{userData.studentId}</span>
                    </div>
                    <div className={styles["info-group"]}>
                      <label>
                        <i className="fas fa-user"></i>
                        Full Name
                      </label>
                      <span>{userData.fullName}</span>
                    </div>
                    <div className={styles["info-group"]}>
                      <label>
                        <i className="fas fa-building"></i>
                        Department
                      </label>
                      <span>{userData.department || "No department"}</span>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className={styles["info-section"]}>
                    <h3>
                      <i className="fas fa-address-card"></i>
                      Contact Information
                    </h3>
                    <div className={styles["info-group"]}>
                      <label>
                        <i className="fas fa-envelope"></i>
                        Email
                      </label>
                      <span>{userData.email}</span>
                    </div>
                    <div className={styles["info-group"]}>
                      <label>
                        <i className="fas fa-phone"></i>
                        Phone
                      </label>
                      <span>{userData.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Followed Categories Section */}
          {activeSection === "tracking-list" && (
            <section id="tracking-list" className={styles["card"]}>
              <div className={styles["card-header"]}>
                <h2 className={styles["card-title"]}>
                  <i className="fas fa-list"></i>
                  Followed Categories
                </h2>
                <button 
                  className={styles["btn"] + ' ' + styles["btn-secondary"]} 
                  onClick={() => navigate("/category")}
                >
                  <i className="fas fa-plus"></i>
                  Follow More Categories
                </button>
              </div>
              <div className={styles["card-body"]}>
                <div className={styles["tracking-list"]}>
                  {followedCategories.length === 0 ? (
                    <div className={styles["empty-state"]}>
                      <i className="fas fa-list"></i>
                      <p>You're not following any categories</p>
                      <button 
                        className={styles["btn"] + ' ' + styles["btn-primary"]} 
                        onClick={() => navigate("/category")}
                      >
                        Browse Categories
                      </button>
                    </div>
                  ) : (
                    followedCategories.map(categoryId => {
                      const categoryName = getCategoryName(categoryId);
                      const category = allCategories.find(cat => cat.id === categoryId);
                      
                      return (
                        <div className={styles["tracking-item"]} key={categoryId}>
                          <div className={styles["tracking-info"]}>
                            <h4>{categoryName}</h4>
                            <p>{category ? category.description : "No description available"}</p>
                          </div>
                          <button 
                            className={styles["btn"] + ' ' + styles["btn-danger"]}
                            onClick={() => handleUnfollowCategory(categoryId)}
                          >
                            <i className="fas fa-times"></i>
                            Unfollow
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Security Settings Section */}
          {activeSection === "security-settings" && (
            <section id="security-settings" className={styles["card"]}>
              <div className={styles["card-header"]}>
                <h2 className={styles["card-title"]}>
                  <i className="fas fa-shield-alt"></i>
                  Security Settings
                </h2>
              </div>
              <div className={styles["card-body"]}>
                <div className={styles["info-grid"]}>
                  <div className={styles["info-section"]}>
                    <h3>
                      <i className="fas fa-key"></i>
                      Password Management
                    </h3>
                    <div className={styles["settings-group"]}>
                      <div className={styles["setting-item"]}>
                        <div className={styles["setting-info"]}>
                          <label>Change Password</label>
                          <p>Last changed: 30 days ago</p>
                        </div>
                        <button className={styles["btn"] + ' ' + styles["btn-secondary"]} onClick={openPasswordModal}>
                          <i className="fas fa-key"></i>
                          Change
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className={styles["info-section"]}>
                    <h3>
                      <i className="fas fa-history"></i>
                      Login History
                    </h3>
                    <div className={styles["settings-group"]}>
                      <div className={styles["setting-item"]}>
                        <div className={styles["setting-info"]}>
                          <label>{userData.lastLogin || "Today at 9:25 AM"}</label>
                          <p>Hong Kong, HK (Chrome on Windows)</p>
                        </div>
                        <span className={styles["badge"] + ' ' + styles["badge-success"]}>Current</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Block List Section */}
          {activeSection === "block-list" && (
            <section id="block-list" className={styles["card"]}>
              <div className={styles["card-header"]}>
                <h2 className={styles["card-title"]}>
                  <i className="fas fa-ban"></i>
                  Block List
                </h2>
                <div className={styles["header-actions"]}>
                  <div className={styles["search-container"]}>
                    <input 
                      type="text" 
                      className={styles["search-input"]} 
                      placeholder="Search blocked users..."
                      value={blockSearchQuery}
                      onChange={(e) => setBlockSearchQuery(e.target.value)}
                    />
                    <button className={styles["search-button"]} onClick={() => fetchBlockedUsers()}>
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                  <button 
                    className={styles["btn"] + ' ' + styles["btn-secondary"]} 
                    onClick={openBlockModal}
                  >
                    <i className="fas fa-user-slash"></i>
                    Block User
                  </button>
                </div>
              </div>
              <div className={styles["card-body"]}>
                {blockedUsers.length === 0 ? (
                  <div className={styles["empty-state"]}>
                    <i className="fas fa-ban"></i>
                    <p>You haven't blocked any users</p>
                    <p className={styles["empty-state-details"]}>
                      Blocked users won't be able to see your posts or send you messages
                    </p>
                  </div>
                ) : (
                  renderBlockList()
                )}
              </div>
            </section>
          )}
        </main>

        {/* Profile Edit Modal */}
        {showProfileModal && renderProfileModal()}

        {/* Block User Modal */}
        {showBlockModal && (
          <div className={styles["modal"] + ' ' + styles["active"]}>
            <div className={styles["modal-content"]}>
              <div className={styles["modal-header"]}>
                <h3 className={styles["modal-title"]}>
                  <i className="fas fa-user-slash"></i>
                  Block User
                </h3>
                <button className={styles["modal-close"]} onClick={closeBlockModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form onSubmit={handleBlockUser} className={styles["profile-form"]}>
                <div className={styles["form-section"]}>
                  <h3>
                    <i className="fas fa-info-circle"></i>
                    User Details
                  </h3>
                  <div className={styles["form-group"]}>
                    <label htmlFor="block-user-id">
                      <i className="fas fa-id-card"></i>
                      User ID
                    </label>
                    <input 
                      type="text" 
                      id="block-user-id" 
                      value={blockUserId}
                      onChange={(e) => setBlockUserId(e.target.value)}
                      placeholder="Enter user ID"
                      required 
                    />
                  </div>
                  <div className={styles["form-group"]}>
                    <label htmlFor="block-reason">
                      <i className="fas fa-comment-alt"></i>
                      Reason (Optional)
                    </label>
                    <textarea 
                      id="block-reason" 
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      placeholder="Why are you blocking this user?"
                      rows={3}
                    ></textarea>
                  </div>
                </div>

                <div className={styles["form-section"]}>
                  <h3>
                    <i className="fas fa-exclamation-circle"></i>
                    Blocking Information
                  </h3>
                  <div className={styles["bg-gray-50"]}>
                    <p className={styles["mb-2"]}>When you block someone:</p>
                    <ul className={styles["space-y-1"]}>
                      <li>You won't see their posts</li>
                      <li>You can unblock them at any time</li>
                    </ul>
                  </div>
                </div>

                <div className={styles["modal-footer"]}>
                  <button type="button" className={styles["btn"] + ' ' + styles["btn-secondary"]} onClick={closeBlockModal}>
                    Cancel
                  </button>
                  <button type="submit" className={styles["btn"] + ' ' + styles["btn-danger"]}>
                    <i className="fas fa-ban"></i>
                    Block User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

{/* Password Change Modal */}
{showPasswordModal && (
  <div className={styles["modal"] + ' ' + styles["active"]}>
    <div className={styles["modal-content"]}>
      <div className={styles["modal-header"]}>
        <h3 className={styles["modal-title"]}>
          <i className="fas fa-lock"></i>
          Change Password
        </h3>
        <button className={styles["modal-close"]} onClick={closePasswordModal}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <form id="password-form" className={styles["password-form"]} onSubmit={handlePasswordSubmit}>
        <div className={styles["form-group"]}>
          <label>
            <i className="fas fa-key"></i>
            Current Password
          </label>
          <div className={styles["password-input-wrapper"]}>
            <input 
              type="password" 
              id="current-password" 
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required 
            />
            <button 
              type="button" 
              className={styles["password-toggle"]}
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling;
                const icon = e.currentTarget.querySelector('i');
                
                if (input.type === 'password') {
                  input.type = 'text';
                  icon.classList.remove('fa-eye');
                  icon.classList.add('fa-eye-slash');
                } else {
                  input.type = 'password';
                  icon.classList.remove('fa-eye-slash');
                  icon.classList.add('fa-eye');
                }
              }}
            >
              <i className="fas fa-eye"></i>
            </button>
          </div>
        </div>

        <div className={styles["form-group"]}>
          <label>
            <i className="fas fa-lock"></i>
            New Password
          </label>
          <div className={styles["password-input-wrapper"]}>
            <input 
              type="password" 
              id="new-password" 
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required 
            />
            <button 
              type="button" 
              className={styles["password-toggle"]}
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling;
                const icon = e.currentTarget.querySelector('i');
                
                if (input.type === 'password') {
                  input.type = 'text';
                  icon.classList.remove('fa-eye');
                  icon.classList.add('fa-eye-slash');
                } else {
                  input.type = 'password';
                  icon.classList.remove('fa-eye-slash');
                  icon.classList.add('fa-eye');
                }
              }}
            >
              <i className="fas fa-eye"></i>
            </button>
          </div>
          
          {/* Password Strength Meter */}
          <div className={styles["strength-meter"]}>
            <div className={styles["strength-meter-fill"]} id="strength-meter-fill"></div>
          </div>
          
          {/* Strength indicator text */}
          <div className={styles["strength-text"]}>
            <div className={styles["strength-label"]} id="strength-label">Password strength</div>
            <div className={styles["strength-score"]} id="strength-score"></div>
          </div>
          
          {/* Password requirements */}
          <div className={styles["password-requirements"]}>
            <h4>Your password must include:</h4>
            <ul className={styles["requirements-list"]}>
              <li className={styles["requirement-item"]} id="length-check">
                <i className="fas fa-circle"></i> At least 8 characters
              </li>
              <li className={styles["requirement-item"]} id="uppercase-check">
                <i className="fas fa-circle"></i> At least one uppercase letter (A-Z)
              </li>
              <li className={styles["requirement-item"]} id="lowercase-check">
                <i className="fas fa-circle"></i> At least one lowercase letter (a-z)
              </li>
              <li className={styles["requirement-item"]} id="number-check">
                <i className="fas fa-circle"></i> At least one number (0-9)
              </li>
              <li className={styles["requirement-item"]} id="special-check">
                <i className="fas fa-circle"></i> At least one special character (!@#$%^&*...)
              </li>
            </ul>
          </div>
        </div>

        <div className={styles["form-group"]}>
          <label>
            <i className="fas fa-lock"></i>
            Confirm Password
          </label>
          <div className={styles["password-input-wrapper"]}>
            <input 
              type="password" 
              id="confirm-password" 
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required 
            />
            <button 
              type="button" 
              className={styles["password-toggle"]}
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling;
                const icon = e.currentTarget.querySelector('i');
                
                if (input.type === 'password') {
                  input.type = 'text';
                  icon.classList.remove('fa-eye');
                  icon.classList.add('fa-eye-slash');
                } else {
                  input.type = 'password';
                  icon.classList.remove('fa-eye-slash');
                  icon.classList.add('fa-eye');
                }
              }}
            >
              <i className="fas fa-eye"></i>
            </button>
          </div>
        </div>

        <div className={styles["modal-footer"]}>
          <button type="button" className={styles["btn"] + ' ' + styles["btn-secondary"]} onClick={closePasswordModal}>
            Cancel
          </button>
          <button type="submit" className={styles["btn"] + ' ' + styles["btn-primary"]}>
            <i className="fas fa-check"></i>
            Change Password
          </button>
        </div>
      </form>
    </div>
  </div>
)}

        {/* Image Selector Popup */}
        {showImageSelector && <ImageSelector />}
      </div>
    </div>
  );
};

export default AccountManagement;