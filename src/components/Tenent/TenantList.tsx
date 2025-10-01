import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import { alpha } from "@mui/material/styles";
import { LoadingApplicationItem } from "components/ContentLoaders";
import theme from "theme/theme";
import { Order_By, useGetAllTenantsQuery } from "generated/graphql";

import ToastMessage from "components/Toast/ToastMessage";
import { Link, useLocation, useParams } from "react-router-dom";
import { DateTime } from "luxon";
import { SortComponent } from "components/Filters/Sort";
import { FilterComponent } from "components/Filters";
import ErrorToast from "components/Toast/ErrorToast";
import { TenantFilterComponent } from "components/Filters/TenantFilters";
const noLogo = "/assets/images/logo-not-available.svg";

const useStyles = makeStyles((theme: Theme) => ({
  applicationRow: {
    borderRadius: 4,
    backgroundColor: theme.palette.grey[100],
    padding: "8px",
    paddingBottom: "30px",
    height: "100%",
  },
  applicationItemsWrapper: {
    overflowY: "auto",
    height: "100%",
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
    "& a": {
      textDecoration: "none",
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
  applicationItemGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 3fr",
    padding: theme.spacing(3.5, 3.5, 3.5),
    gridColumnGap: "1rem",
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
    alignItems: "center",
    borderRadius: 4,
    padding: "0.75rem",
    backgroundColor: "#FFFFFF",
    boxShadow: `0px 2px 10px ${alpha(theme.palette.grey[900], 0.15)}`,
    margin: "0.5rem 0.5rem 1rem 0.5rem",
    transition: "all 0.5s",
    cursor: "pointer",
    "&:hover": {
      boxShadow: `0px 10px 25px ${alpha(theme.palette.grey[900], 0.2)}`,
    },
    "&.active": {
      boxShadow: `0px 10px 25px ${alpha(theme.palette.grey[900], 0.2)}`,
      border: `1px solid ${theme.palette.primary.main}`,
      "& h3": {
        color: theme.palette.primary.main,
      },
    },
  },
  applicationTitle: {
    fontSize: "1rem",
    color: "#333",
    margin: 0,
  },
  applicationPeriod: {
    fontSize: "0.8rem",
    fontWeight: 400,
    margin: 0,
    color: theme.palette.secondary.main,
  },
  applicationOptionalTxt: {
    color: "#333",
    fontSize: "0.8rem",
  },
  applicationTypeCircle: {
    width: 50,
    height: 50,
    borderRadius: "50%",
    marginRight: 10,
    padding: 4,
    background: theme.palette.grey[200],
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
    "& img": {
      maxWidth: "100%",
      height: "auto",
    },
  },
  loadMore: {
    textAlign: "center",
    "& button": {
      fontSize: "0.8rem",
    },
  },
}));

const FilterOptions = [
  {
    groupName: "Tenants Filter By",
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
];

const SortOptionsNew = [
  {
    groupName: "Tenants Sort By",
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
      },
      {
        optionName: "Tenant Name",
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
      },
    ],
  },
];

const defaultSort = { key: "created_at", orderBy: "Desc" };

export default function TenentList({ searchValue, Filters }: any) {
  return <TenantList applicationType="Quote" searchValue={searchValue} />;
}

interface TenantListProps {
  applicationType: string;
  searchValue: any;
}

const Dateformat = "yyyy-MM-dd";
const DateformatFilter = "MMM dd yy";
const page_size = 5;

const TenantList: React.FunctionComponent<TenantListProps> = props => {
  const { applicationType, searchValue } = props;

  const classes = useStyles();

  const { pathname } = useLocation();

  const [root, tenantURL, tenantID, ...rest] = pathname.split("/");

  const searchText = searchValue !== "" ? `%${searchValue}%` : "%";

  const { data, loading, error, refetch, fetchMore } = useGetAllTenantsQuery({
    variables: {
      order_by: {
        created_at: Order_By.Desc,
      },
      limit: page_size,
    },
    notifyOnNetworkStatusChange: true,
  });

  const setLoadMore = async () => {
    const { errors } = await fetchMore({
      variables: {
        offset: data?.tenant.length || 0,
      },
      //@ts-ignore
      updateQuery: (pv, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return pv;
        } else {
          return {
            tenant: [...pv.tenant, ...fetchMoreResult.tenant],
            tenant_aggregate: { ...fetchMoreResult.tenant_aggregate },
          };
        }
      },
    });
  };

  const tenants = data?.tenant || [];
  const tenantsCount = data?.tenant_aggregate.aggregate?.count || 0;

  return (
    <div className={classes.applicationRow}>
      <div className={classes.applicationRowHeader}>
        <div
          className={classes.gridChip}
          style={{
            color: `${theme.palette.grey[700]}`,
            background: `${theme.palette.grey[400]}`,
          }}
        >
          <div>
            <span>Tenants</span>
          </div>
          <div className={classes.count}>{tenantsCount}</div>
        </div>

        <Filters
          search={searchText}
          refetch={refetch}
          applicationType={applicationType.toLowerCase()}
        />
      </div>

      <div className={classes.applicationItemsWrapper}>
        {!loading && tenants?.length === 0 && (
          <h5 style={{ textAlign: "center" }}>No Tenants</h5>
        )}

        {tenants?.map(item => (
          <Link to={{ pathname: `/tenants/${item.id}` }} key={item.id}>
            <div
              className={`${classes.applicationItem} ${
                tenantID === item.id.toString() ? "active" : ""
              }`}
            >
              <div>
                <div className={classes.applicationTypeCircle}>
                  <img src={item.logo ? item.logo : noLogo} />
                </div>
              </div>

              <div>
                <h3 className={classes.applicationTitle}>{item.name}</h3>
                <h5 className={classes.applicationPeriod}>
                  {item.broker_agencies_aggregate.aggregate?.count} Broker
                  Agencies
                </h5>
              </div>
            </div>
          </Link>
        ))}

        {loading ? (
          <LoadingApplicationItem />
        ) : (
          <>
            {tenantsCount > tenants?.length ? (
              <div className={classes.loadMore}>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  onClick={setLoadMore}
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
      <ErrorToast
        error={error}
        processCustomError={() =>
          `Unable to Load Tenants Data - ${error?.message}`
        }
      />
    </div>
  );
};

const Filters: React.FunctionComponent<any> = props => {
  const { search, refetch, applicationType } = props;

  const [filters, setFilters] = useState([]);
  const [sort, setSort] = useState({});

  //@ts-ignore
  const filterByDate = filters?.key || null;

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
      where: {
        name: {
          _ilike: `%${search}%`,
        },
        _and: setFilterBy(),
      },
      order_by: {
        created_at:
          Object.keys(sort).length !== 0
            ? setOrderBy("created_at")
            : Order_By.Desc,
        updated_at: setOrderBy("updated_at"),
        name: setOrderBy("name"),
      },
    });
  }, [filters, sort, search]);

  return (
    <>
      <div className="filters-wrapper">
        <div className="item">
          <SortComponent
            active={defaultSort}
            options={SortOptionsNew}
            setSorted={(v: any) => {
              setSort(v);
            }}
          />
        </div>
        <div className="item">
          <TenantFilterComponent
            type="Tenants"
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
