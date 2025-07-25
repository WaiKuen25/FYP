import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const colorPairs = [
  ["#000000", "#FFFFFF"],
  ["#FF5733", "#C70039"],
  ["#33FF57", "#28B463"],
  ["#337BFF", "#0056B3"],
  ["#FF33A1", "#D5006D"],
  ["#FFD333", "#FFC107"],
  ["#46FFF4", "#009688"],
  ["#FF8C00", "#E67E22"],
];

const getRandomColorPair = () => {
  const randomIndex = Math.floor(Math.random() * colorPairs.length);
  return colorPairs[randomIndex];
};

const DashboardCard = ({ title, value, percentage, image }) => {
  const [colorPair, setColorPair] = useState([null, null]);

  useEffect(() => {
    setColorPair(getRandomColorPair());
  }, []);

  const percentageStyle = percentage.startsWith("+")
    ? { color: "green" }
    : { color: "red" };

  return (
    <Box className="dashboard-card number-below flex flex-col bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:transform hover:translate-y-1 hover:shadow-2xl">
      <Box
        className="card-header p-5 text-white relative flex flex-col items-start"
        style={{
          background: `linear-gradient(to right, ${colorPair[0]}, ${colorPair[1]})`,
        }}
      >
        <Typography variant="h10" className="card-title font-semibold mb-1">
          {title}
        </Typography>
        {image}
      </Box>
      <Box className="card-body p-5 border-t border-gray-200 text-left">
        <Typography variant="h6" className="card-value font-bold">
          {value}
        </Typography>
        <Box
          className="card-percentage flex items-center mt-2"
          style={percentageStyle}
        >
          <i
            className={`fas fa-arrow-${
              percentage.startsWith("+") ? "up" : "down"
            } percentage-icon mr-2 text-lg`}
          ></i>
          <Typography variant="body1">{percentage}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardCard;
