import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  Typography,
  Box,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import DataTable from "examples/Tables/DataTable";
import { db } from "../manage-employee/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { useMaterialUIController } from "context";

const ManageEarningReadOnly = () => {
  const [earnings, setEarnings] = useState([]);
  const [selectedEarning, setSelectedEarning] = useState(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);

  const [controller] = useMaterialUIController();
  const { miniSidenav, darkMode } = controller;

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "earnings"), (snapshot) => {
      const earningsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          date: data.date?.toDate().toLocaleDateString() || "N/A",
        };
      });
      setEarnings(earningsData);
    });
    return () => unsubscribe();
  }, []);

  const EarningDetails = ({ label, value }) => (
    <MDBox lineHeight={1} textAlign="left">
      <MDTypography display="block" variant="caption" color="text" fontWeight="medium">
        {label}
      </MDTypography>
      <MDTypography variant="caption" sx={{ color: darkMode ? "white" : "inherit" }}>{value}</MDTypography>
    </MDBox>
  );

  EarningDetails.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  };

  const AmountBadge = ({ amount }) => (
    <MDBox ml={-1}>
      <MDBadge
        badgeContent={`$${Number(amount).toFixed(2)}`}
        color="success"
        variant="gradient"
        size="sm"
      />
    </MDBox>
  );

  AmountBadge.propTypes = {
    amount: PropTypes.number.isRequired,
  };

  const tableData = {
    columns: [
      { Header: "Earning ID", accessor: "earningId", align: "left" },
      { Header: "Category", accessor: "category", align: "left" },
      { Header: "Reference", accessor: "reference", align: "left" },
      { Header: "Account", accessor: "account", align: "left" },
      { Header: "Amount", accessor: "amount", align: "center" },
      { Header: "Date", accessor: "date", align: "center" },
      { Header: "Actions", accessor: "actions", align: "center" },
    ],
    rows: earnings.map((earning) => ({
      earningId: (
        <MDTypography variant="caption" fontWeight="medium" sx={{ color: darkMode ? "white" : "inherit" }}>
          {earning.earningId || earning.id}
        </MDTypography>
      ),
      category: (
        <MDTypography variant="caption" fontWeight="medium" sx={{ color: darkMode ? "white" : "inherit" }}>
          {earning.category}
        </MDTypography>
      ),
      reference: <EarningDetails label="Reference" value={earning.referenceId || "N/A"} />,
      account: (
        <MDTypography variant="caption" fontWeight="medium" sx={{ color: darkMode ? "white" : "inherit" }}>
          {earning.accountId ? `${earning.accountId}` : "N/A"}
        </MDTypography>
      ),
      amount: <AmountBadge amount={Number(earning.amount)} />,
      date: (
        <MDTypography variant="caption" color="text" fontWeight="medium" sx={{ color: darkMode ? "white" : "inherit" }}>
          {earning.date}
        </MDTypography>
      ),
      actions: (
        <MDBox display="flex" justifyContent="center">
          <Button
            variant="gradient"
            color={darkMode ? "dark" : "info"}
            onClick={() => {
              setSelectedEarning(earning);
              setViewDetailsOpen(true);
            }}
          >
            View Details
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
              >
                <MDTypography variant="h6" color={darkMode ? "white" : "white"}>
                  Earnings Management
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
        <DialogTitle sx={{ color: darkMode ? "white" : "black" }}>Earning Details</DialogTitle>
        <DialogContent>
          {selectedEarning && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <EarningDetails label="Earning ID" value={selectedEarning.earningId} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <EarningDetails label="Category" value={selectedEarning.category} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <EarningDetails label="Reference" value={selectedEarning.referenceId || "N/A"} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <EarningDetails label="Account ID" value={`${selectedEarning.accountId}`} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <EarningDetails label="Amount" value={`$${Number(selectedEarning.amount).toFixed(2)}`} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <EarningDetails label="Date" value={selectedEarning.date} />
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

export default ManageEarningReadOnly;