import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
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

const statuses = ["Active", "Closed"];
const industries = ["Technology", "Finance", "Healthcare", "Retail", "Manufacturing"];

const ManageAccountReadOnly = () => {
  const [accounts, setAccounts] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [accountExpenses, setAccountExpenses] = useState({});
  const [projectExpenses, setProjectExpenses] = useState({});

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
                Account Management
              </MDTypography>
            </MDBox>
            <Grid container spacing={3} sx={{ padding: "16px" }}>
              {accounts.map((account) => {
                const displayedRevenue = account.revenue || 0;

                return (
                  <Grid item xs={12} md={12} key={account.id}>
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
                        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#333", mb: 2 }}>
                          {account.name}
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <MDTypography variant="body2" color="textSecondary">
                              <strong>ID:</strong> {account.accountId}
                            </MDTypography>
                            <MDTypography variant="body2" color="textSecondary">
                              <strong>Industry:</strong> {account.industry}
                            </MDTypography>
                            <MDTypography variant="body2" color="textSecondary">
                              <strong>Revenue:</strong> ${displayedRevenue}
                            </MDTypography>
                            <MDTypography variant="body2" color="textSecondary">
                              <strong>Expenses:</strong> ${accountExpenses[account.accountId] || 0}
                            </MDTypography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <MDTypography variant="body2" color="textSecondary">
                              <strong>Profit Margin:</strong> {account.profitMargin || 0}%
                            </MDTypography>
                            <MDTypography variant="body2" color="textSecondary">
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
                            <MDTypography variant="body2" color="textSecondary">
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
                            <MDTypography variant="body2" color="textSecondary">
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
  );
};

export default ManageAccountReadOnly;
