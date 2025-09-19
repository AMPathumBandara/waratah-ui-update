import React, { useState } from "react";
import { Button, IconButton, Typography } from "@mui/material";
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
import { useNavigate } from "react-router";
import FeatureFlag from "utils/FeatureFlag";
const useStyles = makeStyles((theme: Theme) => ({
  applicationHeader: {
    minHeight: 100,
    paddingLeft: "2rem",
    paddingRight: "2rem",
    borderTop: "1px solid #D9D9D9",
    borderBottom: "1px solid #D9D9D9",
  },
  title: {
    fontSize: "1.2rem",
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
      color: theme.palette.getContrastText(theme.palette.secondary.light),
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
}));

interface TenantHeaderProps {
  setSearchValue?: any;
  setButtonClick?: any;
  buttonText?: string;
  title?: string;
  filterMyApplication?: any;
  setFilterMyApplication?: any;
}

export const TenantHeader: React.FunctionComponent<TenantHeaderProps> =
  props => {
    const {
      setSearchValue,
      setButtonClick,
      title,
      buttonText,
      setFilterMyApplication,
      filterMyApplication,
    } = props;

    const classes = useStyles();
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
        <div className="application-header">
          <div className="application-header-btns-wrapper">
            <div>
              <h3 className="title">Tenants</h3>
            </div>
          </div>
          <div>
            <div className="application-header-actions">
              <div>
                <FeatureFlag
                  roles={["super_admin"]}
                  fallbackRender={() => <div></div>}
                >
                  <FormProvider {...form}>
                    <form onSubmit={handleSubmit(handleFormSubmit)}>
                      <div className="searchFormWrapper">
                        <div>
                          <InputField
                            name="search"
                            className={classes.searchField}
                          />
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
                            className={`searchBtn ${classes.searchBtn}`}
                            startIcon={<SearchIcon />}
                            type="submit"
                          >
                            Search
                          </Button>
                        </div>
                      </div>
                    </form>
                  </FormProvider>
                </FeatureFlag>
              </div>
              <div>
                <FeatureFlag
                  roles={["super_admin"]}
                  fallbackRender={() => <div></div>}
                >
                  {setButtonClick && buttonText && (
                    <Button
                      className={classes.createBtn}
                      endIcon={<AddCircleIcon />}
                      onClick={() => setButtonClick()}
                    >
                      {buttonText}
                    </Button>
                  )}
                </FeatureFlag>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

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
  const classes = useStyles();

  const [globalFilterDropdown, setGlobalFilterDropdown] = useState(false);
  const [filterType, setFilterType] = useState(filterTypes[0]);

  const trigerFilter = (filter: any) => {
    setFilterType(filter);
    props.setGlobalFilterType(filter.value);
  };

  return (
    <div className="global-filter-wrapper">
      <div
        className="global-filter-handle"
        onClick={() => setGlobalFilterDropdown(true)}
      >
        <Typography variant="body2" className={classes.title}>
          {filterType.label}
          <ArrowDropDownIcon fontSize="medium" />
        </Typography>
      </div>
      {globalFilterDropdown && (
        <>
          <div
            className="overlay"
            onClick={() => setGlobalFilterDropdown(false)}
          ></div>
          <div className={`global-filter-dropdown ${classes.gobalFilter}`}>
            <ul>
              {filterTypes?.map(f => (
                <li
                  className={`flex ${
                    f.value === filterType.value ? "active" : ""
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
          </div>
        </>
      )}
    </div>
  );
};
