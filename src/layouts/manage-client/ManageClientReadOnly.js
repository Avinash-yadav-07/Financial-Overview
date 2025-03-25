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
import { collection, getDocs } from "firebase/firestore";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { useMaterialUIController } from "context";

const statuses = ["Active", "Inactive"];
const industries = ["Technology", "Finance", "Healthcare", "Retail", "Manufacturing"];

const formatTimestamp = (timestamp) => {
  if (timestamp && typeof timestamp.toDate === "function") {
    return timestamp.toDate().toLocaleDateString();
  }
  return timestamp;
};

const ManageClientReadOnly = () => {
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);

  // Dark mode state
  const [controller] = useMaterialUIController();
  const { miniSidenav, darkMode } = controller;

  useEffect(() => {
    const fetchClients = async () => {
      const querySnapshot = await getDocs(collection(db, "clients"));
      setClients(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchClients();

    const fetchProjects = async () => {
      const querySnapshot = await getDocs(collection(db, "projects"));
      setProjects(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchProjects();
  }, []);

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
                  Client Management
                </MDTypography>
              </MDBox>
              <Grid container spacing={2} sx={{ padding: "12px" }}>
                {clients.map((client) => (
                  <Grid item xs={12} key={client.id}>
                    <Card
                      sx={{
                        background: darkMode
                          ? "linear-gradient(135deg, #424242 0%, #212121 100%)"
                          : "linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)",
                        borderRadius: "12px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        padding: "16px",
                        transition: "0.3s ease-in-out",
                        "&:hover": {
                          boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
                          transform: "scale(1.02)",
                        },
                      }}
                    >
                      <CardContent sx={{ padding: 0, "&:last-child": { paddingBottom: 0 } }}>
                        <MDBox display="flex" justifyContent="space-between" alignItems="center">
                          <MDBox>
                            <Typography
                              variant="h5"
                              sx={{
                                fontWeight: "bold",
                                color: darkMode ? "#fff" : "#333",
                                mb: 1.5,
                              }}
                            >
                              {client.name}
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={4}>
                                <MDTypography
                                  variant="body2"
                                  color={darkMode ? "white" : "textSecondary"}
                                >
                                  <strong>ID:</strong> {client.clientId}
                                </MDTypography>
                                <MDTypography
                                  variant="body2"
                                  color={darkMode ? "white" : "textSecondary"}
                                  display="block"
                                >
                                  <strong>Email:</strong> {client.email}
                                </MDTypography>
                                <MDTypography
                                  variant="body2"
                                  color={darkMode ? "white" : "textSecondary"}
                                  display="block"
                                >
                                  <strong>Phone:</strong> {client.phone}
                                </MDTypography>
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <MDTypography
                                  variant="body2"
                                  color={darkMode ? "white" : "textSecondary"}
                                >
                                  <strong>Contract:</strong> {client.contractId}
                                </MDTypography>
                                <MDTypography
                                  variant="body2"
                                  color={darkMode ? "white" : "textSecondary"}
                                  display="block"
                                >
                                  <strong>Start:</strong> {formatTimestamp(client.contractStartDate)}
                                </MDTypography>
                                <MDTypography
                                  variant="body2"
                                  color={darkMode ? "white" : "textSecondary"}
                                  display="block"
                                >
                                  <strong>End:</strong>{" "}
                                  {client.contractEndDate
                                    ? formatTimestamp(client.contractEndDate)
                                    : "Ongoing"}
                                </MDTypography>
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <MDTypography
                                  variant="body2"
                                  color={darkMode ? "white" : "textSecondary"}
                                >
                                  <strong>Amount:</strong> ${client.contractAmount || "N/A"}
                                </MDTypography>
                                <MDTypography
                                  variant="body2"
                                  color={darkMode ? "white" : "textSecondary"}
                                  display="block"
                                >
                                  <strong>Status:</strong>{" "}
                                  <Chip
                                    label={client.status}
                                    size="small"
                                    sx={{
                                      backgroundColor:
                                        client.status === "Active" ? "#4CAF50" : "#F44336",
                                      color: "#fff",
                                      fontSize: "12px",
                                      height: "24px",
                                    }}
                                  />
                                </MDTypography>
                                <MDTypography
                                  variant="body2"
                                  color={darkMode ? "white" : "textSecondary"}
                                  display="block"
                                >
                                  <strong>Industry:</strong> {client.industry}
                                </MDTypography>
                              </Grid>
                            </Grid>
                            <MDBox mt={1.5}>
                              <MDTypography
                                variant="body2"
                                color={darkMode ? "white" : "textSecondary"}
                              >
                                <strong>Metrics:</strong> CAC: ${client.Metrics?.cac || "N/A"} | CLTV: $
                                {client.Metrics?.cltv || "N/A"} | Revenue: $
                                {client.Metrics?.revenueGenerated || "N/A"}
                              </MDTypography>
                            </MDBox>
                          </MDBox>
                        </MDBox>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
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

export default ManageClientReadOnly;