import { Typography, TextField, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const columns = [
  { field: "id", headerName: "ID", width: 90 },
  { field: "email", headerName: "Email", width: 200 },
  { field: "nickName", headerName: "User Name", width: 130 },
  { field: "role", headerName: "Role", width: 130 },
  { field: "department", headerName: "Department", width: 130 },
  { field: "createPost", headerName: "Count Post", width: 130 },
  {
    field: "disable",
    headerName: "Disable",
    width: 130,
    type: "boolean",
    renderCell: (params) => (params.value === 1 ? "Yes" : "No"),
  },
];

const ManageUser = () => {
  const [rows, setRows] = useState([]); // Original data from API
  const [filteredRows, setFilteredRows] = useState([]); // Filtered data for DataGrid
  const [searchQuery, setSearchQuery] = useState(""); // State for search input
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const navigate = useNavigate();

  // Fetch query parameter from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("search");
    if (query) {
      setSearchQuery(query); // Set the value from the URL in the TextField
    }
  }, []);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/admin/getUserDataGrid`,
          {
            headers: {
              AdminAuthorization: `Bearer ${localStorage.getItem("admintoken")}`,
            },
          }
        );

        const data = response.data.map((item) => ({
          id: item.id,
          email: item.email,
          nickName: item.nickName,
          role: item.role || "N/A",
          department: item.department || "N/A",
          createPost: item.createPost,
          disable: item.disable,
        }));

        setRows(data); // Set original data
        setFilteredRows(data); // Initially, filtered data is the same as original
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Filter rows whenever searchQuery changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRows(rows); // If search is empty, show all rows
    } else {
      const filtered = rows.filter((row) => {
        const nickNameMatch = row.nickName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const idMatch = row.id.toString().includes(searchQuery);
        return nickNameMatch || idMatch;
      });
      setFilteredRows(filtered);
    }
  }, [searchQuery, rows]); // Depend on searchQuery and rows

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value); // Update searchQuery state
  };

  const handleClick = (params) => {
    console.log(params.id);
  };

  const handleGenerateReport = async () => {
    if (selectedUserIds.length > 0) {
      try {
        // Get admin token
        const adminToken = localStorage.getItem("admintoken");
        if (!adminToken) {
          alert("Admin token not found. Please log in again.");
          return;
        }
        
        console.log("Using token:", adminToken);
        
        // Get user report data
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/generate/${selectedUserIds[0]}`,
          {
            headers: {
              AdminAuthorization: `Bearer ${adminToken}`,
            },
          }
        );
        
        // Store report data in local storage for use in report page
        localStorage.setItem("userReport", JSON.stringify(response.data));
        
        // Navigate to report page
        navigate(`/admin/users/generate/${selectedUserIds[0]}`);
      } catch (error) {
        console.error("Error getting user report:", error);
        let errorMessage = "Unable to get user report data. Please try again later.";
        
        if (error.response) {
          console.error("Error response:", error.response.data);
          if (error.response.status === 401) {
            errorMessage = "Insufficient permissions or unauthorized. Please ensure you are logged in as an admin.";
          } else if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        }
        
        alert(errorMessage);
      }
    } else {
      alert("Please select a user first");
    }
  };

  const handlePunishUser = () => {
    if (selectedUserIds.length > 0) {
      navigate(`/admin/users/punish/${selectedUserIds[0]}`);
    } else {
      alert("Please select a user first");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black p-6">
      <Typography
        variant="h5"
        sx={{ fontWeight: "bold", mb: 3, color: "#1a1a1a" }}
      >
        Manage User
      </Typography>

      <TextField
        label="Search"
        variant="outlined"
        value={searchQuery}
        onChange={handleSearchChange}
        sx={{ mb: 3, width: "300px" }}
      />

      <div>
        <DataGrid
          rows={filteredRows} // Use filtered rows instead of original rows
          columns={columns}
          onRowClick={handleClick}
          disableSelectionOnClick
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={(newSelection) => {
            setSelectedUserIds(newSelection);
          }}
        />
      </div>

      <div className="mt-2 flex gap-5">
        <Button variant="contained" onClick={handleGenerateReport}>Generate Report</Button>
        <Button variant="contained" color="error" onClick={handlePunishUser}>Punishment</Button>
      </div>
    </div>
  );
};

export default ManageUser;