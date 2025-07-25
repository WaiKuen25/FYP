import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { Grid2 } from "@mui/material";
import DashboardCard from "../../components/Admin/Dashboard/DashboardCard";
import { People, PostAdd, Report } from "@mui/icons-material";
import PieChartComponent from "../../components/Admin/Dashboard/PieChart";
import { LineChart } from "@mui/x-charts";
import { DataGrid } from "@mui/x-data-grid";
import MultiDateCalendar from "../../components/Admin/Dashboard/MultiDateCalendar";
import UiBox from "../../components/Admin/Dashboard/uiBox";

const uData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100];
const pData = [200, 300, 400, 1000];
const xLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const chartData = [
  { id: 0, value: 40, label: "Global", color: "orange" },
  { id: 1, value: 15, label: "Information Technology", color: "#1976d2" },
  { id: 2, value: 20, label: "Health and Life Sciences", color: "#4caf50" },
];

const datesToHighlight = [
  new Date(2025, 3, 21),
  new Date(2025, 5, 18),
  new Date(2025, 6, 10),
];

const postrows = [
  {
    id: 7,
    postId: 7,
    userId: 20000,
    categoryId: 2,
    title: "tile",
    postTime: "2025-02-06 09:57:51",
    pin: 1,
    disable: 0,
  },
  {
    id: 8,
    postId: 8,
    userId: 20001,
    categoryId: 1,
    title: "gdgdg",
    postTime: "2025-02-10 09:29:22",
    pin: null,
    disable: 0,
  },
  {
    id: 9,
    postId: 9,
    userId: 20000,
    categoryId: 8,
    title: "Testing Pros",
    postTime: "2025-02-23 08:26:33",
    pin: null,
    disable: 0,
  },
];

const postcolumns = [
  { field: "postId", headerName: "Post ID", width: 90 },
  { field: "userId", headerName: "User ID", width: 150 },
  { field: "categoryId", headerName: "Category ID", width: 150 },
  { field: "title", headerName: "Title", width: 200 },
  { field: "postTime", headerName: "Post Time", width: 200 },
  { field: "pin", headerName: "Pin", width: 100, type: "boolean" },
  { field: "disable", headerName: "Disable", width: 100, type: "boolean" },
];

const Dashboard = () => {
  return (
    <Box className="p-3 bg-white">
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: "text.primary",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}
        >
          Welcome back, User {localStorage.getItem("nickName")}
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 400,
            color: "text.secondary",
            mt: 1,
            lineHeight: 1.5,
            letterSpacing: "0.01em",
          }}
        >
          Let's get our things done
        </Typography>
      </Box>

      <Grid2 container spacing={2} sx={{ flexGrow: 1, maxWidth: "100vw" }}>
        {/* Grid Item 1: 9 units wide */}
        <Grid2 size={{ xs: 12, sm: 6, md: 9 }}>
          <UiBox>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 12, md: 3 }}>
                <DashboardCard
                  title="Members"
                  value="15000"
                  percentage="+12%"
                  image={
                    <People className="icon-container absolute top-2 right-2 text-3xl opacity-60 text-black" />
                  }
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 12, md: 3 }}>
                <DashboardCard
                  title="Online Members"
                  value="58"
                  percentage="-12%"
                  image={
                    <People className="icon-container absolute top-2 right-2 text-3xl opacity-60 text-black" />
                  }
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 12, md: 3 }}>
                <DashboardCard
                  title="Posts Per Day"
                  value="53"
                  percentage="+20%"
                  image={
                    <PostAdd className="icon-container absolute top-2 right-2 text-3xl opacity-60 text-black" />
                  }
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 12, md: 3 }}>
                <DashboardCard
                  title="Report Requests"
                  value="5"
                  percentage="-20%"
                  image={
                    <Report className="icon-container absolute top-2 right-2 text-3xl opacity-60 text-black" />
                  }
                />
              </Grid2>
            </Grid2>
          </UiBox>
          <Grid2 size={{ xs: 12 }}>
            <UiBox>
              <Typography
                variant="h4"
                sx={{ color: "text.secondary" }}
                className="text-center text-black"
              >
                Members Grow in Recent Years
              </Typography>
              <LineChart
                height={300}
                series={[
                  { data: pData, label: "2025" },
                  { data: uData, label: "2024" },
                ]}
                xAxis={[{ scaleType: "point", data: xLabels }]}
              />
            </UiBox>
          </Grid2>
        </Grid2>
        {/* PieChart */}
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <PieChartComponent title="Posts in Categories" data={chartData} />
        </Grid2>

        {/*Date Chart and Date List */}
        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
          <UiBox>
            <MultiDateCalendar dates={datesToHighlight} />
          </UiBox>
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 8 }}>
          <UiBox>
            <DataGrid
              rows={[
                {
                  id: 1,
                  task: "Final Report",
                  startDate: "2024-09-01",
                  endDate: "2025-04-21",
                  delay: false,
                  completed: false,
                },
                {
                  id: 2,
                  task: "Admin Dashboard",
                  startDate: "2025-02-18",
                  endDate: "2025-02-22",
                  delay: false,
                  completed: true,
                },
              ]}
              columns={[
                { field: "id", headerName: "ID", width: 40 },
                { field: "task", headerName: "Task", width: 150 },
                { field: "startDate", headerName: "Start Date", width: 110 },
                { field: "endDate", headerName: "End Date", width: 110 },
                {
                  field: "delay",
                  headerName: "Delay",
                  width: 90,
                  type: "boolean",
                },
                {
                  field: "completed",
                  headerName: "Completed",
                  width: 90,
                  type: "boolean",
                },
              ]}
              autoPageSize
              rowsPerPageOptions={[5]}
              disableSelectionOnClick
            />
          </UiBox>
        </Grid2>
        <Grid2 size={{ xs: 12, sm: 12, md: 12 }}>
          <UiBox>
            <DataGrid
              rows={postrows}
              columns={postcolumns}
              disableSelectionOnClick // This should work to disable row selection
            />
          </UiBox>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default Dashboard;
