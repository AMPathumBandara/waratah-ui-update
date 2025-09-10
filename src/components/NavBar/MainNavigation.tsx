import React, { useEffect, useState } from "react";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import AppBar from "@mui/material/AppBar";
import { Avatar, Grid, Paper, Typography } from "@mui/material";
import { useMeQuery, useReleseVersionSubscription } from "generated/graphql";
import DefaultLogo from "../../visionxlogo.jpg";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useHistory, useLocation } from "react-router-dom";
import FeatureFlag from "utils/FeatureFlag";
import ErrorToast from "components/Toast/ErrorToast";
import "react-loading-skeleton/dist/skeleton.css";
import { LoadingAvatar, LoadingLogo } from "components/ContentLoaders";
import { NavigationAccess } from "utils";
import { useUser } from "components/Auth/CognitoHooks";
import LogoutButton from "./LogoutButton";
import RefreshSessionDialog from "./RefreshSessionDialog";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    background: "#FFFFFF",
    color: theme.palette.primary.main,
    padding: "0px 15px",
    boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.08)",
  },
  navContainer: {
    minHeight: 50,
  },

  avatarIcon: {
    padding: 0,
  },
  userDataGrid: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
    "& .MuiAvatar-root": {
      marginRight: 10,
    },
    "& p": {
      lineHeight: "16px",
    },
  },
  navigationItemWrapper: {
    "& li a": {
      color: theme.palette.primary.main,
      transition: "all 0.4s",
      borderBottom: `1px solid transparent`,
    },
    "& li.active a": {
      color: theme.palette.secondary.dark,
      borderBottom: `1px solid ${theme.palette.secondary.dark}`,
    },
    "& li:hover a": {
      color: theme.palette.secondary.dark,
    },
    "& .header-broker-agency": {
      color: theme.palette.primary.main,
    },
  },
}));

interface MainNaviProps { }

