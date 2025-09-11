import React, { useState } from "react";
import { Badge, Button, CircularProgress, FormControlLabel, Grid, Switch as SwitchBtn } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import InputField from "components/From/InputField";
import EditIcon from "@mui/icons-material/Edit";
import LaunchIcon from "@mui/icons-material/Launch";
import {
  Order_By,
  useGetBrokerAgenciesQuery,
  useGetBrokerAgencyOneQuery,
  GetBrokerAgenciesQuery,
  GetBrokerAgencyOneQuery,
  Broker_Agency_Insert_Input,
  useCreateUpdateBrokerMutation,
  Broker_Agency,
} from "generated/graphql";
import SelectForm from "../From/Select/index";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import ButtonsContainer from "components/Layout/ButtonsContainer";
import ButtonLoading from "components/From/ButtonLoading";
import ToastMessage from "components/Toast/ToastMessage";
import { useNavigate, useParams } from "react-router-dom";
import MaterialTable, { Query } from "material-table";
import { DateTime } from "luxon";
import ModalWindow from "components/ModalWindow";
import { Contries, PaymentOptions, States } from "components/InsuredApplicationDetails/Consts";
import CustomTableSearch from "components/Search/CustomTableSearch";
import { direction } from "utils";
import { tableIcons } from "utils/MaterialTableIcons";
import ErrorToast from "components/Toast/ErrorToast";
import Skeleton from "react-loading-skeleton";
import GridItem from "components/Layout/GridItem";

