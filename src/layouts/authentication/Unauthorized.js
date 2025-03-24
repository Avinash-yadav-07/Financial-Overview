import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useMaterialUIController } from "context"; // For dark mode
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { Card, Grid, Container, useTheme, Box } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HomeIcon from "@mui/icons-material/Home";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import DashboardNavbar from "examples/Navbars/DashboardNavbar"; // Import DashboardNavbar
import Sidenav from "examples/Sidenav"; // Import Sidenav for sidebar
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";
import Footer from "examples/Footer"; // Assuming you have a Footer component

const Unauthorized = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [controller] = useMaterialUIController();
  const { darkMode, miniSidenav, sidenavColor } = controller;

  // Animation variants for the card
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Animation variants for the icon
  const iconVariants = {
    hidden: { scale: 0 },
    visible: { scale: 1, transition: { duration: 0.5, delay: 0.3 } },
  };

  // Animation variants for the text
  const textVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, delay: 0.6 } },
  };

  // Animation variants for the buttons
  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.9 } },
  };

  return (
    <MDBox
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      bgColor={darkMode ? "background.default" : "background.paper"}
    >
      {/* Sidebar */}
      <Sidenav
        color={sidenavColor}
        brand={darkMode ? brandDark : brandWhite}
        brandName="Your App"
        routes={[]} // Pass empty routes or your actual routes
        onMouseEnter={() => {}}
        onMouseLeave={() => {}}
      />

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
        ml={{ xs: 0, md: miniSidenav ? 14 : 28 }} // Adjust margin for sidebar
        mt={{ xs: "140px", md: "100px" }}
        p={3}
        sx={{
          transition: "margin 0.2s ease-in-out",
          backgroundColor: darkMode ? "background.default" : "background.paper",
          minHeight: "calc(100vh - 80px)",
          paddingTop: { xs: "32px", md: "24px" },
          zIndex: 1000,
        }}
      >
        <Container>
          <Grid container justifyContent="center">
            <Grid item xs={12} md={8} lg={6}>
              <motion.div initial="hidden" animate="visible" variants={cardVariants}>
                <Card
                  sx={{
                    p: 3, // Reduced padding for smaller size
                    borderRadius: 3,
                    boxShadow: theme.shadows[10],
                    backgroundColor: darkMode ? "background.paper" : "background.default",
                  }}
                >
                  <MDBox textAlign="center" mb={3}>
                    <motion.div variants={iconVariants}>
                      <LockIcon
                        sx={{
                          fontSize: 60, // Reduced icon size
                          color: theme.palette.error.main,
                          mb: 2,
                        }}
                      />
                    </motion.div>
                    <motion.div variants={textVariants}>
                      <MDTypography variant="h3" color="error" fontWeight="bold">
                        Unauthorized Access
                      </MDTypography>
                    </motion.div>
                    <motion.div variants={textVariants}>
                      <MDTypography variant="body1" color="text" mt={2}>
                        You do not have permission to view this page. Please contact the
                        administrator if you believe this is an error.
                      </MDTypography>
                    </motion.div>
                  </MDBox>

                  <MDBox mt={4} textAlign="center">
                    <motion.div variants={buttonVariants}>
                      <MDButton
                        variant="gradient"
                        color="info"
                        startIcon={<HomeIcon />}
                        onClick={() => navigate("/")}
                        sx={{ mr: 2 }}
                      >
                        Go to Home
                      </MDButton>
                    </motion.div>
                    <motion.div variants={buttonVariants}>
                      <MDButton
                        variant="gradient"
                        color="error"
                        startIcon={<ContactSupportIcon />}
                        onClick={() => navigate("/contact-support")}
                      >
                        Contact Support
                      </MDButton>
                    </motion.div>
                  </MDBox>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Container>

        {/* Additional Sections for a Polished UI */}
        <MDBox mt={8} width="100%">
          <Container>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <motion.div initial="hidden" animate="visible" variants={cardVariants}>
                  <Card
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      boxShadow: theme.shadows[5],
                      backgroundColor: darkMode ? "background.paper" : "background.default",
                      height: "100%", // Ensure equal height
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <MDBox textAlign="center">
                      <ErrorOutlineIcon
                        sx={{
                          fontSize: 50,
                          color: theme.palette.warning.main,
                          mb: 2,
                        }}
                      />
                      <MDTypography variant="h5" fontWeight="bold">
                        Why Am I Seeing This?
                      </MDTypography>
                      <MDTypography variant="body2" color="text" mt={2}>
                        You may not have the necessary permissions to access this page. Please
                        verify your role or contact your administrator.
                      </MDTypography>
                    </MDBox>
                  </Card>
                </motion.div>
              </Grid>

              <Grid item xs={12} md={4}>
                <motion.div initial="hidden" animate="visible" variants={cardVariants}>
                  <Card
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      boxShadow: theme.shadows[5],
                      backgroundColor: darkMode ? "background.paper" : "background.default",
                      height: "100%", // Ensure equal height
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <MDBox textAlign="center">
                      <LockIcon
                        sx={{
                          fontSize: 50,
                          color: theme.palette.info.main,
                          mb: 2,
                        }}
                      />
                      <MDTypography variant="h5" fontWeight="bold">
                        How to Gain Access
                      </MDTypography>
                      <MDTypography variant="body2" color="text" mt={2}>
                        If you need access to this page, please submit a request to your
                        administrator with a valid reason.
                      </MDTypography>
                    </MDBox>
                  </Card>
                </motion.div>
              </Grid>

              <Grid item xs={12} md={4}>
                <motion.div initial="hidden" animate="visible" variants={cardVariants}>
                  <Card
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      boxShadow: theme.shadows[5],
                      backgroundColor: darkMode ? "background.paper" : "background.default",
                      height: "100%", // Ensure equal height
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <MDBox textAlign="center">
                      <ContactSupportIcon
                        sx={{
                          fontSize: 50,
                          color: theme.palette.success.main,
                          mb: 2,
                        }}
                      />
                      <MDTypography variant="h5" fontWeight="bold">
                        Contact Support
                      </MDTypography>
                      <MDTypography variant="body2" color="text" mt={2}>
                        If you believe this is an error, please contact our support team for
                        assistance.
                      </MDTypography>
                    </MDBox>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>
          </Container>
        </MDBox>
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
    </MDBox>
  );
};

export default Unauthorized;
