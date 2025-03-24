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
} from "@mui/material"; // Add Dialog imports
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDProgress from "components/MDProgress";
import DataTable from "examples/Tables/DataTable";
import { db } from "../manage-employee/firebase";
import { collection, getDocs, getDoc, doc, query, where, onSnapshot } from "firebase/firestore";

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
  // Note: 'a' is listed in propTypes but not used in the component. Removing it to avoid warnings.
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
            color="info"
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
              mx={2}
              mt={-3}
              py={3}
              px={2}
              variant="gradient"
              bgColor="info"
              borderRadius="lg"
              coloredShadow="info"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <MDTypography variant="h6" color="white">
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

      <Dialog
        open={viewDetailsOpen}
        onClose={() => setViewDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Project Details</DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Project ID</Typography>
                <Typography>{selectedProject.projectId || selectedProject.id || "N/A"}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Name</Typography>
                <Typography>{selectedProject.name || "N/A"}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Account ID</Typography>
                <Typography>
                  {selectedProject.accountId?.accountId || selectedProject.accountId || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Client ID</Typography>
                <Typography>
                  {selectedProject.clientId?.clientId || selectedProject.clientId || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Team</Typography>
                <Typography>
                  {Array.isArray(selectedProject.team)
                    ? selectedProject.team.join(", ")
                    : typeof selectedProject.team === "object"
                    ? JSON.stringify(selectedProject.team)
                    : selectedProject.team || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Budget</Typography>
                <Typography>${selectedProject.financialMetrics?.budget || 0}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Expenses</Typography>
                <Typography>${projectExpenses}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">ROI (%)</Typography>
                <Typography>{selectedProject.financialMetrics?.roi || 0}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Burn Rate</Typography>
                <Typography>{selectedProject.financialMetrics?.burnRate || 0}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Profit Margin (%)</Typography>
                <Typography>{selectedProject.financialMetrics?.profitMargin || 0}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Revenue Generated</Typography>
                <Typography>
                  ${selectedProject.financialMetrics?.revenueGenerated || projectRevenue}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Expected Revenue</Typography>
                <Typography>{selectedProject.financialMetrics?.expectedRevenue || 0}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Start Date</Typography>
                <Typography>
                  {selectedProject.startDate
                    ? new Date(selectedProject.startDate).toLocaleDateString()
                    : "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">End Date</Typography>
                <Typography>
                  {selectedProject.endDate
                    ? new Date(selectedProject.endDate).toLocaleDateString()
                    : "Ongoing"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Status</Typography>
                <Typography>{selectedProject.status || "N/A"}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Completion (%)</Typography>
                <Typography>
                  {selectedProject.completion !== undefined
                    ? `${selectedProject.completion}%`
                    : "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Description</Typography>
                <Typography>{selectedProject.description || "No description available"}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
};

export default ManageProjectReadOnly;