const useStyles = makeStyles((theme: Theme) => ({
  searchBtn: {
    marginLeft: 10,
    boxShadow: `0px 5px 10px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

export default function BrokerList() {
  return <BrokersList />;
}

const agenciesTableColumns: Array<any> = [
  {
    title: "ID",
    field: "id",
    hidden: true,
  },
  {
    title: "Name",
    field: "name",
  },
  {
    title: "Address",
    field: "address",
  },
  {
    title: "Created On",
    field: "created_at",
  },
  {
    title: "Payment Option",
    field: "payment_option",
    render: (rowData: Broker_Agency) => {
      switch (rowData.payment_option) {
        case "insured_paid":
          return "Insured Paid";
        case "agent_paid":
          return "Agent Paid";
        default:
          return "";
      }
    }
  },
  {
    title: "Producers",
    field: "broker_producers_aggregate.aggregate.count",
  },
];

const tableSearchOptions = [
  {
    id: 0,
    label: "Name",
    key: "name",
  },
];

const DEFAULT_PAGE_SIZE = 5;

const BrokersList: React.FunctionComponent<any> = props => {
  const classes = useStyles();
  const params = useParams<string>();
  const navigate = useNavigate();
  const tableRef = React.createRef();
  //@ts-ignore
  const getTenantId: number = Number(params.tenant_id);
  const [showAgencyModal, setShowAgencyModal] = useState<
    string | boolean | null
  >(null);

  const [searchValue, setSearchValue] = useState(null);
  const [rowsPerPage, setRowsPerPage] =
    React.useState<number>(DEFAULT_PAGE_SIZE);

  if (getTenantId === undefined) {
    navigate("/tenants/");
  }

  const { data, loading, error, refetch } = useGetBrokerAgenciesQuery({
    variables: {
      id: getTenantId,
      limit: DEFAULT_PAGE_SIZE,
      name: "%",
      order_by: {
        created_at: Order_By.Desc,
      },
    },
    skip: true, //intentional - skipping query invoking in intial load, refetch handle the data loading
  });

  if (loading) {
    return <>Loading...</>;
  }

  const remoteData = async (query: Query<any>) => {
    //@ts-ignore
    if (query.search !== "" && query.test) {
      query.page = 0;
      //@ts-ignore
      delete query.test;
    }

    const brokerTableData = await refetch({
      limit: query.pageSize,
      offset: query.page * query.pageSize,
      name: query.search ? `%${query.search}%` : "%",
    });

    return Promise.resolve({
      //@ts-ignore
      data:
        brokerTableData.data?.tenant_by_pk?.broker_agencies.map((m: any) => {
          const { created_at, ...rest } = m;
          return {
            created_at: DateTime.fromISO(m.created_at).toFormat("dd LLL yyyy"),
            ...rest,
          };
        }) || [],
      page: query.page,
      //@ts-ignore
      totalCount:
        brokerTableData.data?.tenant_by_pk?.broker_agencies_aggregate.aggregate
          ?.count || 0,
    });
  };

  const changeOrder = async (
    column: number,
    orderDirection: "asc" | "desc"
  ) => {
    if (orderDirection) {
      const fetchData = await refetch({
        order_by: {
          name: column === 1 ? direction[orderDirection] : undefined,
          address: column === 2 ? direction[orderDirection] : undefined,
          created_at: column === 3 ? direction[orderDirection] : undefined,
          broker_producers_aggregate: {
            count: column === 4 ? direction[orderDirection] : undefined,
          },
        },
      });
      //@ts-ignore
      tableRef.current && tableRef.current.onQueryChange();
    }
  };

  return (
    <div className="tenant-details-wrapper" id="1">
      <div className="tenant-card">
        <div className="tenant-detail-header">
          <h3>Broker Agencies</h3>
          <div>
            <Button
              variant="contained"
              color="primary"
              className={classes.searchBtn}
              startIcon={<AddIcon />}
              onClick={() => setShowAgencyModal(true)}
            >
              Add New Broker Agency
            </Button>
          </div>
        </div>
        <div className="tenant-form-wrapper">
          <div className="table-style">
            <MaterialTable
              icons={tableIcons}
              title=""
              columns={agenciesTableColumns}
              data={remoteData}
              tableRef={tableRef}
              isLoading={loading}
              page={rowsPerPage}
              onChangeRowsPerPage={setRowsPerPage}
              onOrderChange={changeOrder}
              options={{
                search: false,
                pageSize: DEFAULT_PAGE_SIZE,
                pageSizeOptions: [5, 10, 25, 50],
                addRowPosition: "first",
                emptyRowsWhenPaging: false,
                actionsCellStyle: { textAlign: "center" },
                actionsColumnIndex: -1,
                loadingType: "overlay",
                sorting: false,
              }}
              actions={[
                rowData => ({
                  icon: () => {
                    return (
                      <>
                        <Badge color="secondary">
                          <EditIcon fontSize="small" />
                        </Badge>
                      </>
                    );
                  },
                  tooltip: "Edit Agency",
                  onClick: (event, rowData) => {
                    //@ts-ignore
                    setShowAgencyModal(rowData.id);
                  },
                }),
                rowData => ({
                  icon: () => {
                    return (
                      <>
                        <Badge color="primary">
                          <LaunchIcon fontSize="small" />
                        </Badge>
                      </>
                    );
                  },
                  tooltip: "View Producers",
                  onClick: (event, rowData) => {
                    //@ts-ignore
                    navigate(
                      `/tenants/${getTenantId}/brokers/${getTenantId}/broker-producers/${rowData.id}`
                    );
                  },
                }),
              ]}
              components={{
                Toolbar: props => {
                  return (
                    <>
                      <CustomTableSearch
                        tableSearchOptions={tableSearchOptions}
                        searchValue={searchValue}
                        setSearchValue={(search: any, column: any) => {
                          setSearchValue(previousSearch => {
                            tableRef.current &&
                              //@ts-ignore
                              tableRef.current.onQueryChange({
                                test: 1,
                                search: search,
                                column: column,
                              });
                            return search;
                          });
                        }}
                      />
                    </>
                  );
                },
              }}
            />
          </div>

          {showAgencyModal && (
            <ModalWindow
              showModal={
                showAgencyModal || showAgencyModal !== null ? true : false
              }
              setShowModal={() => setShowAgencyModal(false)}
              title={
                showAgencyModal === true
                  ? "Add New Broker Agency"
                  : "Update Broker Agency"
              }
              size="sm"
            >
              <BrokerAgencyFormWrapper
                brokerAgencyId={showAgencyModal}
                tenantId={getTenantId}
                setFormClose={() => setShowAgencyModal(false)}
                tableRef={tableRef}
              />
            </ModalWindow>
          )}
          <ErrorToast
            error={error}
            processCustomError={() =>
              `Unable to Load Broker Data - ${error?.message}`
            }
          />
        </div>
      </div>
    </div>
  );
};

const brokerAgencyFormSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  state: yup.string().required("State is required").nullable(),
  zip: yup.string().required("Zip is required"),
  address: yup.string().required("Address is required"),
  city: yup.string().required("City is required"),
  country: yup.string().required("Country is required"),
  payment_option: yup.string().required("Payment option is required"),
  commission_rate: yup.number().min(0, "Commission rate must be above 0").max(100, "Commission rate must be below 100"),
  broker_program_id: yup
    .string()
    .required("Broker program ID is required")
    .matches(/^[0-9]{3}[-][A-z]{2}$/g, "Invalid broker program ID"),
  calculate_tax: yup.boolean().default(false),
  calculate_fee: yup.boolean().default(false),
});

interface BrokerAgencyFormProps {
  setFormClose?: any;
  tenantId: number;
  brokerAgencyId?: any;
  data?: GetBrokerAgencyOneQuery;
  tableRef?: any;
  loading?: boolean;
}

export function withExtraInfo<P>(
  WrappedComponent: React.ComponentType<P & BrokerAgencyFormProps>
) {
  const ComponentWithExtraInfo = (props: any) => {
    const { data, loading } = useGetBrokerAgencyOneQuery({
      variables: {
        id: props.brokerAgencyId ? props.brokerAgencyId : null,
      },
      fetchPolicy: "network-only",
    });
    return (
      <WrappedComponent
        {...props}
        key={`broker-agency-${props.brokerAgencyId}-${loading}`}
        loading={loading}
        data={data}
      />
    );
  };
  return ComponentWithExtraInfo;
}

function BrokerAgencyFormWrapper(props: BrokerAgencyFormProps) {
  const Component =
    props.brokerAgencyId !== true
      ? withExtraInfo(BrokerAgencyForm)
      : BrokerAgencyForm;

  return <Component {...props} />;
}

const BrokerAgencyForm: React.FunctionComponent<BrokerAgencyFormProps> = ({
  setFormClose,
  tenantId,
  brokerAgencyId,
  data,
  tableRef,
  loading,
}) => {
  const [showMessage, setShowMessage] = useState(false);

  const getAgencyQueryResult = data?.broker_agency[0];

  const form = useForm({
    resolver: yupResolver(brokerAgencyFormSchema),
    defaultValues: {
      ...getAgencyQueryResult,
    },
  });

  const [
    BrokerAgencyMutation,
    { loading: agencyMutationLoading, error: agencyMutationError },
  ] = useCreateUpdateBrokerMutation({
    errorPolicy: "all",
  });

  const { handleSubmit } = form;

  const handleFormSubmit = async (formData: Broker_Agency_Insert_Input) => {
    const { id, ...rest } = formData;

    const { errors } = await BrokerAgencyMutation({
      variables: {
        objects:
          brokerAgencyId !== true
            ? //@ts-ignore
            { id: brokerAgencyId, tenant_id: tenantId, ...rest }
            : { tenant_id: tenantId, ...rest },
      },
      refetchQueries: ["getBrokerAgencies"],
    });
    if (errors) {
      console.log(errors[0].message);
    } else {
      tableRef.current && tableRef.current.onQueryChange();
      setShowMessage(true);
    }
  };

  const formClose = async () => {
    await setFormClose(true);
  };

  const messageContent =
    brokerAgencyId !== true
      ? "Broker agency successfully updated"
      : "New agency successfully created";
  return (
    <>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <GridItem>
                {loading ? (
                  <Skeleton height={40} />
                ) : (
                  <InputField name="name" label="Agency Name" />
                )}
              </GridItem>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <GridItem>
                {loading ? (
                  <Skeleton height={40} />
                ) : (
                  <InputField name="address" label="Address" />
                )}
              </GridItem>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <GridItem>
                {loading ? (
                  <Skeleton height={40} />
                ) : (
                  <InputField name="city" label="City" />
                )}
              </GridItem>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <GridItem>
                {loading ? (
                  <Skeleton height={40} />
                ) : (
                  <SelectForm
                    name="country"
                    label="Country"
                    options={
                      Contries.map(ctry => ({
                        value: ctry,
                        label: ctry,
                      })).sort() || []
                    }
                  />
                )}
              </GridItem>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <GridItem>
                {loading ? (
                  <Skeleton height={40} />
                ) : (
                  <SelectForm
                    name="state"
                    label="State"
                    options={
                      States.map(st => ({ value: st, label: st })).sort() || []
                    }
                  />
                )}
              </GridItem>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <GridItem>
                {loading ? (
                  <Skeleton height={40} />
                ) : (
                  <InputField name="zip" label="Zip" />
                )}
              </GridItem>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <GridItem>
                {loading ? (
                  <Skeleton height={40} />
                ) : (
                  <InputField
                    name="broker_program_id"
                    label="Broker Program ID"
                  />
                )}
              </GridItem>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <GridItem>
                {loading ? (
                  <Skeleton height={40} />
                ) : (
                  <SelectForm
                    name="payment_option"
                    label="Payment Option"
                    options={
                      PaymentOptions.map(opt => ({
                        value: opt.value,
                        label: opt.label,
                      })).sort() || []
                    }
                  />
                )}
              </GridItem>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <GridItem>
                {loading ? (
                  <Skeleton height={40} />
                ) : (
                  <InputField
                    name="quote_template_id"
                    label="Quote Template URL"
                  />
                )}
              </GridItem>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <GridItem>
                {loading ? (
                  <Skeleton height={40} />
                ) : (
                  <InputField
                    name="commission_rate"
                    label="Commission Rate"
                    type="number"
                    defaultValue={"0"}
                    inputProps={{
                      step: 0.01
                    }}
                    min={0.0}
                    max={100.0}
                  />
                )}
              </GridItem>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <GridItem>
                {loading ? (
                  <Skeleton height={40} />
                ) : (
                  <FormControlLabel
                    control={
                      <>
                        <SwitchBtn
                          onChange={v => {
                            form.setValue("calculate_fee", v.target.checked);
                          }}
                          checked={
                            form.watch("calculate_fee") === undefined
                            ? Boolean(form.setValue("calculate_fee", true))
                            : Boolean(form.watch("calculate_fee"))
                          }
                          {...form.register("calculate_fee")}
                          name="calculate_fee"
                        />
                      </>
                    }
                    label="Calculate Fees"
                  />
                )}
              </GridItem>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <GridItem>
                {loading ? (
                  <Skeleton height={40} />
                ) : (
                  <FormControlLabel
                    control={
                      <>
                        <SwitchBtn
                          checked={
                            form.watch("calculate_tax") === undefined
                            ? Boolean(form.setValue("calculate_tax", false))
                            : Boolean(form.watch("calculate_tax"))
                          }
                          onChange={v => {
                            form.setValue("calculate_tax", v.target.checked);
                          }}
                          {...form.register("calculate_tax")}
                          name="calculate_tax"
                        />
                      </>
                    }
                    label="Calculate Taxes"
                  />
                )}
              </GridItem>
            </Grid>

          </Grid>
          <ButtonsContainer justifyContent="flex-end">
            <Button
              type="submit"
              color="primary"
              variant="contained"
              disabled={agencyMutationLoading}
              endIcon={<ButtonLoading loading={agencyMutationLoading} />}
            >
              {brokerAgencyId === true
                ? "Add Broker Agency"
                : "Update Broker Agency"}
            </Button>
          </ButtonsContainer>
        </form>
      </FormProvider>
      {showMessage && (
        <ToastMessage
          autoHide={true}
          hide={() => {
            setShowMessage(false);
            formClose();
          }}
          show={showMessage}
          type="success"
          outSideClickHide={true}
          message={`${messageContent}`}
        />
      )}
      <ErrorToast
        error={agencyMutationError}
        processCustomError={() =>
          `Unable Save Broker Agency - ${agencyMutationError?.message}`
        }
      />
    </>
  );
};

interface BrokersTableProps {
  tableData?: GetBrokerAgenciesQuery;
  tableRefetch?: any;
  tableLoading?: boolean;
  tenantId: number;
  tableRef?: any;
}

const BrokersTable: React.FunctionComponent<BrokersTableProps> = ({
  tableData,
  tableRefetch,
  tableLoading,
  tenantId,
  tableRef,
}) => {
  const navigate = useNavigate();
  const [showAgencyModal, setShowAgencyModal] = useState<number | boolean>(
    false
  );

  const [searchValue, setSearchValue] = useState(null);
  const [rowsPerPage, setRowsPerPage] =
    React.useState<number>(DEFAULT_PAGE_SIZE);

  const remoteData = async (query: Query<any>) => {
    //@ts-ignore
    if (query.search !== "" && query.test) {
      query.page = 0;
      //@ts-ignore
      delete query.test;
    }

    const brokerTableData = await tableRefetch({
      limit: query.pageSize,
      offset: query.page * query.pageSize,
      name: query.search ? `%${query.search}%` : "%",
    });

    return Promise.resolve({
      //@ts-ignore
      data:
        brokerTableData.data?.tenant_by_pk?.broker_agencies.map((m: any) => {
          const { created_at, ...rest } = m;
          return {
            created_at: DateTime.fromISO(m.created_at).toFormat("dd LLL yyyy"),
            ...rest,
          };
        }) || [],
      page: query.page,
      //@ts-ignore
      totalCount:
        brokerTableData.data?.tenant_by_pk?.broker_agencies_aggregate.aggregate
          ?.count || 0,
    });
  };

  const changeOrder = (column: number, orderDirection: "asc" | "desc") => {
    if (orderDirection) {
      const fetchData = tableRefetch({
        order_by: {
          name: column === 1 ? direction[orderDirection] : undefined,
          address: column === 2 ? direction[orderDirection] : undefined,
          created_at: column === 3 ? direction[orderDirection] : undefined,
          broker_producers_aggregate: {
            count: column === 4 ? direction[orderDirection] : undefined,
          },
        },
      });
      //@ts-ignore
      tableRef.current && tableRef.current.onQueryChange();
    }
  };

  return (
    <>
      <div className="table-style">
        <MaterialTable
          icons={tableIcons}
          title=""
          columns={agenciesTableColumns}
          data={remoteData}
          tableRef={tableRef}
          isLoading={tableLoading}
          page={rowsPerPage}
          onChangeRowsPerPage={setRowsPerPage}
          onOrderChange={changeOrder}
          options={{
            search: false,
            pageSize: DEFAULT_PAGE_SIZE,
            pageSizeOptions: [5, 10, 25, 50],
            addRowPosition: "first",
            emptyRowsWhenPaging: false,
            actionsCellStyle: { textAlign: "center" },
            actionsColumnIndex: -1,
            loadingType: "overlay",
            sorting: true,
          }}
          actions={[
            rowData => ({
              icon: () => {
                return (
                  <>
                    <Badge color="primary">
                      <LaunchIcon fontSize="small" />
                    </Badge>
                  </>
                );
              },
              tooltip: "View Producers",
              onClick: (event, rowData) => {
                //@ts-ignore
                navigate(
                  `/tenants/${tenantId}/brokers/${tenantId}/broker-producers/${rowData.id}`
                );
              },
            }),
            rowData => ({
              icon: () => {
                return (
                  <>
                    <Badge color="secondary">
                      <EditIcon fontSize="small" />
                    </Badge>
                  </>
                );
              },
              tooltip: "Edit Agency",
              onClick: (event, rowData) => {
                //@ts-ignore
                setShowAgencyModal(rowData.id);
              },
            }),
          ]}
          components={{
            Toolbar: props => {
              return (
                <>
                  <CustomTableSearch
                    tableSearchOptions={tableSearchOptions}
                    searchValue={searchValue}
                    setSearchValue={(search: any, column: any) => {
                      setSearchValue(previousSearch => {
                        tableRef.current &&
                          //@ts-ignore
                          tableRef.current.onQueryChange({
                            test: 1,
                            search: search,
                            column: column,
                          });
                        return search;
                      });
                    }}
                  />
                </>
              );
            },
          }}
        />
      </div>
      {showAgencyModal && (
        <ModalWindow
          showModal={showAgencyModal || showAgencyModal !== null ? true : false}
          setShowModal={() => setShowAgencyModal(false)}
          title="Update Broker Agency"
          size="sm"
        >
          <BrokerAgencyFormWrapper
            brokerAgencyId={showAgencyModal}
            tenantId={tenantId}
            setFormClose={() => setShowAgencyModal(false)}
            tableRef={tableRef}
          />
        </ModalWindow>
      )}
    </>
  );
};
