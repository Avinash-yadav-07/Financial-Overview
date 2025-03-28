import React from "react";
import { Route, Routes } from "react-router-dom";
import ExpenseOverview from "layouts/dashboard";
import Customer from "layouts/billing";
import ManageEmployee from "layouts/manage-employee";
import ManageProjects from "./layouts/manage-projects";
import ManageClient from "./layouts/manage-client";
import ManageRoles from "layouts/manage-roles";
import ManageEarnings from "layouts/manage-earning";
import ManageAccount from "./layouts/manage-accounts/index";
import ManageExpenses from "./layouts/manage-expense";
import Icon from "@mui/material/Icon";
import Dashboard from "layouts/dashboard";
import Basic from "layouts/authentication/sign-in"; // Importing Sign-in page
import Logout from "layouts/authentication/Logout";
import ManageAccountReadOnly from "./layouts/manage-accounts/ManageAccountReadOnly"; // Import ReadOnly components
import ManageProjectReadOnly from "layouts/manage-projects/ManageProjectReadOnly";
import ManageExpenseReadOnly from "layouts/manage-expense/ManageExpenseReadOnly";
import ManageEarningReadOnly from "layouts/manage-earning/ManageEarningReadOnly";
import ManageClientReadOnly from "layouts/manage-client/ManageClientReadOnly";
import ProtectedRoute from "./layouts/authentication/ProtectedRoute"; // Import the ProtectedRoute component
import Unauthorized from "./layouts/authentication/Unauthorized";

