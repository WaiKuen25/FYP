import { useState, useEffect } from 'react';
import axios from 'axios';

const useCheckUser = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setIsLoggedIn(false);
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/getUser`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setIsLoggedIn(response.data.valid);
      } catch (error) {
        setIsLoggedIn(false);
      }
    };

    checkUser();
  }, []);

  return isLoggedIn;
};

export default useCheckUser;
