import React, { useEffect, useState } from "react";
import { Button, Tooltip } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import { alpha } from "@mui/material/styles";
import {
  Order_By,
  useLatestInsuranceApplicationsQuery,
  useMeQuery,
} from "generated/graphql";
import ApplicationModal from "components/Application/ApplicationModal";
import InsuredApplicationDetails from "components/InsuredApplicationDetails";
import { Route, Switch, useRouteMatch, useHistory } from "react-router-dom";

import { ApplicationHeader } from "components/Application/ApplicationHeader";
import { SortComponent } from "components/Filters/Sort";
import { FilterComponent } from "components/Filters";
import FeatureFlag from "utils/FeatureFlag";
import { LoadingApplicationItem } from "components/ContentLoaders";
import Skeleton from "react-loading-skeleton";
import ErrorIcon from "@mui/icons-material/Error";
import {
  AgentUnSignedIcon,
  currencyFormatter,
  InsuredUnSignedIcon,
  PaymentNotCollectedIcon,
} from "utils";
import Footer from "components/Footer";
import WatchApplicationUpdate from "components/Application/WatchApplicationUpdate";

const useStyles = makeStyles((theme: Theme) => ({
  searchBtn: {
    marginLeft: 10,
    boxShadow: `0px 5px 10px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
  applicationRow: {
    borderRadius: 4,
    backgroundColor: theme.palette.grey[100],
    padding: "8px",
    paddingBottom: "30px",
    height: "100%",
  },
  applicationItemsWrapper: {
    overflowY: "auto",
    height: "calc(100vh - 350px)",
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
    marginBottom: "1.5rem",
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
}));

const ApplicationTheme = [
  { primary: "#326BFF" },
  { primary: "#FF8412" },
  { primary: "#FF4A4A" },
  { primary: "#26AA3B" },
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

interface ApplicationKanBanLayoutProps {
  searchValue?: any;
  userId?: any;
}

function ApplicationKanBanLayout(props: ApplicationKanBanLayoutProps) {
  return (
    <div className="container">
      <div className="applications-grid">
        <div className="grid-item">
          <ApplicationListItem
            themeColor={ApplicationTheme?.[0]}
            applicationType="Quote"
            filterOptions={FilterOptions}
            sortOptions={SortOptions}
            searchValue={props.searchValue}
            userId={props.userId}
          />
        </div>
        <div className="grid-item">
          <ApplicationListItem
            themeColor={ApplicationTheme?.[1]}
            applicationType="Bound"
            filterOptions={FilterOptions}
            sortOptions={SortOptions}
            searchValue={props.searchValue}
            userId={props.userId}
          />
        </div>
        <div className="grid-item">
          <ApplicationListItem
            themeColor={ApplicationTheme?.[2]}
            applicationType="Declined"
            filterOptions={FilterOptions}
            sortOptions={SortOptions}
            searchValue={props.searchValue}
            userId={props.userId}
          />
        </div>
        <div className="grid-item">
          <ApplicationListItem
            themeColor={ApplicationTheme?.[3]}
            applicationType="Issued"
            filterOptions={FilterOptions}
            sortOptions={SortOptions}
            searchValue={props.searchValue}
            userId={props.userId}
          />
        </div>
      </div>
    </div>
  );
}

const MemoizedApplicationKanBanLayout = React.memo(ApplicationKanBanLayout);

export default function Applications() {
  const [searchValue, setsearchValue] = useState("");
  const [filterMyApplication, setFilterMyApplication] =
    useState("all-applications");

  const history = useHistory();

  const { data: meData, loading: meLoading } = useMeQuery();

  const userId =
    filterMyApplication === "my-applications"
      ? meData?.me[0].auth0_id
      : undefined;

  const onClose = React.useCallback(() => {
    history.push("/applications");
  }, [history]);

  const { path } = useRouteMatch();

  const onSearch = React.useCallback(
    (v: string) => {
      setsearchValue(v);
    },
    [setsearchValue]
  );

  const onFilter = React.useCallback(
    (v: any) => {
      setFilterMyApplication(v);
    },
    [setFilterMyApplication]
  );

  const onCreate = React.useCallback(() => {
    history.push("/applications/create");
  }, [history]);

  if (meLoading) {
    return null;
  }

  return (
    <div className="main">
      <FeatureFlag
        roles={["broker"]}
        fallbackRender={() => (
          <MemorizedApplicationHeader
            title="Applications"
            setSearchValue={onSearch}
          />
        )}
      >
        <MemorizedApplicationHeader
          buttonText="Create Application"
          setButtonClick={onCreate}
          title="Applications"
          setSearchValue={onSearch}
          filterMyApplication={filterMyApplication}
          setFilterMyApplication={onFilter}
        />
      </FeatureFlag>

      <MemoizedApplicationKanBanLayout
        userId={userId}
        searchValue={searchValue}
      />

      <Switch>
        <Route exact path={`${path}/create`}>
          <ApplicationModal
            showModal={true}
            setShowModal={onClose}
            title="Create an Application"
          >
            <MemorizedApplicationDetails />
          </ApplicationModal>
        </Route>
        <Route exact path={`${path}/:id`}>
          <ApplicationModal showModal={true} setShowModal={onClose}>
            <MemorizedApplicationDetails />
          </ApplicationModal>
        </Route>
      </Switch>
      <WatchApplicationUpdate />
      <Footer />
    </div>
  );
}

const MemorizedApplicationHeader = React.memo(ApplicationHeader);
const MemorizedApplicationDetails = React.memo(InsuredApplicationDetails);

interface ApplicationListItemProps {
  themeColor: any;
  applicationType: string;
  filterOptions: {};
  sortOptions: {};
  searchValue: any;
  userId?: any;
}

const page_size = 10;

const ApplicationListItem: React.FunctionComponent<ApplicationListItemProps> =
  props => {
    const { applicationType, themeColor, searchValue, userId } = props;

    const classes = useStyles();

    const history = useHistory();

    const searchText = searchValue !== "" ? `%${searchValue}%` : "%";

    const { data, loading, refetch, fetchMore } =
      useLatestInsuranceApplicationsQuery({
        variables: {
          applicationWhere: {
            stage: {
              _eq: applicationType.toLowerCase(),
            },
            created_by_user_id: {
              _eq: userId,
            },
          },
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
          <div
            className={classes.gridChip}
            style={{
              color: `${themeColor.primary}`,
              background: `${alpha(themeColor.primary, 0.15)}`,
            }}
          >
            <div>
              <span>{applicationType}</span>
            </div>
            <div className={classes.count}>{applicationsCount}</div>
          </div>

          <Filters
            search={searchText}
            userId={userId}
            refetch={refetch}
            applicationType={applicationType.toLowerCase()}
          />
        </div>

        <div className={classes.applicationItemsWrapper}>
          {!loading && applicationData?.length === 0 && (
            <h5 style={{ textAlign: "center" }}>No Applications</h5>
          )}
          {applicationData?.map(item => (
            <div
              className="application-item"
              key={item.id}
              onClick={() => {
                history.push(`/applications/${item?.id}`);
              }}
            >
              <div className="circle-wrapper">
                <div
                  className="circle"
                  style={{
                    color: `${themeColor.primary}`,
                    background: `${alpha(themeColor.primary, 0.15)}`,
                  }}
                >
                  {applicationType.charAt(0)}
                </div>
                {applicationType.toLowerCase() === "bound" ? (
                  <ShowSignatures signatures={item} />
                ) : (
                  <></>
                )}
              </div>
              <div className="info-wrapper">
                <div className="info">
                  <Tooltip title={`${item?.insured_organization?.name}`}>
                    <h3 className="title">
                      {item?.insured_organization?.name}
                    </h3>
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
  };

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
      <div className="filters-wrapper">
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
            type={Applications}
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
