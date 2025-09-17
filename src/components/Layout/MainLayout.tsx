import React, { Suspense, useEffect, useState } from "react";
import {
  createStyles,
  Theme,
  ThemeProvider,
  createTheme,
} from "@mui/material/styles";
import { makeStyles, StylesProvider } from "@mui/styles";
import { CssBaseline } from "@mui/material";
import { Routes, Route, useLocation } from "react-router-dom";
import { Grid } from "@mui/material";
import ProtectedRoute from "utils/ProtectedRoute";
import MainNavigation from "components/NavBar/MainNavigation";
import FullScreenLoading from "./FullScreenLoading";
import Logout from "components/Auth/Logout";
import theme from "theme/theme";
import { useMeQuery } from "generated/graphql";
import ErrorToast from "components/Toast/ErrorToast";
import ApplicationModal from "components/Application/ApplicationModal";

const Page404 = React.lazy(() => import("pages/Page404"));
const AccessDenied = React.lazy(() => import("pages/PageUnAuthorized"));
const Applications = React.lazy(() => import("pages/Applications"));
const ApplicationsNewLayout = React.lazy(
  () => import("pages/ApplicationsNewLayout")
);
const ApplicationLandingPage = React.lazy(
  () => import("../Application/LandingPage")
);
const Tenants = React.lazy(() => import("pages/Tenants"));

const useStyles = makeStyles((theme: Theme) => ({
  spinner: {
    height: "100vh",
  },
})
);
const protectedLinks = [
  {
    path: "/",
    component: ApplicationLandingPage,
    exact: true,
  },
  {
    path: "/applications",
    component: Applications,
    exact: false,
  },
  {
    path: "/applications-list",
    component: ApplicationsNewLayout,
    exact: false,
  },
  {
    path: "/tenants/*",
    component: Tenants,
    exact: false,
  },
  {
    path: "*",
    component: Page404,
    exact: true,
  },
  {
    path: "/page-not-found",
    component: Page404,
    exact: true,
  },
];

export default function PermanentDrawerLeft() {
  const classes = useStyles();
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location };

  const { data: meData, loading: meLoading, error: meError } = useMeQuery({
    errorPolicy: "all"
  });

  const themeData = meData?.me[0]?.broker_producer?.broker_agency.tenant;
  const [ctheme, setCTheme] = useState(theme);

  useEffect(() => {
    if (themeData) {
      const tempTheme = { ...ctheme };
      tempTheme.palette.primary.light = "";
      tempTheme.palette.primary.dark = "";
      tempTheme.palette.secondary.light = "";
      tempTheme.palette.secondary.dark = "";
      tempTheme.palette.primary.main = themeData?.primary_color!;
      tempTheme.palette.secondary.main = themeData?.secondary_color!;
      setCTheme(createTheme(tempTheme));
    }
  }, [setCTheme, themeData]);

  if (meLoading) {
    return <FullScreenLoading />;
  }

  return (
    <>
      {meError?.message !== undefined ? (
        <ErrorToast
          error={meError}
          processCustomError={() =>
            `Unable to Load User Data - ${meError?.message}`
          }
        />
      ) : (
        <></>
      )}

      <ThemeProvider theme={ctheme}>
        <CssBaseline />
        <MainNavigation />

        <Suspense
          fallback={
            <Grid
              container
              alignItems="center"
              justifyContent="center"
              className={classes.spinner}
            >
              <FullScreenLoading />
            </Grid>
          }
        >
          {/* Main routes */}
          <Routes location={state?.backgroundLocation || location}>
            <Route
              path="/access-denied"
              element={<AccessDenied />}
            />
            <Route path="/logout" element={<Logout />} />

            {protectedLinks.map(link => (
              <Route
                key={link.path}
                path={`${link.path}`}
                element={<ProtectedRoute component={link.component} path={link.path} />}
              />
            ))}
          </Routes>
        </Suspense>
      </ThemeProvider>
    </>
  );
}
