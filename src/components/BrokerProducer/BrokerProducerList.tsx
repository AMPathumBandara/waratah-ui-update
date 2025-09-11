import React, { useState } from "react";
import { Badge, Button, Grid } from "@mui/material";
import { alpha } from "@mui/material/styles";
import Tooltip from '@mui/material/Tooltip';
import AddIcon from "@mui/icons-material/Add";
import BlockIcon from '@mui/icons-material/Block';
import InputField from "components/From/InputField";
import EditIcon from "@mui/icons-material/Edit";
import LockResetIcon from '@mui/icons-material/LockOpen';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Theme } from "@mui/material/styles";
import { makeStyles, withStyles } from "@mui/styles";
import {
  Order_By,
  GetBrokerAgencyOneQuery,
  useGetBrokerProducerListQuery,
  GetBrokerProducerListQuery,
  useGetBrokerProducerQuery,
  useCreateBrokerProducerMutation,
  CreateBrokerProducerMutationVariables,
  CreateBrokerUserInput,
  GetBrokerProducerQuery,
  useBrokerProducerUpdateMutation,
  useResetPasswordMutation,
  useUpdateUserStatusMutation,
  User,
  User_Status_Enum
} from "generated/graphql";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import ButtonsContainer from "components/Layout/ButtonsContainer";
import ButtonLoading from "components/From/ButtonLoading";
import ToastMessage from "components/Toast/ToastMessage";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import MaterialTable, { Query } from "material-table";
import { DateTime } from "luxon";
import ModalWindow from "components/ModalWindow";
import CustomTableSearch from "components/Search/CustomTableSearch";
import { tableIcons } from "utils/MaterialTableIcons";
import ErrorToast from "components/Toast/ErrorToast";
import DeleteIcon from "@mui/icons-material/Delete";
import { direction } from "utils";
import Skeleton from "react-loading-skeleton";
import GridItem from "components/Layout/GridItem";