const MainNavigation = React.memo(() => {
  const classes = useStyles();
  const [toggleMenu, settoggleMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const history = useHistory();
  const [commitHash, setCommitHash] = useState<string | null>(null);
  const [showRefreshModal, setShowRefreshModal] = useState<boolean>(false);

  const { data: meData, loading: meLoading, error: meError } = useMeQuery();
  
  const currentUser = meData?.me[0];

  const logo =
  currentUser?.broker_producer?.broker_agency.tenant?.logo || DefaultLogo;
  
  const commissionRate = currentUser?.broker_producer?.commission_rate
  || currentUser?.broker_producer?.broker_agency?.commission_rate
  || null;
  
  const agency_name = currentUser?.broker_producer?.broker_agency.name || "";
  
  const loggedUser = useUser();
  const initialCommitHash = meData?.rqb_system[0]?.value?.last_commit_hash;
  const { loading: releaseVersionLoading, data: releaseVersionData } = useReleseVersionSubscription();
  
  //set initial commit hash
  useEffect(() => {
    const initialHash = meData?.rqb_system[0]?.value?.last_commit_hash;
    if (initialHash) {
      setCommitHash(initialHash);
    }
  }, [initialCommitHash]);

  //check when hash changes
  useEffect(() => {
    const commitHashValue = releaseVersionData?.rqb_system[0]?.value?.last_commit_hash;

    if (commitHashValue && commitHash && commitHashValue !== commitHash) {
      showSessionRefreshModal(commitHashValue);
    }
  }, [releaseVersionData]);
  
  const showSessionRefreshModal = (dbHashValue: string): void => {
    console.log("Application updated. Showing refresh modal....");
    setShowRefreshModal(true);
    setCommitHash(dbHashValue);
  };

  const logoutWithRedirect = React.useCallback(() => {
    history.push("/logout");
  }, [history]);

  const toggleMenuFn = React.useCallback(() => {
    if (toggleMenu) {
      settoggleMenu(false);
    } else {
      settoggleMenu(true);
    }
  }, [toggleMenu]);

  if (meLoading) {
    return <></>;
  }
  return (
    <>
      {meError && (
        <ErrorToast
          error={meError}
          processCustomError={() =>
            `Unable to Load User Data - ${meError?.message}`
          }
        />
      )}
      <RefreshSessionDialog
        open={showRefreshModal}
      />
      <AppBar position="fixed" className={classes.root}>
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          className={classes.navContainer}
        >
          {meLoading ? (
            <div className="logo-wrapper">
              <LoadingLogo />
            </div>
          ) : (
            <div className="logo-wrapper">
              <FeatureFlag
                roles={["super_admin"]}
                fallbackRender={() => (
                  <img
                    onClick={() => history.push("/")}
                    src={logo}
                    alt="logo"
                  />
                )}
              >
                <img
                  onClick={() => history.push("/")}
                  src={DefaultLogo}
                  alt="logo"
                />
              </FeatureFlag>
            </div>
          )}
          <div className="navbar">
            <div className="hamburger-menu-btn">
              <IconButton
                color="primary"
                aria-label="open-menu"
                component="span"
                onClick={toggleMenuFn}
              >
                <MenuIcon />
              </IconButton>
            </div>

            <div className={`responsive-nav ${toggleMenu ? "active" : ""}`}>
              <MainMenuItems />
            </div>

            <div className="flex align-items-center">
              <div className="header-broker-agency">{agency_name}</div>
              {meLoading ? (
                <LoadingAvatar />
              ) : (
                <>
                  <div style={{ position: "relative" }}>
                    <IconButton
                      aria-label="account of current user"
                      aria-controls="menu-appbar"
                      onClick={() => setShowProfileModal(true)}
                      color="inherit"
                      className={classes.avatarIcon}
                    >
                      <Avatar
                        alt="Profile Picture"
                        aria-describedby="menu-appbar"
                      />
                    </IconButton>

                    {showProfileModal && (
                      <>
                        <div
                          className="overlay"
                          onClick={() => setShowProfileModal(false)}
                        ></div>
                        <div className="profileModal">
                          <Paper>
                            <div className={classes.userDataGrid}>
                              <Avatar
                                alt="Profile Picture"
                                aria-describedby="menu-appbar"
                              />
                              <div>
                                <Typography
                                  variant="body2"
                                  className="username-text"
                                >
                                  {loggedUser?.username}
                                </Typography>
                                <small>
                                  {
                                    loggedUser?.signInUserSession?.idToken
                                      ?.payload?.["cognito:groups"][0]
                                  }
                                </small>
                                {
                                  commissionRate &&
                                  <>
                                    <br />
                                    <small>
                                      <b>Commission Rate: {commissionRate}%</b>
                                    </small>
                                  </>
                                }
                              </div>
                            </div>
                            <Grid container justifyContent="flex-end">
                              {/* <Button
                                variant="text"
                                size="medium"
                                startIcon={
                                  <PowerSettingsNewIcon fontSize="small" />
                                }
                                onClick={logoutWithRedirect}
                              >
                                Logout
                              </Button> */}
                              <LogoutButton />
                            </Grid>
                          </Paper>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </Grid>
      </AppBar>
    </>
  );
});

export default MainNavigation;

const MainMenuItems = () => {
  const classes = useStyles();

  const { pathname } = useLocation();

  const filterNavLinks = NavigationAccess?.filter(f => f.isParent === true);
  return (
    <ul className={`${classes.navigationItemWrapper} nav-links-wrapper`}>
      {filterNavLinks?.map((item: any, index: any) => (
        <FeatureFlag
          key={index}
          roles={item.allowUsers}
          fallbackRender={() => <div></div>}
        >
          <li className={`${pathname === item.path ? "active" : ""}`}>
            <Link to={{ pathname: `${item.path}` }}>{item.name}</Link>
          </li>
        </FeatureFlag>
      ))}
    </ul>
  );
};
