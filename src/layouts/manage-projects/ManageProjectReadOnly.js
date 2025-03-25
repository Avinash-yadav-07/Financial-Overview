import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Grid,
  Chip,
  Typography,
  Card,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDProgress from "components/MDProgress";
import DataTable from "examples/Tables/DataTable";
import { db } from "../manage-employee/firebase";
import { collection, getDocs, getDoc, doc, query, where, onSnapshot } from "firebase/firestore";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { useMaterialUIController } from "context";

const statuses = ["Ongoing", "Completed", "On Hold"];

const Progress = ({ value, status }) => {
  const getColor = () => {
    switch (status) {
      case "Completed":
        return "success";
      case "On Hold":
        return "warning";
      default:
        return "info";
    }
  };

  return (
    <MDBox display="flex" alignItems="center">
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {value}%
      </MDTypography>
      <MDBox ml={0.5} width="9rem">
        <MDProgress variant="gradient" color={getColor()} value={value} />
      </MDBox>
    </MDBox>
  );
};

Progress.propTypes = {
  value: PropTypes.number.isRequired,
  status: PropTypes.string.isRequired,
};

const ProjectInfo = ({ name, projectId }) => (
  <MDBox display="flex" alignItems="center" lineHeight={1}>
    <MDBox ml={0} lineHeight={1.2}>
      <MDTypography variant="button" fontWeight="medium" display="block">
        {name}
      </MDTypography>
      <MDTypography variant="caption" color="textSecondary" display="block">
        ID: {projectId}
      </MDTypography>
    </MDBox>
  </MDBox>
);

ProjectInfo.propTypes = {
  name: PropTypes.string.isRequired,
  projectId: PropTypes.string.isRequired,
};

const ManageProjectReadOnly = () => {
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [projectExpenses, setProjectExpenses] = useState(0);
  const [projectRevenue, setProjectRevenue] = useState(0);

  const [controller] = useMaterialUIController();
  const { miniSidenav, darkMode } = controller;

  useEffect(() => {
    const fetchProjects = async () => {
      const querySnapshot = await getDocs(collection(db, "projects"));
      setProjects(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    const fetchEmployees = async () => {
      const querySnapshot = await getDocs(collection(db, "employees"));
      setEmployees(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    const fetchClients = async () => {
      const querySnapshot = await getDocs(collection(db, "clients"));
      setClients(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    const fetchAccounts = async () => {
      const querySnapshot = await getDocs(collection(db, "accounts"));
      setAccounts(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchProjects();
    fetchEmployees();
    fetchClients();
    fetchAccounts();
  }, []);

  useEffect(() => {
    const fetchProjectExpenses = async () => {
      if (selectedProject && (selectedProject.projectId || selectedProject.id)) {
        const pid = selectedProject.projectId || selectedProject.id;
        const q = query(collection(db, "expenses"), where("projectId", "==", pid));
        const querySnapshot = await getDocs(q);
        let total = 0;
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          total += Number(data.amount) || 0;
        });
        setProjectExpenses(total);
      } else {
        setProjectExpenses(0);
      }
    };
    fetchProjectExpenses();
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProject && (selectedProject.projectId || selectedProject.id)) {
      const pid = selectedProject.projectId || selectedProject.id;
      const earningsQuery = query(
        collection(db, "earnings"),
        where("category", "==", "Project Revenue"),
        where("referenceId", "==", pid)
      );
      const unsubscribe = onSnapshot(earningsQuery, (snapshot) => {
        let totalRevenue = 0;
        snapshot.forEach((doc) => {
          const data = doc.data();
          totalRevenue += Number(data.amount) || 0;
        });
        setProjectRevenue(totalRevenue);
      });
      return () => unsubscribe();
    } else {
      setProjectRevenue(0);
    }
  }, [selectedProject]);

  const handleViewDetails = async (project) => {
    const projectRef = doc(db, "projects", project.id);
    const projectSnap = await getDoc(projectRef);
    if (projectSnap.exists()) {
      setSelectedProject({ id: projectSnap.id, ...projectSnap.data() });
    } else {
      setSelectedProject(project);
    }
    setViewDetailsOpen(true);
  };

  const tableData = {
    columns: [
      { Header: "project", accessor: "project", width: "30%", align: "left" },
      { Header: "budget", accessor: "budget", align: "left" },
      { Header: "status", accessor: "status", align: "center" },
      { Header: "completion", accessor: "completion", align: "center" },
      { Header: "action", accessor: "action", align: "center" },
    ],
    rows: projects.map((project) => ({
      project: <ProjectInfo name={project.name} projectId={project.projectId} />,
      budget: (
        <MDTypography variant="button" color="text" fontWeight="medium">
          ${project.financialMetrics?.budget || 0}
        </MDTypography>
      ),
      status: (
        <Chip
          label={project.status}
          color={
            project.status === "Completed"
              ? "success"
              : project.status === "On Hold"
              ? "warning"
              : "info"
          }
          size="small"
        />
      ),
      completion: <Progress value={project.completion || 0} status={project.status} />,
      action: (
        <MDBox display="flex" justifyContent="center">
          <Button
            variant="gradient"
            color={darkMode ? "dark" : "info"}
            onClick={() => handleViewDetails(project)}
            sx={{ mb: 2 }}
          >
            View Project
          </Button>
        </MDBox>
      ),
    })),
  };

  return (
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
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color={darkMode ? "white" : "black"}>
                  Projects
                </MDTypography>
              </MDBox>
              <MDBox pt={3} pb={2} px={2}>
                <DataTable
                  table={tableData}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>
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

      <Dialog
        open={viewDetailsOpen}
        onClose={() => setViewDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{ "& .MuiDialog-paper": { backgroundColor: darkMode ? "background.default" : "background.paper" } }}
      >
        <DialogTitle sx={{ color: darkMode ? "white" : "black" }}>Project Details</DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>Project ID</Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>{selectedProject.projectId || selectedProject.id || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>Name</Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>{selectedProject.name || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>Account ID</Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>{selectedProject.accountId?.accountId || selectedProject.accountId || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>Client ID</Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>{selectedProject.clientId?.clientId || selectedProject.clientId || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>Team</Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>
                  {Array.isArray(selectedProject.team)
                    ? selectedProject.team.join(", ")
                    : typeof selectedProject.team === "object"
                    ? JSON.stringify(selectedProject.team)
                    : selectedProject.team || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>Budget</Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>${selectedProject.financialMetrics?.budget || 0}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>Expenses</Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>${projectExpenses}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>ROI (%)</Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>{selectedProject.financialMetrics?.roi || 0}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>Burn Rate</Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>{selectedProject.financialMetrics?.burnRate || 0}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>Profit Margin (%)</Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>{selectedProject.financialMetrics?.profitMargin || 0}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>Revenue Generated</Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>${selectedProject.financialMetrics?.revenueGenerated || projectRevenue}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>Expected Revenue</Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>{selectedProject.financialMetrics?.expectedRevenue || 0}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>Start Date</Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>
                  {selectedProject.startDate
                    ? new Date(selectedProject.startDate).toLocaleDateString()
                    : "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>End Date</Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>
                  {selectedProject.endDate
                    ? new Date(selectedProject.endDate).toLocaleDateString()
                    : "Ongoing"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>Status</Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>{selectedProject.status || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>Completion (%)</Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>
                  {selectedProject.completion !== undefined
                    ? `${selectedProject.completion}%`
                    : "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ color: darkMode ? "white" : "black" }}>Description</Typography>
                <Typography sx={{ color: darkMode ? "white" : "textSecondary" }}>{selectedProject.description || "No description available"}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageProjectReadOnly;