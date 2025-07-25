import { useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { createTheme } from '@mui/material';

const useThemeMode = () => {
  const { themeMode } = useTheme();

  useEffect(() => {
    document.body.className = themeMode;
  }, [themeMode]);

  const theme = createTheme({
    palette: {
      mode: themeMode === "dark" ? "dark" : "light",
      primary: {
        main: '#0f7377',
      },
      secondary: {
        main: '#f07f0f',
      },
      customColors: {
        lightblue: '#ADD8E6',      
      },
    },
  });

  return theme;
};

export default useThemeMode;
