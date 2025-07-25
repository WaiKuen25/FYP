import React from "react";
import { Box } from "@mui/material";

const UiBox = ({ children }) => {
  return (
    <Box
      sx={{
        bgcolor: "white",
        border: "1px solid",
        borderColor: "grey.300",
        p: 2,
        borderRadius: 2,
        mt: 2,
      }}
    >
      {children}
    </Box>
  );
};

export default UiBox;
