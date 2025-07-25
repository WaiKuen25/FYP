import { useState } from "react";
import { Divider, Button, ButtonGroup } from "@mui/material";
import CreatePost from "../../../components/Admin/ManagePost/CreatePost";
import SelectPost from "../../../components/Admin/ManagePost/SelectPost";
import DisplayPost from "../../../components/Admin/ManagePost/DisplayPost";

const NonfictionPost = () => {
  const [state, setState] = useState(1);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-6">
      {/* Header Section */}
      <div className="w-full max-w-7xl mx-auto">
        <ButtonGroup
          variant="contained"
          className="w-full sm:w-auto shadow-md rounded-lg overflow-hidden"
        >
          <Button
            onClick={() => setState(1)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              padding: "10px 20px",
              bgcolor: state === 1 ? "#1976d2" : "#e0e0e0",
              color: state === 1 ? "white" : "black",
              "&:hover": { bgcolor: state === 1 ? "#115293" : "#d0d0d0" },
            }}
          >
            Select Post
          </Button>
          <Button
            onClick={() => setState(2)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              padding: "10px 20px",
              bgcolor: state === 2 ? "#1976d2" : "#e0e0e0",
              color: state === 2 ? "white" : "black",
              "&:hover": { bgcolor: state === 2 ? "#115293" : "#d0d0d0" },
            }}
          >
            Create Post
          </Button>
        </ButtonGroup>
        <Divider className="my-6 border-gray-300" />
      </div>

      {/* Content Section */}
      <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto gap-6">
        <div className="w-full lg:w-2/3 bg-white rounded-lg shadow-sm p-4">
          {state === 1 && <SelectPost />}
          {state === 2 && <CreatePost />}
        </div>
        <div className="w-full lg:w-1/3 bg-white rounded-lg shadow-sm p-4">
          <DisplayPost />
        </div>
      </div>
    </div>
  );
};

export default NonfictionPost;