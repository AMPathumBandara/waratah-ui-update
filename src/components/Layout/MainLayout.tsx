import React, { Suspense, useEffect, useState } from "react";
import {
  Theme,
  ThemeProvider,
  createTheme,
} from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
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
const ApplicationModal2 = React.lazy(() => import("components/Application/ApplicationModal2"));
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

// export const router = createBrowserRouter([
//   {
//     index: true,
//     element: <ProtectedRoute component={AccessDenied} path={'/access-denied'} />
//   },
//   {
//     index: true,
//     element: <ProtectedRoute component={Logout} path={'/logout'} />
//   },
//   {
//     index: true,
//     element: <ProtectedRoute component={ApplicationLandingPage} path={'/'} />
//   },
//   {
//     path: "/applications",
//     element: <ProtectedRoute component={Applications} path={'/applications'} />,
//     children: [
//       {
//         path: "create",
//         element: (
//           <ApplicationModal
//             showModal={true}
//             //setShowModal={onClose}
//             title="Create an Application"
//           >
//             <MemorizedApplicationDetails />
//           </ApplicationModal>
//         )
//       }
//     ]
//   },
//   {
//     path: "/applications-list",
//     element: <ProtectedRoute component={ApplicationsNewLayout} path={'/applications-list'} />,
//   },
//   {
//     path: "/tenants",
//     element: <ProtectedRoute component={Tenants} path={'/tenants'} />,
//   },
//   {
//     path: "*",
//     element: <ProtectedRoute component={Page404} path={'*'} />,
//   },
//   {
//     path: "/page-not-found",
//     element: <ProtectedRoute component={Page404} path={'/page-not-found'} />,
//   },
// ]);
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
    path: "/tenants",
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
const protectedModalLinks = [
  {
    path: "/applications/create",
    component: ApplicationModal2,
    exact: false,
  },
  {
    path: "/applications/:id",
    component: ApplicationModal2,
    exact: false,
  },
];

export default function PermanentDrawerLeft() {
  const classes = useStyles();
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location };
  const background = state?.backgroundLocation;

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
          <Routes location={background || location}>
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

          {/* render modal on top if background exists */}
          {
            background && (
              <Routes>
                {
                  protectedModalLinks.map(link => (
                    <Route
                      key={link.path}
                      path={`${link.path}`}
                      element={<ProtectedRoute component={link.component} path={link.path} />}
                    />
                  ))
                }
              </Routes>
            )
          }
        </Suspense>
      </ThemeProvider >
    </>
  );
}
