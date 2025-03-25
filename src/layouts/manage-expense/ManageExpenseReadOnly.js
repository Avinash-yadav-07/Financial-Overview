import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
} from "@mui/material";
import { db } from "../manage-employee/firebase";
import { collection, getDocs } from "firebase/firestore";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { FormControl, InputLabel, Select, MenuItem, Button } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { useMaterialUIController } from "context";

const categories = [
  "Rent",
  "Software Licenses",
  "Utilities",
  "Salaries",
  "Marketing",
  "Other",
  "Project",
];

const ManageExpensesReadOnly = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilterType, setDateFilterType] = useState("all");
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const [controller] = useMaterialUIController();
  const { miniSidenav, darkMode } = controller;

  useEffect(() => {
    const fetchExpenses = async () => {
      const querySnapshot = await getDocs(collection(db, "expenses"));
      const expensesData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const category = Array.isArray(data.category)
          ? data.category
          : [data.category].filter((c) => c);
        return { id: doc.id, ...data, category };
      });
      setExpenses(expensesData);
      setFilteredExpenses(expensesData);
    };

    fetchExpenses();
  }, []);

  useEffect(() => {
    let filtered = [...expenses];

    if (searchTerm) {
      filtered = filtered.filter((expense) =>
        expense.category.some((cat) => cat.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    const now = new Date();
    switch (dateFilterType) {
      case "today":
        filtered = filtered.filter((expense) => {
          const expenseDate = expense.date.toDate ? expense.date.toDate() : new Date(expense.date);
          return (
            expenseDate.getDate() === now.getDate() &&
            expenseDate.getMonth() === now.getMonth() &&
            expenseDate.getFullYear() === now.getFullYear()
          );
        });
        break;
      case "week":
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        filtered = filtered.filter((expense) => {
          const expenseDate = expense.date.toDate ? expense.date.toDate() : new Date(expense.date);
          return expenseDate >= weekStart && expenseDate <= now;
        });
        break;
      case "month":
        filtered = filtered.filter((expense) => {
          const expenseDate = expense.date.toDate ? expense.date.toDate() : new Date(expense.date);
          return (
            expenseDate.getMonth() === now.getMonth() &&
            expenseDate.getFullYear() === now.getFullYear()
          );
        });
        break;
      case "3months":
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        filtered = filtered.filter((expense) => {
          const expenseDate = expense.date.toDate ? expense.date.toDate() : new Date(expense.date);
          return expenseDate >= threeMonthsAgo && expenseDate <= now;
        });
        break;
      case "year":
        filtered = filtered.filter((expense) => {
          const expenseDate = expense.date.toDate ? expense.date.toDate() : new Date(expense.date);
          return expenseDate.getFullYear() === now.getFullYear();
        });
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          filtered = filtered.filter((expense) => {
            const expenseDate = expense.date.toDate
              ? expense.date.toDate()
              : new Date(expense.date);
            return expenseDate >= customStartDate && expenseDate <= customEndDate;
          });
        }
        break;
      case "all":
      default:
        break;
    }

    setFilteredExpenses(filtered);
  }, [expenses, searchTerm, dateFilterType, customStartDate, customEndDate]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ backgroundColor: darkMode ? "background.default" : "background.paper", minHeight: "100vh" }}>
        <DashboardNavbar
          absolute
          light={!darkMode}
          isMini={false}
          sx={{
            backgroundColor: darkMode ? "rgba(33, 33, 33, 0.9)" : "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
            zIndex: 1100,
            padding: "0 16px",
            minHeight: "60px",
            top: "8px",
            left: { xs: "0", md: miniSidenav ? "80px" : "260px" },
            width: { xs: "100%", md: miniSidenav ? "calc(100% - 80px)" : "calc(100% - 260px)" },
          }}
        />
        <MDBox
          p={3}
          sx={{
            marginLeft: { xs: "0", md: miniSidenav ? "80px" : "260px" },
            marginTop: { xs: "140px", md: "100px" },
            backgroundColor: darkMode ? "background.default" : "background.paper",
            minHeight: "calc(100vh - 80px)",
            paddingTop: { xs: "32px", md: "24px" },
            zIndex: 1000,
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <MDBox
                  mx={2}
                  mt={-3}
                  py={3}
                  px={2}
                  variant="gradient"
                  bgColor={darkMode ? "dark" : "info"}
                  borderRadius="lg"
                  coloredShadow={darkMode ? "dark" : "info"}
                >
                  <MDTypography variant="h6" color={darkMode ? "white" : "white"}>
                    Expense Management
                  </MDTypography>
                </MDBox>
                <MDBox
                  pt={3}
                  pb={2}
                  px={2}
                  display="flex"
                  alignItems="center"
                  gap={2}
                  justifyContent="space-between"
                  flexDirection={{ xs: "column", md: "row" }}
                >
                  <Box display="flex" gap={2} flexDirection={{ xs: "column", sm: "row" }}>
                    <TextField
                      label="Search by Category"
                      variant="outlined"
                      size="small"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      sx={{
                        maxWidth: { xs: "100%", sm: 300 },
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          backgroundColor: darkMode ? "#424242" : "#fff",
                          color: darkMode ? "white" : "black",
                        },
                        "& .MuiInputLabel-root": { color: darkMode ? "white" : "black" },
                      }}
                    />
                  </Box>

                  <Box display="flex" gap={2} alignItems="center" flexDirection={{ xs: "column", sm: "row" }}>
                    <FormControl
                      variant="outlined"
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          fontSize: "1rem",
                          padding: "12px 35px",
                          backgroundColor: darkMode ? "#424242" : "#fff",
                          color: darkMode ? "white" : "black",
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: "0.9rem",
                          color: darkMode ? "white" : "black",
                        },
                      }}
                    >
                      <InputLabel>Date Filter</InputLabel>
                      <Select
                        value={dateFilterType}
                        onChange={(e) => setDateFilterType(e.target.value)}
                        label="Date Filter"
                      >
                        <MenuItem value="all">All Dates</MenuItem>
                        <MenuItem value="today">Today</MenuItem>
                        <MenuItem value="week">This Week</MenuItem>
                        <MenuItem value="month">This Month</MenuItem>
                        <MenuItem value="3months">Last 3 Months</MenuItem>
                        <MenuItem value="year">This Year</MenuItem>
                        <MenuItem value="custom">Custom Range</MenuItem>
                      </Select>
                    </FormControl>

                    {dateFilterType === "custom" && (
                      <Button
                        variant="outlined"
                        onClick={() => setDatePickerOpen(true)}
                        sx={{ height: 40, color: darkMode ? "white" : "inherit", borderColor: darkMode ? "white" : "inherit" }}
                      >
                        Choose Dates
                      </Button>
                    )}
                  </Box>
                </MDBox>

                <Dialog open={datePickerOpen} onClose={() => setDatePickerOpen(false)} sx={{ "& .MuiDialog-paper": { backgroundColor: darkMode ? "background.default" : "background.paper" } }}>
                  <DialogTitle sx={{ color: darkMode ? "white" : "black" }}>Select Date Range</DialogTitle>
                  <DialogContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                    <DatePicker
                      label="Start Date"
                      value={customStartDate}
                      onChange={(newValue) => setCustomStartDate(newValue)}
                      renderInput={(params) => <TextField {...params} sx={{ input: { color: darkMode ? "white" : "black" }, "& .MuiInputLabel-root": { color: darkMode ? "white" : "black" } }} />}
                    />
                    <DatePicker
                      label="End Date"
                      value={customEndDate}
                      onChange={(newValue) => setCustomEndDate(newValue)}
                      renderInput={(params) => <TextField {...params} sx={{ input: { color: darkMode ? "white" : "black" }, "& .MuiInputLabel-root": { color: darkMode ? "white" : "black" } }} />}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setDatePickerOpen(false)}>Cancel</Button>
                    <Button onClick={() => setDatePickerOpen(false)} color="primary">
                      Apply
                    </Button>
                  </DialogActions>
                </Dialog>

                <Grid container spacing={3} sx={{ padding: "16px" }}>
                  {filteredExpenses.map((expense) => (
                    <Grid item xs={12} md={12} key={expense.id}>
                      <Card
                        sx={{
                          background: darkMode
                            ? "linear-gradient(135deg, #424242 0%, #212121 100%)"
                            : "linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)",
                          borderRadius: "12px",
                          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                          padding: "20px",
                          transition: "0.3s ease-in-out",
                          "&:hover": {
                            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
                            transform: "scale(1.02)",
                          },
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                            {Array.isArray(expense.category) &&
                              expense.category.map((cat, index) => (
                                <Chip key={index} label={cat} color="primary" />
                              ))}
                          </Box>

                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <MDTypography variant="body2" color={darkMode ? "white" : "textSecondary"}>
                                <strong>Expense ID:</strong> {expense.expenseId}
                              </MDTypography>
                              <MDTypography variant="body2" color={darkMode ? "white" : "textSecondary"}>
                                <strong>Amount:</strong> ${expense.amount}
                              </MDTypography>
                              <MDTypography variant="body2" color={darkMode ? "white" : "textSecondary"}>
                                <strong>Date:</strong>{" "}
                                {expense.date?.toDate
                                  ? expense.date.toDate().toLocaleDateString()
                                  : new Date(expense.date).toLocaleDateString()}
                              </MDTypography>
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <MDTypography variant="body2" color={darkMode ? "white" : "textSecondary"}>
                                <strong>Description:</strong> {expense.description}
                              </MDTypography>
                              <MDTypography variant="body2" color={darkMode ? "white" : "textSecondary"}>
                                <strong>Project ID:</strong> {expense.projectId || "N/A"}
                              </MDTypography>
                              <MDTypography variant="body2" color={darkMode ? "white" : "textSecondary"}>
                                <strong>Account ID:</strong> {expense.accountId || "N/A"}
                              </MDTypography>
                              <MDTypography variant="body2" color={darkMode ? "white" : "textSecondary"}>
                                <strong>Recurring:</strong>{" "}
                                <Chip label={expense.recurring ? "Yes" : "No"} size="small" />
                              </MDTypography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
        <Box
          sx={{
            marginLeft: { xs: "0", md: miniSidenav ? "80px" : "260px" },
            backgroundColor: darkMode ? "background.default" : "background.paper",
            zIndex: 1100,
          }}
        >
          <Footer />
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default ManageExpensesReadOnly;