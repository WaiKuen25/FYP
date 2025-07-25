import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const Notification = ({ type = 'success', message }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [key, setKey] = useState(Date.now());

  useEffect(() => {
    setIsVisible(true);
    setKey(Date.now());
    const timer = setTimeout(() => setIsVisible(false), 4500);
    return () => clearTimeout(timer);
  }, [message, type]);

  const styles = {
    error: { borderColor: 'red', icon: <ErrorOutlineIcon sx={{ color: 'red' }} /> },
    warning: { borderColor: 'orange', icon: <WarningAmberIcon sx={{ color: 'orange' }} /> },
    success: { borderColor: 'green', icon: <CheckCircleOutlineIcon sx={{ color: 'green' }} /> }
  };

  const { borderColor, icon } = styles[type] || styles.success;

  if (!isVisible) return null;

  return (
    <Box
      key={key}
      sx={{
        position: 'absolute',
        right: 5, // Small offset from right edge
        backgroundColor: 'white',
        borderRadius: '5px 0 0 5px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
        padding: '15px 20px 15px 15px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        borderRight: `5px solid ${borderColor}`,
        minWidth: '120px',
        maxWidth: '400px',
        maxHeight: '80px',
        animation: isVisible ? 'slideIn 0.3s forwards' : 'slideOut 0.3s forwards',
        '@keyframes slideIn': {
          from: { transform: 'translateX(50%)', opacity: 0 }, // Starts 50% inside right
          to: { transform: 'translateX(0)', opacity: 1 } // Slides left to full position
        },
        '@keyframes slideOut': {
          from: { transform: 'translateX(0)', opacity: 1 }, // Starts at full position
          to: { transform: 'translateX(50%)', opacity: 0 } // Slides back right 50%
        }
      }}
    >
      {icon}
      <Typography sx={{ fontSize: '16px', wordBreak: 'break-word' }}>
        {message || `${type.charAt(0).toUpperCase() + type.slice(1)}: Operation completed.`}
      </Typography>
    </Box>
  );
};

export default Notification;