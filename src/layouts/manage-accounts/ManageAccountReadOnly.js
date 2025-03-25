import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
} from "@mui/material";
import { db } from "../manage-employee/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { useMaterialUIController } from "context";

const statuses = ["Active", "Closed"];
const industries = ["Technology", "Finance", "Healthcare", "Retail", "Manufacturing"];

const ManageAccountReadOnly = () => {
  const [accounts, setAccounts] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [accountExpenses, setAccountExpenses] = useState({});
  const [projectExpenses, setProjectExpenses] = useState({});

  // Dark mode state
  const [controller] = useMaterialUIController();
  const { miniSidenav, darkMode } = controller;

  useEffect(() => {
    const fetchAccounts = async () => {
      const querySnapshot = await getDocs(collection(db, "accounts"));
      setAccounts(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchAccounts();

    const fetchProjects = async () => {
      const querySnapshot = await getDocs(collection(db, "projects"));
      setProjectList(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchProjects();

    const fetchClients = async () => {
      const querySnapshot = await getDocs(collection(db, "clients"));
      setClientList(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const fetchAllAccountExpenses = async () => {
      const expensesMap = {};
      const projectExpensesMap = {};

      for (const account of accounts) {
        if (account.accountId) {
          const q = query(collection(db, "expenses"), where("accountId", "==", account.accountId));
          const qs = await getDocs(q);
          let totalAccountExpenses = 0;
          qs.forEach((doc) => {
            const data = doc.data();
            totalAccountExpenses += Number(data.amount) || 0;
            if (data.projectId) {
              if (!projectExpensesMap[data.projectId]) {
                projectExpensesMap[data.projectId] = 0;
              }
              projectExpensesMap[data.projectId] += Number(data.amount) || 0;
            }
          });
          expensesMap[account.accountId] = totalAccountExpenses;
        }
      }

      setAccountExpenses(expensesMap);
      setProjectExpenses(projectExpensesMap);
    };

    if (accounts.length > 0) {
      fetchAllAccountExpenses();
    }
  }, [accounts]);

  return (
    <Box
      sx={{
        backgroundColor: darkMode ? "background.default" : "background.paper",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
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

      {/* Main Content */}
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
                <MDTypography variant="h6" color={darkMode ? "white" : "black"}>
                  Account Management
                </MDTypography>
              </MDBox>
              <Grid container spacing={3} sx={{ padding: "16px" }}>
                {accounts.map((account) => {
                  const displayedRevenue = account.revenue || 0;

                  return (
                    <Grid item xs={12} key={account.id}>
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
                          <Typography
                            variant="h4"
                            sx={{ fontWeight: "bold", color: darkMode ? "#fff" : "#333", mb: 2 }}
                          >
                            {account.name}
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <MDTypography
                                variant="body2"
                                color={darkMode ? "white" : "textSecondary"}
                              >
                                <strong>ID:</strong> {account.accountId}
                              </MDTypography>
                              <MDTypography
                                variant="body2"
                                color={darkMode ? "white" : "textSecondary"}
                              >
                                <strong>Industry:</strong> {account.industry}
                              </MDTypography>
                              <MDTypography
                                variant="body2"
                                color={darkMode ? "white" : "textSecondary"}
                              >
                                <strong>Revenue:</strong> ${displayedRevenue}
                              </MDTypography>
                              <MDTypography
                                variant="body2"
                                color={darkMode ? "white" : "textSecondary"}
                              >
                                <strong>Expenses:</strong> ${accountExpenses[account.accountId] || 0}
                              </MDTypography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <MDTypography
                                variant="body2"
                                color={darkMode ? "white" : "textSecondary"}
                              >
                                <strong>Profit Margin:</strong> {account.profitMargin || 0}%
                              </MDTypography>
                              <MDTypography
                                variant="body2"
                                color={darkMode ? "white" : "textSecondary"}
                              >
                                <strong>Projects:</strong>{" "}
                                {Array.isArray(account.projects) && account.projects.length > 0
                                  ? account.projects
                                      .map((projectId) => {
                                        const project = projectList.find((p) => p.id === projectId);
                                        const projectExpense = projectExpenses[projectId] || 0;
                                        return project
                                          ? `${project.name} ($${projectExpense})`
                                          : projectId;
                                      })
                                      .join(", ")
                                  : "No projects assigned"}
                              </MDTypography>
                              <MDTypography
                                variant="body2"
                                color={darkMode ? "white" : "textSecondary"}
                              >
                                <strong>Clients:</strong>{" "}
                                {Array.isArray(account.clients) && account.clients.length > 0
                                  ? account.clients
                                      .map((clientId) => {
                                        const client = clientList.find((c) => c.id === clientId);
                                        return client ? client.name : clientId;
                                      })
                                      .join(", ")
                                  : "No clients assigned"}
                              </MDTypography>
                              <MDTypography
                                variant="body2"
                                color={darkMode ? "white" : "textSecondary"}
                              >
                                <strong>Status:</strong>{" "}
                                <Chip
                                  label={account.status}
                                  sx={{
                                    backgroundColor:
                                      account.status === "Active" ? "#4CAF50" : "#F44336",
                                    color: "#fff",
                                    fontSize: "12px",
                                    padding: "4px 8px",
                                    borderRadius: "6px",
                                  }}
                                />
                              </MDTypography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Footer */}
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
  );
};

export default ManageAccountReadOnly;