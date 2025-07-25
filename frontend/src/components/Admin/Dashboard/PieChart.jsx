import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { PieChart } from "@mui/x-charts";

const PieChartComponent = ({ title, data }) => {
  const [boxWidth, setBoxWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      const box = document.querySelector(".box-container");
      if (box) {
        const styles = window.getComputedStyle(box);
        const paddingLeft = parseFloat(styles.paddingLeft) || 0;
        const paddingRight = parseFloat(styles.paddingRight) || 0;
        const borderLeft = parseFloat(styles.borderLeftWidth) || 0;
        const borderRight = parseFloat(styles.borderRightWidth) || 0;
        const totalWidth =
          box.clientWidth -
          paddingLeft -
          paddingRight -
          borderLeft -
          borderRight;
        setBoxWidth(totalWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Box
      className="box-container"
      sx={{
        bgcolor: "white",
        border: "1px solid",
        borderColor: "grey.300",
        borderRadius: 2,
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        p: 2, // Added padding for better spacing
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontWeight: 500, // Fixed typo: fontWeigth -> fontWeight
          color: "text.primary",
          textAlign: "center",
        }}
      >
        {title}
      </Typography>
      <PieChart
        slotProps={{
          legend: { hidden: true },
        }}
        series={[
          {
            data: data.map((item) => ({
              id: item.id,
              value: item.value,
              label: item.label,
              color: item.color,
            })),
            cx: boxWidth * 0.58, // Center based on width (half of 90%)
            cy: boxWidth * 0.55, // Center based on height (half of 90%)
          },
        ]}
        width={boxWidth * 1.2}
        height={boxWidth * 1.2}
      />
      <Box
        sx={{
          mt: 2,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {data.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  bgcolor: item.color,
                  mr: 1,
                  borderRadius: 1,
                }}
              />
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {item.label} - {percentage}%
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default PieChartComponent;
