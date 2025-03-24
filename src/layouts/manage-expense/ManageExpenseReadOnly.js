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
      <MDBox
        p={3}
        sx={{
          marginLeft: "250px",
          marginTop: "30px",
          width: "calc(100% - 250px)",
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card
              sx={{
                marginTop: "20px",
                borderRadius: "12px",
                overflow: "visible",
              }}
            >
              <MDBox
                mx={0}
                mt={-4.5}
                py={3}
                px={3}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
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
              >
                <Box display="flex" gap={2}>
                  <TextField
                    label="Search by Category"
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{
                      maxWidth: 300,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "#fff",
                      },
                    }}
                  />
                </Box>

                <Box display="flex" gap={2} alignItems="center">
                  <FormControl
                    variant="outlined"
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        fontSize: "1rem",
                        padding: "12px 35px",
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: "0.9rem",
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
                      sx={{ height: 40 }}
                    >
                      Choose Dates
                    </Button>
                  )}
                </Box>
              </MDBox>

              <Dialog open={datePickerOpen} onClose={() => setDatePickerOpen(false)}>
                <DialogTitle>Select Date Range</DialogTitle>
                <DialogContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                  <DatePicker
                    label="Start Date"
                    value={customStartDate}
                    onChange={(newValue) => setCustomStartDate(newValue)}
                    renderInput={(params) => <TextField {...params} />}
                  />
                  <DatePicker
                    label="End Date"
                    value={customEndDate}
                    onChange={(newValue) => setCustomEndDate(newValue)}
                    renderInput={(params) => <TextField {...params} />}
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
                        background: "linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)",
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
                            <MDTypography variant="body2" color="textSecondary">
                              <strong>Expense ID:</strong> {expense.expenseId}
                            </MDTypography>
                            <MDTypography variant="body2" color="textSecondary">
                              <strong>Amount:</strong> ${expense.amount}
                            </MDTypography>
                            <MDTypography variant="body2" color="textSecondary">
                              <strong>Date:</strong>{" "}
                              {expense.date?.toDate
                                ? expense.date.toDate().toLocaleDateString()
                                : new Date(expense.date).toLocaleDateString()}
                            </MDTypography>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <MDTypography variant="body2" color="textSecondary">
                              <strong>Description:</strong> {expense.description}
                            </MDTypography>
                            <MDTypography variant="body2" color="textSecondary">
                              <strong>Project ID:</strong> {expense.projectId || "N/A"}
                            </MDTypography>
                            <MDTypography variant="body2" color="textSecondary">
                              <strong>Account ID:</strong> {expense.accountId || "N/A"}
                            </MDTypography>
                            <MDTypography variant="body2" color="textSecondary">
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
    </LocalizationProvider>
  );
};

export default ManageExpensesReadOnly;