const routes = [
  {
    route: "/sign-in", // Keep it as a route but NOT in sidebar
    component: <Basic />,
  },
  {
    route: "/unauthorized", // Add the unauthorized route
    component: <Unauthorized />,
  },
  {
    type: "collapse",
    name: "Manage",
    key: "manage",
    icon: <Icon fontSize="small">settings</Icon>,
    collapse: [
      {
        name: "Manage Employee",
        key: "manage-employee",
        icon: <Icon fontSize="small">person</Icon>,
        route: "/manage/employee",
        component: (
          <ProtectedRoute allowedRoles={["ManageEmployee:full access"]}>
            <ManageEmployee />
          </ProtectedRoute>
        ),
      },
      {
        name: "Manage Clients",
        key: "manage-clients",
        icon: <Icon fontSize="small">group</Icon>,
        route: "/manage/clients",
        component: (
          <ProtectedRoute allowedRoles={["ManageClient:full access"]}>
            <ManageClient />
          </ProtectedRoute>
        ),
      },
      {
        name: "Manage Clients (Read Only)",
        key: "manage-clients-read-only",
        icon: <Icon fontSize="small">group</Icon>,
        route: "/manage/clients/read-only",
        component: (
          <ProtectedRoute allowedRoles={["ManageClient:read"]}>
            <ManageClientReadOnly />
          </ProtectedRoute>
        ),
      },
      {
        name: "Manage Accounts",
        key: "manage-accounts",
        icon: <Icon fontSize="small">account_balance</Icon>,
        route: "/manage/accounts",
        component: (
          <ProtectedRoute allowedRoles={["ManageAccount:full access", "ManageAccount:read"]}>
            <ManageAccount />
          </ProtectedRoute>
        ),
      },
      {
        name: "Manage Accounts (Read Only)",
        key: "manage-accounts-read-only",
        icon: <Icon fontSize="small">account_balance</Icon>,
        route: "/manage/accounts/read-only",
        component: (
          <ProtectedRoute allowedRoles={["ManageAccount:read"]}>
            <ManageAccountReadOnly />
          </ProtectedRoute>
        ),
      },
      {
        name: "Manage Expenses",
        key: "manage-expenses",
        icon: <Icon fontSize="small">receipt</Icon>,
        route: "/manage/expenses",
        component: (
          <ProtectedRoute allowedRoles={["ManageExpense:full access", "ManageExpense:read"]}>
            <ManageExpenses />
          </ProtectedRoute>
        ),
      },
      {
        name: "Manage Expenses (Read Only)",
        key: "manage-expenses-read-only",
        icon: <Icon fontSize="small">receipt</Icon>,
        route: "/manage/expenses/read-only",
        component: (
          <ProtectedRoute allowedRoles={["ManageExpense:read"]}>
            <ManageExpenseReadOnly />
          </ProtectedRoute>
        ),
      },
      {
        name: "Manage Projects",
        key: "manage-projects",
        icon: <Icon fontSize="small">assignment</Icon>,
        route: "/manage/projects",
        component: (
          <ProtectedRoute allowedRoles={["ManageProject:full access", "ManageProject:read"]}>
            <ManageProjects />
          </ProtectedRoute>
        ),
      },
      {
        name: "Manage Projects (Read Only)",
        key: "manage-projects-read-only",
        icon: <Icon fontSize="small">assignment</Icon>,
        route: "/manage/projects/read-only",
        component: (
          <ProtectedRoute allowedRoles={["ManageProject:read"]}>
            <ManageProjectReadOnly />
          </ProtectedRoute>
        ),
      },
      {
        name: "Manage Roles",
        key: "manage-roles",
        icon: <Icon fontSize="small">assignment</Icon>,
        route: "/manage/roles",
        component: (
          <ProtectedRoute allowedRoles={["ManageRoles:full access"]}>
            <ManageRoles />
          </ProtectedRoute>
        ),
      },
      {
        name: "Manage Earnings",
        key: "manage-earnings",
        icon: <Icon fontSize="small">receipt</Icon>,
        route: "/manage/earnings",
        component: (
          <ProtectedRoute allowedRoles={["ManageEarning:full access", "ManageEarning:read"]}>
            <ManageEarnings />
          </ProtectedRoute>
        ),
      },
      {
        name: "Manage Earnings (Read Only)",
        key: "manage-earnings-read-only",
        icon: <Icon fontSize="small">receipt</Icon>,
        route: "/manage/earnings/read-only",
        component: (
          <ProtectedRoute allowedRoles={["ManageEarning:read"]}>
            <ManageEarningReadOnly />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    type: "collapse",
    name: "Financial Overview",
    key: "financial-overview",
    icon: <Icon fontSize="small">account_balance</Icon>,
    route: "/financial-overview",
    component: <Dashboard />, // No ProtectedRoute wrapper
  },
  {
    type: "collapse",
    name: "Customer",
    key: "customer",
    icon: <Icon fontSize="small">group</Icon>,
    route: "/customer",
    component: <Customer />, // No ProtectedRoute wrapper
  },
  {
    type: "collapse",
    name: "Sales",
    key: "sales",
    icon: <Icon fontSize="small">shopping_cart</Icon>,
    route: "/sales",
    component: <Dashboard />, // No ProtectedRoute wrapper
  },
  {
    type: "collapse",
    name: "Employee",
    key: "employee",
    icon: <Icon fontSize="small">badge</Icon>,
    route: "/employee",
    component: <Dashboard />, // No ProtectedRoute wrapper
  },
  {
    type: "collapse",
    name: "Product Development",
    key: "product-development",
    icon: <Icon fontSize="small">build</Icon>,
    route: "/product-development",
    component: <Dashboard />, // No ProtectedRoute wrapper
  },
  {
    type: "collapse",
    name: "IT Infrastructure",
    key: "it-infrastructure",
    icon: <Icon fontSize="small">computer</Icon>,
    route: "/it-infrastructure",
    component: <Dashboard />, // No ProtectedRoute wrapper
  },
  {
    type: "collapse",
    name: "R&D Innovation",
    key: "rd-innovation",
    icon: <Icon fontSize="small">lightbulb</Icon>,
    route: "/rd-innovation",
    component: <Dashboard />, // No ProtectedRoute wrapper
  },
  {
    type: "collapse",
    name: "Market Analysis",
    key: "market-analysis",
    icon: <Icon fontSize="small">bar_chart</Icon>,
    route: "/market-analysis",
    component: <Dashboard />, // No ProtectedRoute wrapper
  },
  {
    type: "collapse",
    name: "Digital Transformation",
    key: "digital-transformation",
    icon: <Icon fontSize="small">transform</Icon>,
    route: "/digital-transformation",
    component: <Dashboard />, // No ProtectedRoute wrapper
  },
  {
    type: "collapse",
    name: "Diversity and Inclusion",
    key: "diversity-inclusion",
    icon: <Icon fontSize="small">diversity_3</Icon>,
    route: "/diversity-inclusion",
    component: <Dashboard />, // No ProtectedRoute wrapper
  },
  {
    type: "collapse",
    name: "Security",
    key: "security",
    icon: <Icon fontSize="small">security</Icon>,
    route: "/security",
    component: <Dashboard />, // No ProtectedRoute wrapper
  },
  {
    type: "collapse",
    name: "Operational Efficiency",
    key: "operational-efficiency",
    icon: <Icon fontSize="small">speed</Icon>,
    route: "/operational-efficiency",
    component: <Dashboard />, // No ProtectedRoute wrapper
  },
  {
    type: "collapse",
    name: "Logout",
    key: "logout",
    route: "/logout",
    icon: <Icon fontSize="small">logout</Icon>,
    component: <Logout />, // Logout route is public
  },
];

export default routes;
