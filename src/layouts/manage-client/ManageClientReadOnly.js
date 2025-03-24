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
import { collection, getDocs } from "firebase/firestore";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

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
                Client Management
              </MDTypography>
            </MDBox>
            <Grid container spacing={3} sx={{ padding: "16px" }}>
              {clients.map((client) => (
                <Grid item xs={12} md={12} key={client.id}>
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
                        {client.name}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>ID:</strong> {client.clientId}
                          </MDTypography>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>Email:</strong> {client.email}
                          </MDTypography>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>Phone:</strong> {client.phone}
                          </MDTypography>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>Industry:</strong> {client.industry}
                          </MDTypography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>Contract:</strong> {client.contractId}
                          </MDTypography>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>Start:</strong> {formatTimestamp(client.contractStartDate)}
                          </MDTypography>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>End:</strong>{" "}
                            {client.contractEndDate
                              ? formatTimestamp(client.contractEndDate)
                              : "Ongoing"}
                          </MDTypography>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>Contract Amount:</strong> ${client.contractAmount || "N/A"}
                          </MDTypography>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>Status:</strong>{" "}
                            <Chip
                              label={client.status}
                              sx={{
                                backgroundColor: client.status === "Active" ? "#4CAF50" : "#F44336",
                                color: "#fff",
                                fontSize: "12px",
                                padding: "4px 8px",
                                borderRadius: "6px",
                              }}
                            />
                          </MDTypography>
                        </Grid>
                      </Grid>
                      <Grid container spacing={2} mt={1}>
                        <Grid item xs={12} md={4}>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>CAC:</strong> ${client.Metrics?.cac || "N/A"}
                          </MDTypography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>CLTV:</strong> ${client.Metrics?.cltv || "N/A"}
                          </MDTypography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <MDTypography variant="body2" color="textSecondary">
                            <strong>Revenue:</strong> ${client.Metrics?.revenueGenerated || "N/A"}
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
  );
};

export default ManageClientReadOnly;
