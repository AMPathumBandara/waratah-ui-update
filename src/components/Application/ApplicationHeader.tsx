import React, { useState } from "react";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import { alpha } from "@mui/material/styles";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SearchIcon from "@mui/icons-material/Search";
import InputField from "components/From/InputField";
import { FormProvider, useForm } from "react-hook-form";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import { useNavigate } from "react-router-dom";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import {
  createTheme,
  ThemeProvider,
  useTheme,
} from "@mui/material/styles";

// const useStyles = makeStyles((theme: Theme) => ({
//   applicationHeader: {
//     minHeight: 100,
//     paddingLeft: "2rem",
//     paddingRight: "2rem",
//     borderTop: "1px solid #D9D9D9",
//     borderBottom: "1px solid #D9D9D9",
//   },
//   title: {
//     fontSize: "1rem",
//     fontWeight: 600,
//     color: "#333",
//     display: "flex",
//     alignItems: "center",
//   },
//   createBtn: {
//     textTransform: "none",
//     color: theme.palette.primary.main,
//     fontSize: 20,
//     "& svg": {
//       fontSize: "40px !important",
//     },
//   },
//   searchBtn: {
//     boxShadow: `0px 5px 10px ${alpha(theme.palette.primary.main, 0.2)}`,
//     "&.active": {
//       backgroundColor: theme.palette.secondary.light,
//       color: theme.palette.getContrastText(theme.palette.secondary.light),
//       borderColor: theme.palette.secondary.light,
//     },
//   },
//   searchField: {
//     margin: 0,
//     width: "100%",
//     "& .MuiFormHelperText-root": {
//       position: "absolute",
//       bottom: -22,
//       fontSize: 12,
//     },
//   },
//   gobalFilter: {
//     "&.global-filter-dropdown ul li.active": {
//       color: theme.palette.success.main,
//     },
//   },
// }));

interface ApplicationHeaderProps {
  setSearchValue?: any;
  setButtonClick?: any;
  buttonText?: string;
  title?: string;
  filterMyApplication?: any;
  setFilterMyApplication?: any;
}

export const ApplicationHeader = React.memo<ApplicationHeaderProps>(props => {
  const {
    setSearchValue,
    setButtonClick,
    title,
    buttonText,
    setFilterMyApplication,
    filterMyApplication,
  } = props;

  const theme = useTheme();

  // extend / override the current theme
  const pageTheme = createTheme(theme, {
    custom: {
      applicationHeader: {
        minHeight: 100,
        paddingLeft: "2rem",
        paddingRight: "2rem",
        borderTop: "1px solid #D9D9D9",
        borderBottom: "1px solid #D9D9D9",
      },
      title: {
        fontSize: "1rem",
        fontWeight: 600,
        color: "#333",
        display: "flex",
        alignItems: "center",
      },
      createBtn: {
        textTransform: "none",
        color: theme.palette.primary.main,
        fontSize: 20,
        "& svg": {
          fontSize: "40px !important",
        },
      },
      searchBtn: {
        boxShadow: `0px 5px 10px ${alpha(theme.palette.primary.main, 0.2)}`,
        "&.active": {
          backgroundColor: theme.palette.secondary.light,
          //color: theme.palette.getContrastText(theme.palette.secondary.light),
          borderColor: theme.palette.secondary.light,
        },
      },
      searchField: {
        margin: 0,
        width: "100%",
        "& .MuiFormHelperText-root": {
          position: "absolute",
          bottom: -22,
          fontSize: 12,
        },
      },
      gobalFilter: {
        "&.global-filter-dropdown ul li.active": {
          color: theme.palette.success.main,
        },
      },
    }
  });

  //const classes = useStyles();
  const navigate = useNavigate();
  const form = useForm();

  const { handleSubmit } = form;

  const handleFormSubmit = async (data: any) => {
    setSearchValue(data.search);
  };
  const setClearSearch = () => {
    form.reset();
    setSearchValue("");
  };

  return (
    <>
      <ThemeProvider theme={pageTheme}>
        <div className="application-header">
          <div className="application-header-btns-wrapper">
            <GlobalFilters
              setGlobalFilterType={(v: any) => setFilterMyApplication(v)}
              theme={pageTheme}
            />
          </div>

          <div className="application-header-actions">
            <div>
              <FormProvider {...form}>
                <form onSubmit={handleSubmit(handleFormSubmit)}>
                  <div className="searchFormWrapper">
                    <div>
                      <InputField name="search" sx={(theme: Theme) => theme.custom.searchField} />
                      <IconButton
                        aria-label="clear"
                        className="clearBtn"
                        size="small"
                        title="Clear"
                        onClick={setClearSearch}
                      >
                        {form.watch("search") !== "" ? (
                          <CancelIcon fontSize="small" color="action" />
                        ) : (
                          <></>
                        )}
                      </IconButton>
                    </div>
                    <div>
                      <Button
                        variant="contained"
                        color="primary"
                        className={`searchBtn`}
                        sx={(theme: Theme) => theme.custom.searchBtn}
                        startIcon={<SearchIcon />}
                        type="submit"
                      >
                        Search
                      </Button>
                    </div>
                  </div>
                </form>
              </FormProvider>
            </div>
            <div>
              {setButtonClick && buttonText && (
                <Button
                  //className={classes.createBtn}
                  sx={(theme: Theme) => theme.custom.createBtn}
                  endIcon={<AddCircleIcon />}
                  onClick={() => setButtonClick()}
                >
                  {buttonText}
                </Button>
              )}
            </div>
          </div>
        </div>
      </ThemeProvider>
    </>
  );
});

const filterTypes = [
  {
    label: "All Applications",
    value: "all-applications",
  },
  {
    label: "My Applications",
    value: "my-applications",
  },
];

const GlobalFilters = (props: any) => {
  //const classes = useStyles();

  const [globalFilterDropdown, setGlobalFilterDropdown] = useState(false);
  const [filterType, setFilterType] = useState(filterTypes[0]);
  const navigate = useNavigate();
  const trigerFilter = (filter: any) => {
    setFilterType(filter);
    props.setGlobalFilterType(filter.value);
  };

  return (
    <ThemeProvider theme={props.theme}>
      <div className="global-filter-wrapper">
        <div className="global-filter-handle flex">
          <div className="change-layout-btn kanban">
            <Tooltip title="Change layout">
              <div>
                <ViewCompactIcon
                  color="primary"
                  onClick={() => navigate("/applications-list")}
                />
                <ViewColumnIcon
                  className="columnIcon disabled"
                  color="disabled"
                />
              </div>
            </Tooltip>
          </div>
          <div onClick={() => setGlobalFilterDropdown(true)}>
            <Typography variant="body2" sx={(theme) => theme.custom.title}
            //className={classes.title}
            >
              {filterType.label}
              <ArrowDropDownIcon fontSize="medium" />
            </Typography>
          </div>
        </div>
        {globalFilterDropdown && (
          <>
            <div
              className="overlay"
              onClick={() => setGlobalFilterDropdown(false)}
            ></div>
            <Box className={`global-filter-dropdown`}
              sx={(theme) => theme.custom.gobalFilter}
            >
              <ul>
                {filterTypes?.map(f => (
                  <li
                    className={`flex ${f.value === filterType.value ? "active" : ""
                      }`}
                    onClick={() => trigerFilter(f)}
                  >
                    <div>{f.label}</div>
                    <div>
                      {f.value === filterType.value ? <CheckIcon /> : <></>}
                    </div>
                  </li>
                ))}
              </ul>
            </Box>
          </>
        )}
      </div>
    </ThemeProvider>
  );
};
