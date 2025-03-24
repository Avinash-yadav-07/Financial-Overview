import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Checkbox,
  FormControlLabel,
  Box,
  Chip,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { db } from "../manage-employee/firebase";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// Expense categories (Removed "Account" from the list)
const categories = [
  "Rent",
  "Software Licenses",
  "Utilities",
  "Salaries",
  "Marketing",
  "Other",
  "Project",
];

const ManageExpenses = () => {
  // Dialog and data states
  const [open, setOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmUpdateOpen, setConfirmUpdateOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [dateFilterType, setDateFilterType] = useState("all");
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [softwareName, setSoftwareName] = useState("");
  const [employeeIds, setEmployeeIds] = useState([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);

  // New states for Project IDs, Account IDs, and Employee IDs
  const [projectIds, setProjectIds] = useState([]);
  const [accountIds, setAccountIds] = useState([]);

  // Fetch expenses, project IDs, account IDs, and employee IDs from Firestore
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

    const fetchProjectIds = async () => {
      const querySnapshot = await getDocs(collection(db, "projects"));
      const projectIdsData = querySnapshot.docs.map((doc) => doc.data().projectId);
      setProjectIds(projectIdsData);
    };

    const fetchAccountIds = async () => {
      const querySnapshot = await getDocs(collection(db, "accounts"));
      const accountIdsData = querySnapshot.docs.map((doc) => doc.data().accountId);
      setAccountIds(accountIdsData);
    };

    const fetchEmployeeIds = async () => {
      const querySnapshot = await getDocs(collection(db, "employees"));
      const employeeIdsData = querySnapshot.docs.map((doc) => doc.data().employeeId);
      setEmployeeIds(employeeIdsData);
    };

    fetchExpenses();
    fetchProjectIds();
    fetchAccountIds();
    fetchEmployeeIds();
  }, []);

  // Filter expenses based on search term and date filter
  useEffect(() => {
    let filtered = [...expenses];

    // Apply category search filter
    if (searchTerm) {
      filtered = filtered.filter((expense) =>
        expense.category.some((cat) => cat.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply date filter
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
        weekStart.setDate(now.getDate() - now.getDay()); // Start of the week (Sunday)
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
        // No date filtering applied
        break;
    }

    setFilteredExpenses(filtered);
  }, [expenses, searchTerm, dateFilterType, customStartDate, customEndDate]);

  // Open Add/Edit dialog and reset form
  const handleClickOpen = () => {
    setOpen(true);
    resetForm();
  };

  // Close dialog and reset form
  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  // Populate form fields for editing an expense
  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setCategory(expense.category[0] || ""); // Assuming single category, adjust if multi-select
    setAmount(expense.amount);
    setDate(
      expense.date && typeof expense.date.toDate === "function"
        ? expense.date.toDate().toISOString().split("T")[0]
        : expense.date || ""
    );
    setDescription(expense.description);
    setProjectId(expense.projectId || "");
    setAccountId(expense.accountId || "");
    setRecurring(expense.recurring || false);
    setSoftwareName(expense.softwareName || "");
    setSelectedEmployeeIds(expense.employeeIds || []);
    setOpen(true);
  };

  // Handle submission of the form
  const handleSubmit = async () => {
    setConfirmUpdateOpen(true);
  };

  // Generate a 4-digit random number for Expense ID
  const generateExpenseId = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  // Confirm update or add expense in Firestore
  const confirmUpdate = async () => {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      alert("Please enter a valid date.");
      return;
    }

    const newExpense = {
      expenseId: editingExpense ? editingExpense.expenseId : generateExpenseId(),
      category: category, // Single category
      amount: Number(amount),
      date: parsedDate,
      description,
      projectId: projectId || null,
      accountId: accountId || null,
      recurring,
      softwareName: category === "Software Licenses" ? softwareName : null,
      employeeIds: category === "Salaries" ? selectedEmployeeIds : null,
    };

    if (editingExpense) {
      await updateDoc(doc(db, "expenses", editingExpense.id), newExpense);
      setExpenses(
        expenses.map((exp) => (exp.id === editingExpense.id ? { ...exp, ...newExpense } : exp))
      );
    } else {
      const docRef = await addDoc(collection(db, "expenses"), newExpense);
      setExpenses([...expenses, { id: docRef.id, ...newExpense }]);
    }

    setConfirmUpdateOpen(false);
    handleClose();
  };

  // Handle deletion of an expense
  const handleDelete = async () => {
    await deleteDoc(doc(db, "expenses", deleteId));
    setExpenses(expenses.filter((exp) => exp.id !== deleteId));
    setConfirmDeleteOpen(false);
  };

  // Reset all form fields
  const resetForm = () => {
    setCategory("");
    setAmount("");
    setDate("");
    setDescription("");
    setProjectId("");
    setAccountId("");
    setRecurring(false);
    setSoftwareName("");
    setSelectedEmployeeIds([]);
    setEditingExpense(null);
  };

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
                  <Button variant="gradient" color="info" onClick={handleClickOpen} sx={{ mb: 2 }}>
                    Add expenses
                  </Button>
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

                {/* Date Filter Section */}
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

              {/* Expense Cards Grid */}
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
                      <CardActions sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <MDButton
                          variant="text"
                          onClick={() => handleEdit(expense)}
                          sx={{
                            background:
                              "linear-gradient(100% 100% at 100% 0, #5adaff 0, #5468ff 100%)",
                            color: "#000",
                            fontWeight: "bold",
                            borderRadius: "8px",
                            padding: "12px 24px",
                          }}
                        >
                          <Icon fontSize="medium">edit</Icon> Edit
                        </MDButton>
                        <MDButton
                          variant="text"
                          color="error"
                          onClick={() => {
                            setDeleteId(expense.id);
                            setConfirmDeleteOpen(true);
                          }}
                          sx={{ ml: 1, padding: "12px 24px" }}
                        >
                          <Icon fontSize="medium">delete</Icon> Delete
                        </MDButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Card>
          </Grid>
        </Grid>

        {/* Expense Form Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>{editingExpense ? "Edit Expense" : "Add Expense"}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="category-select-label">Category</InputLabel>
                  <Select
                    labelId="category-select-label"
                    id="category-select"
                    value={category}
                    label="Category"
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map((cat, index) => (
                      <MenuItem key={index} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="account-select-label">Account</InputLabel>
                  <Select
                    labelId="account-select-label"
                    id="account-select"
                    value={accountId}
                    label="Account"
                    onChange={(e) => setAccountId(e.target.value)}
                    required
                  >
                    {accountIds.map((acc, index) => (
                      <MenuItem key={index} value={acc}>
                        {acc}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  type="number"
                  label="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  type="date"
                  label="Date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Grid>

              {/* Conditionally render the Project dropdown if "Project" is selected */}
              {category === "Project" && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="project-select-label">Project</InputLabel>
                    <Select
                      labelId="project-select-label"
                      id="project-select"
                      value={projectId}
                      label="Project"
                      onChange={(e) => setProjectId(e.target.value)}
                    >
                      {projectIds.map((proj, index) => (
                        <MenuItem key={index} value={proj}>
                          {proj}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {/* Conditionally render the Employee dropdown if "Salaries" is selected */}
              {category === "Salaries" && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="employee-select-label">Employee</InputLabel>
                    <Select
                      labelId="employee-select-label"
                      id="employee-select"
                      multiple
                      value={selectedEmployeeIds}
                      label="Employee"
                      onChange={(e) => setSelectedEmployeeIds(e.target.value)}
                    >
                      {employeeIds.map((emp, index) => (
                        <MenuItem key={index} value={emp}>
                          {emp}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {/* Conditionally render the Software Name field if "Software Licenses" is selected */}
              {category === "Software Licenses" && (
                <Grid item xs={12}>
                  <TextField
                    label="Software Name"
                    value={softwareName}
                    onChange={(e) => setSoftwareName(e.target.value)}
                    required
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={recurring}
                      onChange={(e) => setRecurring(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Recurring Expense"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirm Delete Dialog */}
        <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
          <DialogTitle>Want to delete expense data?</DialogTitle>
          <DialogActions>
            <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirm Update Dialog */}
        <Dialog open={confirmUpdateOpen} onClose={() => setConfirmUpdateOpen(false)}>
          <DialogTitle>Want to save details?</DialogTitle>
          <DialogActions>
            <Button onClick={() => setConfirmUpdateOpen(false)}>Cancel</Button>
            <Button onClick={confirmUpdate} color="primary">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </MDBox>
    </LocalizationProvider>
  );
};

export default ManageExpenses;
