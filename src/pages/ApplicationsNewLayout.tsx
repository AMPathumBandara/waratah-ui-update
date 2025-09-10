import React, { useEffect, useState } from "react";
import { Button, IconButton, Tooltip } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import { alpha } from "@mui/material/styles";
import {
  Order_By,
  useApplicationStageQuery,
  useLatestInsuranceApplicationsQuery,
  useMeQuery,
} from "generated/graphql";
import ApplicationModal, {
  ApplicationParams,
  ApplicationTitle,
} from "components/Application/ApplicationModal";
import InsuredApplicationDetails from "components/InsuredApplicationDetails";
import {
  Route,
  Switch,
  useRouteMatch,
  useHistory,
  useParams,
} from "react-router-dom";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { ApplicationHeader } from "components/Application/ApplicationHeader";
import { SortComponent } from "components/Filters/Sort";
import { FilterComponent } from "components/Filters";
import FeatureFlag from "utils/FeatureFlag";
import { LoadingApplicationItem } from "components/ContentLoaders";
import Skeleton from "react-loading-skeleton";
import ErrorIcon from "@mui/icons-material/Error";
import SearchIcon from "@mui/icons-material/Search";
import CancelIcon from "@mui/icons-material/Cancel";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import {
  AgentUnSignedIcon,
  currencyFormatter,
  InsuredUnSignedIcon,
  PaymentNotCollectedIcon,
} from "utils";
import Footer from "components/Footer";
import WatchApplicationUpdate from "components/Application/WatchApplicationUpdate";
import { FormProvider, useForm } from "react-hook-form";
import InputField from "components/From/InputField";
import { applicationStages } from "utils/const";