const useStyles = makeStyles((theme: Theme) => ({
  searchBtn: {
    marginLeft: 10,
    boxShadow: `0px 5px 10px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

export default function BrokerProducerList() {
  return <BrokerProducersList />;
}

const producerTableColumns: Array<any> = [
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
    title: "Email",
    field: "email",
  },
  {
    title: "Commission Rate (%)",
    field: "commission_rate",
  },
  {
    title: "Created On",
    field: "created_at",
  },
  {
    title: "Status",
    field: "cognito_status",
    render: (rowData: User) => {
      switch (rowData.cognito_status) {
        case "ENABLED":
          return <Badge color="primary">Enabled</Badge>;
        case "DISABLED":
          return <Badge color="secondary">Disabled</Badge>;
        case "FORCE_CHANGE_PASSWORD":
          return <Badge color="secondary">New User</Badge>;
        default:
          return <Badge color="error">{rowData.cognito_status}</Badge>;
      }
    }
  },
];

const tableSearchOptions = [
  {
    id: 0,
    label: "Name",
    key: "name",
  },
];

const HtmlTooltip = withStyles((theme) => ({
  tooltip: {
    // backgroundColor: '#f5f5f9',
    // color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    // fontSize: theme.typography.pxToRem(12),
    // border: '1px solid #dadde9',
  },
}))(Tooltip);

const DEFAULT_PAGE_SIZE = 5;

const BrokerProducersList: React.FunctionComponent<any> = props => {
  const classes = useStyles();

  const params = useParams<string>();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const tableRef = React.useRef(null);
  const [showStatusUpdateConfirmModal, setShowStatusUpdateConfirmModal] = useState<
    string | boolean | null
  >(false);
  const [showResetPasswordConfirmModal, setShowResetPasswordConfirmModal] = useState<
    string | boolean | null
  >(false);

  const [brokerProducer, setBrokerProducer] = useState<any>(null);

  //@ts-ignore
  const brokerAgencyId: number = params.producer_id;

  if (brokerAgencyId === undefined) {
    navigate("/tenants/");
  }

  const [showProducerModal, setShowProducerModal] = useState<
    string | boolean | null
  >(null);

  const { data, loading, error, refetch } = useGetBrokerProducerListQuery({
    variables: {
      broker_agency_id: brokerAgencyId,
      limit: DEFAULT_PAGE_SIZE,
      name: "%",
      order_by: {
        user: {
          created_at: Order_By.Desc,
        },
      },
    },
    skip: true, //intentional - skipping query invoking in intial load, refetch handle the data loading
  });

  const [ResetPassword, { loading: resetPasswordLoading, data: resetPasswordData, error: resetPasswordError }] =
    useResetPasswordMutation({
      errorPolicy: "all",
    });

  const [UserStatusUpdate, { loading: userStatusLoading, data: userStatusData, error: userStatusError }] =
    useUpdateUserStatusMutation({
      errorPolicy: "all",
    });

  const [searchValue, setSearchValue] = useState(null);
  const [rowsPerPage, setRowsPerPage] =
    React.useState<number>(DEFAULT_PAGE_SIZE);
  const [showToastMessage, setToastMessage] = useState<{ show?: boolean, message?: string, type?: 'error' | 'success' }>({});
  const [resetPasswordId, setResetPasswordId] = useState<number | null>(null);
  const [statusUpdateId, setStatusUpdateId] = useState<number | null>(null);

  const remoteData = async (query: Query<any>) => {
    //@ts-ignore
    if (query.search !== "" && query.test) {
      query.page = 0;
      //@ts-ignore
      delete query.test;
    }

    const tableRefetchData = await refetch({
      //broker_agency_id: brokerAgencyId,
      limit: query.pageSize,
      offset: query.page * query.pageSize,
      name: query.search ? `%${query.search}%` : "%",
    });

    const tableReftchResult = tableRefetchData.data?.broker_producer.map(
      (f: any) => {
        return { ...f.user, "commission_rate": f.commission_rate }
      }
    );

    return Promise.resolve({
      data:
        tableReftchResult?.map((m: any) => {
          const { created_at, ...rest } = m;
          return {
            created_at: DateTime.fromISO(m.created_at).toFormat("dd LLL yyyy"),
            ...rest,
          };
        }) || [],
      page: query.page,
      totalCount:
        tableRefetchData?.data?.broker_producer_aggregate.aggregate?.count || 0,
    });
  };
  const changeOrder = async (
    column: number,
    orderDirection: "asc" | "desc"
  ) => {
    if (orderDirection) {
      await refetch({
        order_by: {
          user: {
            name: column === 1 ? direction[orderDirection] : undefined,
            email: column === 2 ? direction[orderDirection] : undefined,
            created_at: column === 3 ? direction[orderDirection] : undefined,
          },
        },
      });
      //@ts-ignore
      tableRef.current && tableRef.current.onQueryChange();
    }
  };

  const handleResetPassword = async () => {
    setResetPasswordId(brokerProducer?.id);
    const { errors } = await ResetPassword({
      variables: {
        email: brokerProducer?.email ?? "",
        userAuthId: brokerProducer?.auth0_id || "",
      },
      refetchQueries: ["getBrokerProducerList"],
    });
    if (errors) {
      setToastMessage({
        message: 'Reset Password Failed',
        type: 'error',
        show: true,
      });
      setResetPasswordId(null);
    } else {
      console.log('password reset', tableRef.current);
      (tableRef.current as any) && (tableRef.current as any).onQueryChange();
      setToastMessage({
        message: 'Password reset successfully',
        type: 'success',
        show: true,
      });
      setResetPasswordId(null);
    }
    setBrokerProducer(null);
    setShowResetPasswordConfirmModal(false);
  }

  interface BrokerProducerStatusUpdateBodyProps {
    setModalClose?: any;
    name: any;
    email: any;
    brokerProducerId: any;
    cognitoStatus: any;
    loading?: boolean;
  }

  const BrokerProducerStatusUpdateBody: React.FunctionComponent<BrokerProducerStatusUpdateBodyProps> = ({
    setModalClose,
    brokerProducerId,
    name,
    email,
    cognitoStatus,
    loading
  }) => {
    const status = cognitoStatus === "DISABLED" ? "Enable" : "Disable";

    return (
      <>
        {status} user named <b>"{name}"</b> with the email address <b>"{email}"</b> ?`

        <ButtonsContainer justifyContent="flex-end">
          <Grid>
            <GridItem>
              <Button
                color="primary"
                variant="contained"
                disabled={loading}
                style={{ marginRight: '5px' }}
                onClick={() => handleStatusUpdate()}
              >
                Yes
              </Button>
            </GridItem>
          </Grid>
          <Grid>
            <GridItem>
              <Button
                color="secondary"
                variant="contained"
                disabled={loading}
                onClick={() => {
                  setBrokerProducer(null);
                  setShowStatusUpdateConfirmModal(false);
                }}
              >
                No
              </Button>
            </GridItem>
          </Grid>
        </ButtonsContainer>
      </>
    );
  }

  const confirmUserStatusUpdate = async (event: React.MouseEvent, rowData: User) => {
    setShowStatusUpdateConfirmModal(true);
    setBrokerProducer(rowData);
  }

  const handleStatusUpdate = async () => {
    setStatusUpdateId(brokerProducer?.id);
    const status = brokerProducer?.cognito_status === "ENABLED" ? "DISABLED" as User_Status_Enum : "ENABLED" as User_Status_Enum;
    const { errors } = await UserStatusUpdate({
      variables: {
        userAuthId: brokerProducer?.auth0_id || "",
        status: status,
      },
      // updateQueries: ["getBrokerProducerList"] as any,
      // notifyOnNetworkStatusChange: true,
      refetchQueries: ["getBrokerProducerList", "getBrokerProducer"],
    });
    if (errors) {
      setToastMessage({
        message: 'User status update failed',
        type: 'error',
        show: true,
      });
      setStatusUpdateId(null);
    } else {
      (tableRef.current as any) && (tableRef.current as any).onQueryChange();
      setToastMessage({
        message: 'User status updated successfully',
        type: 'success',
        show: true,
      });
      setStatusUpdateId(null);
    }
    setBrokerProducer(null);
    setShowStatusUpdateConfirmModal(false);
  };

  const confirmResetPassword = async (event: React.MouseEvent, rowData: User) => {
    console.log(rowData);
    setShowResetPasswordConfirmModal(true);
    setBrokerProducer(rowData);
  }

  interface BrokerProducerResetPasswordBodyProps {
    setModalClose?: any;
    brokerProducer: any;
    loading?: boolean;
  }

  const BrokerProducerResetPasswordBody: React.FunctionComponent<BrokerProducerResetPasswordBodyProps> = ({
    setModalClose,
    brokerProducer,
    loading
  }) => {
    return (
      <>
        Reset the password for the user named <b>"{brokerProducer?.name}"</b> with the email address <b>"{brokerProducer?.email}"</b> ?`
        {brokerProducer?.user_password_resets?.[0] && (
          <b>
            <small>
              <br />
              Last password rest was
              {
                brokerProducer?.user_password_resets?.[0]?.created_at && (
                  " on " + DateTime.fromISO(brokerProducer?.user_password_resets?.[0]?.created_at).toFormat("dd LLL yy")
                )
              }
              {
                brokerProducer?.user_password_resets?.[0]?.requested_user?.name && (
                  " by user " + brokerProducer?.user_password_resets?.[0]?.requested_user?.name
                )
              }
              .
            </small>
          </b>
        )}
        <ButtonsContainer justifyContent="flex-end">
          <Grid>
            <GridItem>
              <Button
                color="primary"
                variant="contained"
                disabled={loading}
                style={{ marginRight: '5px' }}
                onClick={() => handleResetPassword()}
              >
                Proceed
              </Button>
            </GridItem>
          </Grid>
          <Grid>
            <GridItem>
              <Button
                color="secondary"
                variant="contained"
                disabled={loading}
                onClick={() => {
                  setBrokerProducer(null);
                  setShowResetPasswordConfirmModal(false);
                }}
              >
                Cancel
              </Button>
            </GridItem>
          </Grid>
        </ButtonsContainer>
      </>
    );
  }

  if (loading) {
    return <>Loading...</>;
  }

  let toastMessageComponent = <></>;
  if (showToastMessage) {
    toastMessageComponent = (
      <ToastMessage
        autoHide={true}
        hide={() => {
          setToastMessage({});
        }}
        show={showToastMessage.show}
        type={showToastMessage.type}
        outSideClickHide={true}
        message={showToastMessage.message}
      />
    );
  }

  return (
    <div className="tenant-details-wrapper" id="1">
      {toastMessageComponent}
      <div className="tenant-card">
        <div className="tenant-detail-header">
          <h3>Broker Producers</h3>
          <div>
            <Button
              variant="contained"
              color="primary"
              className={classes.searchBtn}
              startIcon={<AddIcon />}
              onClick={() => setShowProducerModal(true)}
            >
              Add New Broker Producer
            </Button>
          </div>
        </div>

        <div className="tenant-form-wrapper">
          {/* <BrokerProducersTable
            tableData={data}
            tableRefetch={refetch}
            tableLoading={loading}
            brokerAgencyId={brokerAgencyId}
            //tableRef={tableRef}
          /> */}

          <div className="table-style">
            <MaterialTable
              icons={tableIcons}
              style={{ fontSize: 14 }}
              title=""
              columns={producerTableColumns}
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
                  tooltip: "Edit Producer",
                  onClick: (event, rowData) => {
                    console.log(rowData);
                    //@ts-ignore

                    //@ts-ignore
                    setShowProducerModal(rowData.id);
                  },
                }),
                rowData => ({
                  icon: () => {
                    return resetPasswordLoading && resetPasswordId === rowData.id ? <ButtonLoading loading={resetPasswordLoading && resetPasswordId === rowData.id} /> : (
                      <HtmlTooltip
                        title={
                          <React.Fragment>
                            <div><b>Reset Password</b></div>
                            {rowData.user_password_resets?.[0] && (
                              <>
                                {rowData.user_password_resets?.[0]?.requested_user?.name} reset the password on {DateTime.fromISO(rowData.user_password_resets?.[0]?.created_at).toFormat("dd LLL yy")}
                              </>
                            )}
                          </React.Fragment>
                        }
                      >
                        <Badge color="secondary">
                          <LockResetIcon fontSize="small" />
                        </Badge>
                      </HtmlTooltip>
                    );
                  },
                  // tooltip: `Reset Password`,
                  onClick: confirmResetPassword, //handleResetPassword,
                }),
                rowData => ({
                  icon: () => {
                    return userStatusLoading && statusUpdateId === rowData.id ? <ButtonLoading loading={userStatusLoading && statusUpdateId === rowData.id} /> : (
                      <>
                        <Badge color="secondary">
                          {rowData.cognito_status === "ENABLED" && <BlockIcon fontSize="small" />}
                          {rowData.cognito_status === "DISABLED" && <CheckCircleIcon fontSize="small" />}
                          {rowData.cognito_status === "FORCE_CHANGE_PASSWORD" && <BlockIcon fontSize="small" />}
                        </Badge>
                      </>
                    );
                  },
                  tooltip: rowData.cognito_status === "DISABLED" ? "Enable User" : "Disable User",
                  onClick: confirmUserStatusUpdate,
                }),
              ]}
              components={{
                Toolbar: props => {
                  return (
                    <>
                      <CustomTableSearch
                        tableSearchOptions={tableSearchOptions}
                        searchValue={searchValue}
                        //setSearchColumn={setSearchColumn}
                        //searchColumn={searchColumn}
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
        </div>

        {showProducerModal && (
          <ModalWindow
            showModal={
              showProducerModal || showProducerModal !== null ? true : false
            }
            setShowModal={() => setShowProducerModal(false)}
            title="Add New Broker Producer"
            size="xs"
          >
            <BrokerProducerFormWrapper
              brokerProducerId={showProducerModal}
              brokerAgencyId={brokerAgencyId}
              tableRef={tableRef}
              setFormClose={() => setShowProducerModal(false)}
            />
          </ModalWindow>
        )}

        {showStatusUpdateConfirmModal && (
          <ModalWindow
            showModal={
              showStatusUpdateConfirmModal || showStatusUpdateConfirmModal !== null ? true : false
            }
            setShowModal={() => setShowStatusUpdateConfirmModal(false)}
            title="Please confirm"
            size="xs"
          >
            <BrokerProducerStatusUpdateBody
              brokerProducerId={brokerProducer?.id}
              cognitoStatus={brokerProducer?.cognito_status}
              setModalClose={() => setShowProducerModal(false)}
              name={brokerProducer?.name}
              email={brokerProducer?.email}
            />
          </ModalWindow>
        )}
        {showResetPasswordConfirmModal && (
          <ModalWindow
            showModal={
              showResetPasswordConfirmModal || showResetPasswordConfirmModal !== null ? true : false
            }
            setShowModal={() => setShowResetPasswordConfirmModal(false)}
            title="Please confirm"
            size="sm"
          >
            <BrokerProducerResetPasswordBody
              brokerProducer={brokerProducer}
              setModalClose={() => setShowProducerModal(false)}
            />
          </ModalWindow>
        )}
      </div>
      <ErrorToast
        error={error}
        processCustomError={() =>
          `Unable to Load Broker Producer Data - ${error?.message}`
        }
      />
    </div>
  );
};

const brokerProducerFormSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().when("edit_form", {
    is: "",
    then: yup.string().required("email is required").email("Invalid email"),
  }),
  commission_rate: yup.number().min(0, "Commission rate must be above 0").max(100, "Commission rate must be below 100"),
});

interface BrokerProducerFormProps {
  setFormClose?: any;
  brokerProducerId: any;
  brokerAgencyId: number;
  data?: GetBrokerProducerQuery;
  tableRef?: any;
  loading?: boolean;
}

export function withExtraInfo<P>(
  WrappedComponent: React.ComponentType<P & BrokerProducerFormProps>
) {
  const ComponentWithExtraInfo = (props: any) => {
    const { data, loading } = useGetBrokerProducerQuery({
      variables: {
        userId: props.brokerProducerId,
      },
      fetchPolicy: "network-only",
    });
    return (
      <WrappedComponent
        key={`userloading-${props.brokerProducerId}-${loading}`}
        {...props}
        loading={loading}
        data={data}
      />
    );
  };
  return ComponentWithExtraInfo;
}

function BrokerProducerFormWrapper(props: BrokerProducerFormProps) {
  const Component =
    props.brokerProducerId !== true
      ? withExtraInfo(BrokerProducerForm)
      : BrokerProducerForm;

  return <Component {...props} />;
}

const BrokerProducerForm: React.FunctionComponent<BrokerProducerFormProps> = ({
  setFormClose,
  brokerAgencyId,
  brokerProducerId,
  tableRef,
  data,
  loading,
}) => {
  const [showMessage, setShowMessage] = useState(false);

  const getAgencyQueryResult = {
    ...data?.broker_producer[0]?.user,
    "commission_rate": data?.broker_producer[0]?.commission_rate
  };

  const form = useForm({
    resolver: yupResolver(brokerProducerFormSchema),
    defaultValues: {
      ...getAgencyQueryResult,
    },
  });

  const [CreateBrokerProducer, { loading: createLoading, error: createError }] =
    useCreateBrokerProducerMutation({
      errorPolicy: "all",
    });
  const [UpdateBroker, { loading: updateLoading, error: updateError }] =
    useBrokerProducerUpdateMutation({
      errorPolicy: "all",
    });
  const { handleSubmit } = form;

  const handleFormSubmit = async (data: CreateBrokerUserInput) => {
    const { broker_agency_id, ...rest } = data;

    if (brokerProducerId !== true) {
      const { errors } = await UpdateBroker({
        variables: {
          id: brokerProducerId,
          ...rest,
        },
        refetchQueries: ["getBrokerProducerList", "getBrokerProducer"],
      });
      if (errors) {
        console.log(errors[0].message);
      } else {
        tableRef.current && tableRef.current.onQueryChange();
        setShowMessage(true);
      }
    } else {
      const { errors } = await CreateBrokerProducer({
        variables: {
          input: {
            broker_agency_id: parseInt(brokerAgencyId.toString()),
            ...rest,
          },
        },
        refetchQueries: ["getBrokerProducerList", "getBrokerProducer"],
      });
      if (errors) {
        console.log(errors[0].message);
      } else {
        tableRef.current && tableRef.current.onQueryChange();
        setShowMessage(true);
      }
    }
  };

  const messageContent =
    brokerProducerId !== true
      ? "Successfully updated"
      : "New broker producer successfully created";
  return (
    <>
      <ErrorToast
        error={createError}
        processCustomError={() =>
          `Unable to create broker producer - ${createError?.message}`
        }
      />
      <ErrorToast
        error={updateError}
        processCustomError={() =>
          `Unable to update broker producer - ${updateError?.message}`
        }
      />
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <GridItem>
                {loading ? (
                  <Skeleton height={40} />
                ) : (
                  <InputField name="name" label="Name" />
                )}
              </GridItem>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <GridItem>
                {loading ? (
                  <Skeleton height={40} />
                ) : (
                  <>
                    <InputField
                      name="email"
                      label="Email"
                      className={`${brokerProducerId !== true ? "input-disabled" : ""
                        }`}
                      inputProps={{ readOnly: brokerProducerId !== true }}
                    />

                    {/* <span style={{ display: "none" }}>
                    <InputField
                    name="edit_form"
                    label="edit_form"
                    defaultValue={data?.broker_producer[0]?.user.email}
                    />
                    </span> */}
                  </>
                )}
              </GridItem>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <GridItem>
                {loading ? (
                  <Skeleton height={40} />
                ) : (
                  <InputField
                    name="commission_rate"
                    label="Commission Rate (%)"
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
          </Grid>
          <ButtonsContainer justifyContent="flex-end">
            <Button
              type="submit"
              color="primary"
              variant="contained"
              disabled={createLoading || updateLoading || loading}
              endIcon={
                <ButtonLoading loading={createLoading || updateLoading} />
              }
            >
              {brokerProducerId === true
                ? "Add Broker Producer"
                : "Update Broker Producer"}
            </Button>
          </ButtonsContainer>
          <br />
        </form>
      </FormProvider>
      {showMessage && (
        <ToastMessage
          autoHide={true}
          hide={() => {
            setShowMessage(false);
            setFormClose(true);
          }}
          show={showMessage}
          type="success"
          outSideClickHide={true}
          message={`${messageContent}`}
        />
      )}
    </>
  );
};
