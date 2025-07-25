import { useState, useEffect } from "react";
import axios from "axios";

const useCheckAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/getAdmin`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setIsAdmin(response.data.valid);
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  return { isAdmin, loading };
};

export default useCheckAdmin;