const useStyles = makeStyles((theme: Theme) => ({
  searchBtn: {
    marginLeft: 10,
    boxShadow: `0px 5px 10px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
  applicationRow: {
    borderRadius: 4,
    backgroundColor: theme.palette.grey[100],
    padding: "0px",
    paddingBottom: "30px",
    height: "100%",
  },
  applicationItemsWrapper: {
    overflowY: "auto",
    height: "calc(100vh - 280px)",
    "&::-webkit-scrollbar": {
      width: 6,
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: theme.palette.grey[300],
      borderRadius: "10px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: theme.palette.grey[400],
      borderRadius: "10px",
    },
  },
  applicationRowHeader: {
    backgroundColor: "#FFF",
    borderRadius: 4,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem",
    marginBottom: "0.5rem",
    position: "relative",
  },
  count: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    backgroundColor: "#FFFFFF",
    textAlign: "center",
    lineHeight: "30px",
    marginLeft: 10,
  },
  gridChip: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 4,
    fontSize: 14,
    color: theme.palette.grey[800],
    fontWeight: 600,
    backgroundColor: theme.palette.grey[100],
    padding: "0.25rem 0.5rem",
    cursor: "default",
  },
  applicationItem: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    borderRadius: 4,
    padding: "0.75rem",
    backgroundColor: "#FFFFFF",
    boxShadow: `0px 2px 10px ${alpha(theme.palette.grey[900], 0.15)}`,
    margin: "0.5rem 0.5rem 1rem 0.5rem",
    transition: "all 0.5s",
    cursor: "default",
    "&:hover": {
      boxShadow: `0px 10px 25px ${alpha(theme.palette.grey[900], 0.2)}`,
    },
  },
  loadMore: {
    textAlign: "center",
    marginBottom: 10,
    "& button": {
      fontSize: "0.8rem",
    },
  },
  signatureIndicator: {
    fontSize: 14,
    color: theme.palette.warning.light,
  },
  primaryBgColor: {
    backgroundColor: theme.palette.primary.main,
  },
  createBtn: {
    textTransform: "none",
    color: theme.palette.primary.main,
    fontSize: 20,
    "& svg": {
      fontSize: "40px !important",
    },
  },
  sidebarHandle: {
    backgroundColor: theme.palette.primary.main,
    "& svg": {
      fill: theme.palette.getContrastText(theme.palette.primary.main),
    },
  },
}));

const ApplicationTheme = [
  { stage: "all", primary: "#000000" },
  { stage: "quote", primary: "#326BFF" },
  { stage: "bound", primary: "#FF8412" },
  { stage: "declined", primary: "#FF4A4A" },
  { stage: "issued", primary: "#26AA3B" },
];

const FilterOptions = [
  {
    groupName: "Application Created",
    groupOptions: [
      {
        key: "7",
        value: "Last 07 Days",
      },
      {
        key: "14",
        value: "Last 14 Days",
      },
      {
        key: "30",
        value: "Last 30 Days",
      },
    ],
  },
  {
    groupName: "Application Effective",
    // groupOptions: [
    //   {
    //     key: "7",
    //     value: "Last 07 Days",
    //   },
    //   {
    //     key: "14",
    //     value: "Last 14 Days",
    //   },
    //   {
    //     key: "30",
    //     value: "Last 30 Days",
    //   },
    // ],
  },
];

const SortOptions = [
  {
    groupName: "Applications Sort By",
    groupOptions: [
      {
        optionName: "Created Date",
        options: [
          {
            key: "created_at",
            orderBy: "Desc",
          },
          {
            key: "created_at",
            orderBy: "Asc",
          },
        ],
        type: "date",
      },
      {
        optionName: "Updated Date",
        options: [
          {
            key: "updated_at",
            orderBy: "Desc",
          },
          {
            key: "updated_at",
            orderBy: "Asc",
          },
        ],
        type: "date",
      },
      {
        optionName: "Effective Date",
        options: [
          {
            key: "effective_date",
            orderBy: "Desc",
          },
          {
            key: "effective_date",
            orderBy: "Asc",
          },
        ],
        type: "date",
      },
      {
        optionName: "Organization",
        options: [
          {
            key: "name",
            orderBy: "Desc",
          },
          {
            key: "name",
            orderBy: "Asc",
          },
        ],
        type: "name",
      },
    ],
  },
];

const defaultSort = { key: "created_at", orderBy: "Desc" };

export default function ApplicationsNew() {
  const history = useHistory();
  const [filterMyApplication, setFilterMyApplication] =
    useState("all-applications");

  const { data: meData, loading: meLoading } = useMeQuery();

  // const userId =
  //   filterMyApplication === "my-applications"
  //     ? meData?.me[0].auth0_id
  //     : undefined;

  const { path } = useRouteMatch();

  if (meLoading) {
    return null;
  }
  // const setThemeColor = ApplicationTheme?.filter(f => f.stage === stage)[0] || {
  //   primary: "#000000",
  // };

  return (
    <div className="main">
      <div className="col-layout-wrapper">
        <Sidebar />

        <Switch>
          <Route exact path={`${path}/`}>
            <div className="content-wrapper">
              <div className="layout-header flex">
                <div className="change-layout-btn">
                  <Tooltip title="Change layout">
                    <div>
                      <ViewCompactIcon color="disabled" className="disabled" />
                      <ViewColumnIcon
                        color="primary"
                        className="columnIcon"
                        onClick={() => history.push("/applications")}
                      />
                    </div>
                  </Tooltip>
                </div>
              </div>
              <ApplicationHeaderTitle />
              <MemorizedApplicationDetails />
            </div>
          </Route>
          <Route exact path={`${path}/:id`}>
            <div className="content-wrapper">
              <div className="layout-header flex">
                <div className="change-layout-btn">
                  <Tooltip title="Change layout">
                    <div>
                      <ViewCompactIcon color="disabled" className="disabled" />
                      <ViewColumnIcon
                        color="primary"
                        className="columnIcon"
                        onClick={() => history.push("/applications")}
                      />
                    </div>
                  </Tooltip>
                </div>
              </div>
              <ApplicationHeaderTitle />
              <MemorizedApplicationDetails />
            </div>
          </Route>
        </Switch>
      </div>

      <WatchApplicationUpdate />
      <Footer />
    </div>
  );
}

const ApplicationHeaderTitle = () => {
  const params = useParams();
  const history = useHistory();
  const classes = useStyles();

  return (
    <>
      <div className="application-header-actions grid-layout">
        <div>
          <h3>
            {
              //@ts-ignore
              params.id ? <ApplicationTitle /> : "Create an Application"
            }
          </h3>
        </div>
        <div>
          {
            //@ts-ignore
            params.id ? (
              <Button
                className={classes.createBtn}
                endIcon={<AddCircleIcon />}
                onClick={() => history.push("/applications-list")}
              >
                Create Application
              </Button>
            ) : (
              <></>
            )
          }
        </div>
      </div>
    </>
  );
};

const MemorizedApplicationDetails = React.memo(InsuredApplicationDetails);

interface ApplicationListItemProps {
  themeColor?: any;
  applicationType: string;
  filterOptions: {};
  sortOptions: {};
  searchValue?: any;
  userId?: any;
  stage: string;
  paramId: string | undefined;
}

const page_size = 10;

const ApplicationListItem = React.memo<ApplicationListItemProps>(props => {
  const { searchValue, userId, stage, paramId } = props;

  const classes = useStyles();
  const params = useParams();
  const history = useHistory();

  const searchText = searchValue !== "" ? `%${searchValue}%` : "%";

  const getThemeColor = (stage: any) => {
    const setThemeColor = ApplicationTheme?.filter(
      f => f.stage === stage
    )[0] || {
      primary: "#000000",
    };

    return `${setThemeColor.primary}`;
  };
  const { data, loading, refetch, fetchMore } =
    useLatestInsuranceApplicationsQuery({
      variables: {
        applicationWhere: {
          stage: {
            _eq: stage === "All" ? undefined : stage?.toLowerCase(),
          },
          created_by_user_id: {
            _eq: userId,
          },
        },
        limit: page_size,
      },
      notifyOnNetworkStatusChange: true,
    });

  const applicationData = data?.latest_insurance_applications || [];
  const applicationsCount =
    data?.latest_insurance_applications_aggregate.aggregate?.count || 0;

  const setLoadMore = React.useCallback(
    async (len: number) => {
      await fetchMore({
        variables: {
          offset: len,
        },
        //@ts-ignore
        updateQuery: (pv, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return pv;
          } else {
            return {
              latest_insurance_applications: [
                ...pv.latest_insurance_applications,
                ...fetchMoreResult.latest_insurance_applications,
              ],
              latest_insurance_applications_aggregate: {
                ...fetchMoreResult.latest_insurance_applications_aggregate,
              },
              __typename: "latest_insurance_applications",
            };
          }
        },
      });
    },
    [fetchMore]
  );

  const getPremium = (item: any) => {
    if (item !== undefined || item !== null) {
      return `Premium: ${currencyFormatter(
        item?.insurance_quote_selection?.insurance_quote?.premium
      )}`;
    } else {
      return "N/A";
    }
  };
  return (
    <div className={classes.applicationRow}>
      <div className={classes.applicationRowHeader}>
        <Filters
          search={searchText}
          userId={userId}
          refetch={refetch}
          applicationType={stage === "All" ? undefined : stage?.toLowerCase()}
        />
      </div>

      <div className={classes.applicationItemsWrapper}>
        {!loading && applicationData?.length === 0 && (
          <h5 style={{ textAlign: "center" }}>No Applications</h5>
        )}
        {applicationData?.map(item => (
          <div
            className={`application-item grid-layout ${
              //@ts-ignore
              params.id === item.id ? "active" : ""
            }`}
            key={item.id}
            onClick={() => {
              history.push(`/applications-list/${item?.id}`);
            }}
          >
            <div className="circle-wrapper">
              <div
                className="circle"
                style={{
                  color: `${getThemeColor(item?.stage)}`,
                  background: `${alpha(getThemeColor(item?.stage), 0.15)}`,
                }}
              >
                {item?.stage?.charAt(0)}
              </div>
              {stage.toLowerCase() === "bound" ? (
                <ShowSignatures signatures={item} />
              ) : (
                <></>
              )}
            </div>
            <div className="info-wrapper">
              <div className="info">
                <Tooltip title={`${item?.insured_organization?.name}`}>
                  <h3 className="title">{item?.insured_organization?.name}</h3>
                </Tooltip>
                <Tooltip title={getPremium(item)}>
                  <p className="detail">{getPremium(item)}</p>
                </Tooltip>
              </div>
              <div className="date-wrapper">
                <Tooltip title="Effective Date">
                  <span className="date">{item?.effective_date}</span>
                </Tooltip>
                <Tooltip title="Expiration Date">
                  <span className="date">{item.expiration_date}</span>
                </Tooltip>
              </div>
            </div>
          </div>
        ))}
        {loading ? (
          <Skeleton wrapper={LoadingApplicationItem} count={3} />
        ) : (
          <>
            {applicationsCount > applicationData?.length ? (
              <div className={classes.loadMore}>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  onClick={() => setLoadMore(applicationData.length)}
                >
                  Load More
                </Button>
              </div>
            ) : (
              <></>
            )}
          </>
        )}
      </div>
    </div>
  );
});

const Filters: React.FunctionComponent<any> = props => {
  const { search, refetch, applicationType, userId } = props;

  const [filters, setFilters] = useState([]);
  const [sort, setSort] = useState({});
  ///@ts-ignore

  const setOrderBy = (orderType: any) => {
    //@ts-ignore
    if (sort.key === orderType) {
      //@ts-ignore
      return sort.orderBy === "Desc" ? Order_By.Desc : Order_By.Asc;
    } else {
      return undefined;
    }
  };

  const setFilterBy = () => {
    if (filters?.length > 0) {
      //@ts-ignore
      const type = filters[0]?.type;

      return [
        {
          [type]: {
            //@ts-ignore
            _gte: filters[0]?.fromDate,
          },
        },
        {
          [type]: {
            //@ts-ignore
            _lte: filters[0]?.toDate ? filters[0]?.toDate : undefined,
            //_lte: filters[0]?.toDate,
          },
        },
      ];
    } else {
      return undefined;
    }
  };

  useEffect(() => {
    refetch({
      applicationWhere: {
        stage: { _eq: applicationType },
        _and: setFilterBy(),

        _or: [
          {
            domain: { _ilike: search }
          },
          {
            insured_organization: {
              name: { _ilike: search },
            }
          }
        ],

        created_by_user_id: {
          _eq: userId,
        },
      },
      order_by: {
        created_at:
          Object.keys(sort).length !== 0
            ? setOrderBy("created_at")
            : Order_By.Desc,
        updated_at: setOrderBy("updated_at"),

        effective_date: setOrderBy("effective_date"),
        insured_organization: {
          name: setOrderBy("name"),
        },
      },
      limit: page_size,
    });
  }, [filters, sort, search, refetch]);

  return (
    <>
      <div className="filters-wrapper new-layout">
        <div className="item">
          <SortComponent
            active={defaultSort}
            options={SortOptions}
            setSorted={(v: any) => {
              setSort(v);
            }}
          />
        </div>
        <div className="item">
          <FilterComponent
            type={ApplicationsNew}
            options={FilterOptions}
            setFiltered={(v: any) => {
              setFilters(v);
            }}
          />
        </div>
      </div>
    </>
  );
};

const SidbarHeader = (props: any) => {
  const { setSearch, setStage } = props;
  const form = useForm();
  const classes = useStyles();
  const [currentStage, setCurrentStage] = useState("All");
  const [searchValue, setSearchValue] = useState("");

  const { handleSubmit } = form;

  const handleFormSubmit = async (data: any) => {
    setSearchValue(data.search);
    setSearch(data.search);
  };
  const setClearSearch = () => {
    form.reset();
    setSearch("");
  };

  const selectStageOnlick = (stage: string) => {
    setCurrentStage(stage);
    setStage(stage);
  };
  return (
    <div className="sidebar-header">
      <ul className="application-stage-filter">
        <li
          className={currentStage === "All" ? "active" : ""}
          onClick={() => selectStageOnlick("All")}
        >
          <button className={classes.primaryBgColor}>All</button>
        </li>
        {applicationStages.map(stage => (
          <li
            key={stage.id}
            className={currentStage === stage.name ? "active" : ""}
          >
            <button
              className={classes.primaryBgColor}
              onClick={() => selectStageOnlick(stage.name)}
            >
              {stage.name}
            </button>
          </li>
        ))}
      </ul>
      <div className="application-search">
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="application-search-block flex">
              <div>
                <InputField name="search" className="search-field" />
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
                ></Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

function ShowSignatures(props: any) {
  const { signatures } = props;
  const classes = useStyles();

  const getMissingSignatures = () => {
    const agentSigned =
      signatures?.insurance_quote_selection?.insurance_policy?.agent_signed ||
      null;
    const insuredSigned =
      signatures?.insurance_quote_selection?.insurance_policy?.insured_signed ||
      null;
    const paymentCollected =
      signatures?.insurance_quote_selection?.insurance_policy
        ?.payment_collected || null;

    return !agentSigned
      ? "Agent signature missing"
      : !insuredSigned
      ? "Insured signature missing"
      : !paymentCollected
      ? "Payment not collected"
      : "";
  };

  if (signatures?.insurance_quote_selection?.insurance_policy) {
    return (
      getMissingSignatures && (
        <SignatureIcon tooltipText={getMissingSignatures()} />
      )
    );
  } else {
    return (
      <Tooltip title="Bind signatures missing">
        <div className="signature-icon">
          <ErrorIcon className={classes.signatureIndicator} />
        </div>
      </Tooltip>
    );
  }
}

function SignatureIcon(props: any) {
  const { tooltipText } = props;

  switch (tooltipText) {
    case "Agent signature missing":
      return (
        <Tooltip title="Agent signature missing">
          <div className="signature-icon">
            <AgentUnSignedIcon />
          </div>
        </Tooltip>
      );
    case "Insured signature missing":
      return (
        <Tooltip title="Insured signature missing">
          <div className="signature-icon">
            <InsuredUnSignedIcon />
          </div>
        </Tooltip>
      );
    case "Payment not collected":
      return (
        <Tooltip title="Payment not collected">
          <div className="signature-icon">
            <PaymentNotCollectedIcon />
          </div>
        </Tooltip>
      );
    default:
      return <></>;
  }
}

function Sidebar() {
  const [searchValue, setsearchValue] = useState("");
  const [stage, setStage] = useState("All");
  const [toggle_sidebar, setToggle_sidebar] = useState(false);
  const classes = useStyles();
  const onSearch = React.useCallback(
    (v: string) => {
      setsearchValue(v);
    },
    [setsearchValue]
  );
  const onStageChange = React.useCallback(
    (v: string) => {
      setStage(v);
    },
    [setStage]
  );

  const params = useParams();

  //@ts-ignore
  const paramId = params.id ? params.id : undefined;

  const onToggleSidebar = React.useCallback(() => {
    toggle_sidebar ? setToggle_sidebar(false) : setToggle_sidebar(true);
  }, [toggle_sidebar]);
  return (
    <div className={`sidebar ${toggle_sidebar ? "active" : ""}`}>
      <div
        className={`sidebar-handle ${classes.sidebarHandle}`}
        onClick={onToggleSidebar}
      >
        {toggle_sidebar ? <CloseIcon /> : <MenuIcon />}
      </div>
      <SidbarHeader setSearch={onSearch} setStage={onStageChange} />
      <div className="sidebar-item-list">
        <ApplicationListItem
          applicationType="Quote"
          filterOptions={FilterOptions}
          sortOptions={SortOptions}
          searchValue={searchValue}
          stage={stage}
          paramId={paramId}
          //userId={props.userId}
        />
      </div>
    </div>
  );
}
