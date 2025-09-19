import React, { Suspense } from "react";
import { Routes, Route } from "react-router";
import CircularProgress from "@mui/material/CircularProgress";
import { Grid } from "@mui/material";

const Logout = React.lazy(() => import("../Auth/Logout"));
const ForgotPassword = React.lazy(() => import("../Auth/ForgotPasswordGql"));
const NewPassword = React.lazy(() => import("../Auth/NewPassword"));
const Login = React.lazy(() => import("../Auth/Login"));

export const guestRoutes = [
  { path: "/logout", component: Logout },
  { path: "/login", component: Login },
  { path: "/forgot-password", component: ForgotPassword },
  { path: "/new-password", component: NewPassword },
];

export default function GuestLayout() {
  return (
    <section id="wrapper" className="login-register">
      <div className="login-box login-sidebar">
        <div className="white-box">
          <div className="form-horizontal form-material">
            <Routes>
              {guestRoutes.map(route => {
                const Component = route.component;
                return (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={
                      <Suspense
                        fallback={
                          <Grid
                            container
                            alignItems="center"
                            justifyContent="center"
                            style={{ minHeight: "100vh" }}
                          >
                            <CircularProgress color="primary" />
                          </Grid>
                        }
                      >
                        <Component />
                      </Suspense>
                    }
                  />
                );
              })}
            </Routes>
          </div>
        </div>
      </div>
    </section>
  );
}

