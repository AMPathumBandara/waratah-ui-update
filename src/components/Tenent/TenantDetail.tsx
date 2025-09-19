import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Badge,
  Button,
  FormControlLabel,
  FormHelperText,
  Grid,
  Switch as SwitchBtn,
  Typography,
} from "@mui/material";
import { useMatches } from "react-router";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import { alpha } from "@mui/material/styles";
import InputField from "components/From/InputField";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import { useUser } from "components/Auth/CognitoHooks";
import {
  CreateTenantAdminInput,
  GetTenantAdminDataQuery,
  GetTenantAdminDataQueryResult,
  Order_By,
  Tenant_Insert_Input,
  useCreateTenantAdminMutation,
  useCreateUpdateTenantMutation,
  useGetBrokerAgenciesQuery,
  useGetTenantAdminDataQuery,
  useGetTenentQuery,
  useTenantAdminListQuery,
  useTenantUserUpdateMutation,
} from "generated/graphql";
import { ThemeColors } from "theme/ThemeColors";
import Card from "components/Layout/Card";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import ButtonsContainer from "components/Layout/ButtonsContainer";
import ButtonLoading from "components/From/ButtonLoading";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ToastMessage from "components/Toast/ToastMessage";
import { useNavigate, useParams } from "react-router";
import ErrorToast from "components/Toast/ErrorToast";
import EditIcon from "@mui/icons-material/Edit";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ModalWindow from "components/ModalWindow";
import MaterialTable, { Query } from "@material-table/core";
import { tableIcons } from "utils/MaterialTableIcons";
import CustomTableSearch from "components/Search/CustomTableSearch";
import { DateTime } from "luxon";
import DeleteIcon from "@mui/icons-material/Delete";
import { ExpandMore } from "@mui/icons-material";
import GridItem from "components/Layout/GridItem";

const useStyles = makeStyles((theme: Theme) => ({
  searchBtn: {
    boxShadow: `0px 5px 10px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
  logoUploader: {
    minHeight: 200,
    "& button": {
      fontSize: "0.8rem",
    },
    "& img": {
      maxWidth: "100%",
      height: 140,
      width: "auto",
      marginBottom: 15,
    },
  },
  colorPalatte: {
    minHeight: 200,
    "& ul": {
      display: "flex",
      flexWrap: "wrap",
      marginLeft: -10,
      marginRight: -10,
      padding: 0,
      listStyle: "none",
      justifyContent: "center",
      maxWidth: 400,
      "& li": {
        padding: theme.spacing(1),
        "& span": {
          width: 45,
          height: 45,
          lineHeight: "55px",
          textAlign: "center",
          borderRadius: 4,
          display: "block",
          cursor: "pointer",
          "& svg": {
            color: "#FFFFFF",
            opacity: 0,
          },
        },
        "&.active span svg": {
          opacity: 1,
        },
      },
    },
  },
  inputHide: {
    visibility: "hidden",
    opacity: 0,
    height: 0,
  },
}));

const schema = yup.object().shape({
  name: yup.string().required("Tenant name is required"),
  report_template_Id: yup.string().required("Policy Doc is required"),
  class_of_business: yup
    .string()
    .max(3, "Class of business must be 3 characters")
    .min(3, "Class of business must be 3 characters")
    .required("Class of business is required"),
  logo: yup.string().required("Logo is required"),
  primary_color: yup
    .string()
    .required("Select Theme color is required")
    .matches(/^#(?:[0-9a-fA-F]{3}){1,2}$/),
  secondary_color: yup
    .string()
    .required("Select Theme color is required")
    .matches(/^#(?:[0-9a-fA-F]{3}){1,2}$/),
  scan_required: yup.boolean(),
});

interface themeColorProps {
  primary_color?: string | null;
  secondary_color?: string | null;
}
export default function TenantDetails() {
  const classes = useStyles();

  const params = useParams<string>();
  const navigate = useNavigate();

  const matches = useMatches();
  const current = matches[matches.length - 1];
  let url = current.pathname;
  //let { url } = useRouteMatch();

  const [themeColor, setThemeColor] = useState<themeColorProps>({});
  const [logo, setLogo] = useState("");
  const [tenantSuccessMsg, setTenantSuccessMsg] = useState(false);

  //@ts-ignore
  const getTenantId = params.tenant_id;

  const {
    data: getTenantData,
    loading: getTenantLoading,
    error: getTenantError,
  } = useGetTenentQuery({
    variables: {
      id: Number(getTenantId),
    },
    skip: getTenantId ? false : true,
    fetchPolicy: "network-only",
  });

  const tenantData = getTenantData?.tenant_by_pk;

  const saveBtnDisable = tenantData === null ? true : false;

  if (saveBtnDisable) {
    navigate(`/tenants/`);
  }

  const [
    tenantMutation,
    { loading: tenantMutationLoading, error: tenantMutationError },
  ] = useCreateUpdateTenantMutation({
    errorPolicy: "all",
  });

  const form = useForm({
    resolver: yupResolver(schema),
  });

  const loggedUser = useUser();

  const isSuperAdmin = loggedUser?.signInUserSession?.idToken?.payload?.["cognito:groups"].includes("super_admin");


  useEffect(() => {
    setThemeColor({
      primary_color: tenantData?.primary_color,
      secondary_color: tenantData?.secondary_color,
    });
    setLogo(tenantData?.logo ? tenantData?.logo : "");
    form.setValue("logo", tenantData?.logo);
    form.setValue("name", tenantData?.name);
    form.setValue("scan_required", tenantData?.scan_required);
    form.setValue("report_template_Id", tenantData?.report_template_Id);
    form.setValue("class_of_business", tenantData?.class_of_business);
  }, [!getTenantData]);

  const { handleSubmit } = form;

  const uploadLogo = () => {
    //@ts-ignore
    var myWidget = cloudinary.createUploadWidget(
      { cloudName: 'uiops', cropping: true, sources: ["local"] },
      //@ts-ignore
      (error, result) => {
        if (!error && result && result.event === "success") {
          console.log('Done! Here is the image info: ', result.info);
          // console.log(logo[0].secure_url);
          // setLogo(logo[0].secure_url);
          // form.setValue("logo", logo[0].secure_url); 
        }
      }
    )
    // //@ts-ignore
    // cloudinary.openUploadWidget(
    //   {
    //     cloud_name: "dad4jkcgt",
    //     upload_preset: "uiops_waratah",
    //     cropping: true,
    //     sources: ["local"],
    //   },
    //   //@ts-ignore
    //   (err, logo) => {
    //     if (!err) {
    //       console.log(logo[0].secure_url);
    //       setLogo(logo[0].secure_url);
    //       form.setValue("logo", logo[0].secure_url);
    //     }
    //   }
    // );
  };

  const selectedColorPalatte = (primary: string, secondary: string) => {
    setThemeColor({ primary_color: primary, secondary_color: secondary });
    form.setValue("primary_color", themeColor.primary_color);
  };

  const handleFormSubmit = async (data: Tenant_Insert_Input) => {
    const { errors, data: tenantId } = await tenantMutation({
      variables: {
        object: getTenantId ? { ...data, id: Number(getTenantId) } : { ...data },
      },
      refetchQueries: ["getTenentList"],
    });

    if (!errors) {
      setTenantSuccessMsg(true);
      setTimeout(() => {
        setTenantSuccessMsg(false);
        !getTenantId
          ? navigate(
            `/tenants/${tenantId?.insert_tenant_one?.id!}/brokers/${tenantId
              ?.insert_tenant_one?.id!}`
          )
          : navigate(`/tenants/${tenantId?.insert_tenant_one?.id!}`);
      }, 3000);
    }
  };

  return (
    <div className="tenant-details-wrapper" id="tenantDetails">
      <div className="tenant-card">
        {getTenantLoading ? (
          <div className="tenant-detail-header">
            <div style={{ width: "50%" }}>
              <Skeleton height={40} width="50%" />
            </div>
            <div style={{ width: "50%", textAlign: "right" }}>
              <Skeleton height={40} width="50%" />
            </div>
          </div>
        ) : (
          <div className="tenant-detail-header">
            <div>
              <h3>
                {tenantData
                  ? `Tenant - ${tenantData?.name}`
                  : "Create New Tenant"}
              </h3>
            </div>
            {getTenantId && (
              <>
                <div className="flex button-group">
                  <div>
                    <Button
                      variant="contained"
                      color="primary"
                      className={classes.searchBtn}
                      endIcon={<ChevronRightIcon />}
                      onClick={() =>
                        navigate(`${url}/brokers/${getTenantId}`)
                      }
                    >
                      Broker Agencies
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="panel1-content"
            id="panel1-header"
          >
            <Typography component="span">
              <b>Tenant form</b>
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className="tenant-form-wrapper">
              <FormProvider {...form}>
                <form onSubmit={handleSubmit(handleFormSubmit)}>
                  <fieldset disabled={!isSuperAdmin} style={{ border: 'none', padding: '0', margin: '0' }}>
                    <Grid container spacing={3} alignItems="flex-start">
                      <Grid size={{ xs: 12, md: 6 }}>
                        <GridItem>
                          {getTenantLoading ? (
                            <Skeleton height={40} />
                          ) : (
                            <InputField name="name" label="Tenant Name" />
                          )}
                        </GridItem>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <GridItem>
                          {getTenantLoading ? (
                            <Skeleton height={40} />
                          ) : (
                            <InputField
                              name="report_template_Id"
                              label="Policy Template Doc"
                            />
                          )}
                        </GridItem>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <GridItem>
                          {getTenantLoading ? (
                            <Skeleton height={40} />
                          ) : (
                            <InputField
                              name="class_of_business"
                              label="Class of Business"
                            />
                          )}
                        </GridItem>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <GridItem>
                          {getTenantLoading ? (
                            <Skeleton height={40} width="35%" />
                          ) : (
                            <FormControlLabel
                              control={
                                <>
                                  <SwitchBtn
                                    //name="scan_required"
                                    {...form.register("scan_required")}
                                    // checked={
                                    //   form.watch("scan_required") === undefined
                                    //     ? Boolean(form.setValue("scan_required", false))
                                    //     : Boolean(form.watch("scan_required"))
                                    // }
                                    checked={form.watch("scan_required") ?? false}
                                    onChange={(v) => {
                                      form.setValue("scan_required", v.target.checked);
                                    }}
                                  />
                                </>
                              }
                              label="Scan Required"
                            />
                          )}
                        </GridItem>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <GridItem>
                          {getTenantLoading ? (
                            <Skeleton height={200} />
                          ) : (
                            <Card legendTitle="Logo">
                              <Grid
                                container
                                spacing={1}
                                justifyContent="center"
                                alignItems="center"
                                direction="column"
                                className={classes.logoUploader}
                              >
                                <div>
                                  <InputField
                                    name="logo"
                                    label="logo"
                                  />
                                </div>

                                {logo && <img src={`${logo}`} />}

                                {/* <Button
                            variant="outlined"
                            size="small"
                            onClick={uploadLogo}
                          >
                            {logo ? `Change Logo` : "Upload Logo"}
                          </Button> */}
                              </Grid>
                            </Card>
                          )}
                          {!logo && (
                            <div>
                              {
                                //@ts-ignore
                                form.errors?.logo?.message && (
                                  <FormHelperText error={true}>
                                    Please upload logo
                                  </FormHelperText>
                                )
                              }
                            </div>
                          )}
                        </GridItem>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <GridItem>
                          {getTenantLoading ? (
                            <Skeleton height={200} />
                          ) : (
                            <Card legendTitle="Theme Color">
                              <Grid
                                container
                                spacing={1}
                                justifyContent="center"
                                alignItems="center"
                                className={classes.colorPalatte}
                              >
                                <div className={classes.inputHide}>
                                  <InputField
                                    name="primary_color"
                                    label="primary color"
                                    value={themeColor.primary_color || ""}
                                  />
                                  <InputField
                                    name="secondary_color"
                                    label="seconday color"
                                    value={themeColor.secondary_color || ""}
                                  />
                                </div>

                                <ul>
                                  {ThemeColors.map((c: any, i: any) => (
                                    <li
                                      key={i}
                                      className={`${
                                        //@ts-ignore
                                        themeColor?.primary_color === c.primary_color
                                          ? "active"
                                          : ""
                                        }`}
                                    >
                                      <span
                                        style={{ background: `${c.primary_color}` }}
                                        onClick={() =>
                                          selectedColorPalatte(
                                            c.primary_color,
                                            c.secondary_color
                                          )
                                        }
                                      >
                                        <CheckCircleIcon fontSize="small" />
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </Grid>
                            </Card>
                          )}
                          {!themeColor.primary_color && (
                            <div>
                              {
                                //@ts-ignore
                                form.errors?.primary_color?.message && (
                                  <FormHelperText error={true}>
                                    Please select color theme
                                  </FormHelperText>
                                )
                              }
                            </div>
                          )}
                        </GridItem>
                      </Grid>
                    </Grid>
                    <ButtonsContainer justifyContent="flex-end">
                      <Button
                        type="submit"
                        color="primary"
                        variant="contained"
                        disabled={
                          tenantMutationLoading || tenantSuccessMsg || saveBtnDisable || !isSuperAdmin
                        }
                        endIcon={
                          !tenantMutationLoading && !getTenantId ? (
                            <ChevronRightIcon />
                          ) : (
                            <ButtonLoading
                              loading={tenantMutationLoading || tenantSuccessMsg}
                            />
                          )
                        }
                      >
                        {getTenantId ? "Save Changes" : "Save & Next"}
                      </Button>
                    </ButtonsContainer>
                  </fieldset>
                </form>
              </FormProvider>
            </div>
          </AccordionDetails>
        </Accordion>
        <br />
        <br />

        {getTenantId && <TenantUserList tenantId={Number(getTenantId)} />}
      </div>
      {tenantSuccessMsg && (
        <ToastMessage
          autoHide={true}
          outSideClickHide={true}
          message={
            getTenantId ? "Successfully Updated" : "Successfully Created"
          }
          show={tenantSuccessMsg}
          hide={setTenantSuccessMsg}
          positionHorizontal="center"
          positionVertical="bottom"
          type="success"
        />
      )}

      <ErrorToast
        error={getTenantError}
        processCustomError={() =>
          `Unable to load Tenant details - ${tenantMutationError?.message}, Please refresh the page and try again`
        }
      />
      <ErrorToast
        error={tenantMutationError}
        processCustomError={() =>
          `Unable to ${getTenantId ? "Update" : "Create"} Tenant - ${tenantMutationError?.message
          }`
        }
      />
    </div>
  );
}

const tenantUserTable: Array<any> = [
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
    title: "Created at",
    field: "created_at",
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

interface TenantUserListProps {
  tenantId: number;
}
const TenantUserList = ({ tenantId }: TenantUserListProps) => {
  const tableRef = React.useRef(null);
  const classes = useStyles();
  const [searchValue, setSearchValue] = useState(null);
  const [rowsPerPage, setRowsPerPage] =
    React.useState<number>(DEFAULT_PAGE_SIZE);
  const [createAdminModal, setCreateAdminModal] = useState<
    string | boolean | null
  >(null);

  const { data, loading, error, refetch } = useTenantAdminListQuery({
    variables: {
      tenant_id: tenantId,
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

    const tenantAdminTableData = await refetch({
      limit: query.pageSize,
      offset: query.page * query.pageSize,
      name: query.search ? `%${query.search}%` : "%",
    });

    return Promise.resolve({
      //@ts-ignore
      data:
        tenantAdminTableData?.data?.tenant_admin.map((m: any) => {
          const { created_at, ...rest } = m.user;
          return {
            created_at: DateTime.fromISO(m.user.created_at).toFormat(
              "dd LLL yyyy"
            ),
            ...rest,
          };
        }) || [],
      page: query.page,
      //@ts-ignore
      totalCount:
        tenantAdminTableData?.data?.tenant_admin_aggregate.aggregate?.count ||
        0,
    });
  };

  return (
    <>
      <div className="tenant-detail-header">
        <h3>Tenant Admin Users</h3>
        <div>
          <Button
            variant="contained"
            color="primary"
            className={classes.searchBtn}
            startIcon={<AddIcon />}
            onClick={() => setCreateAdminModal(true)}
          >
            Add Tennat Admin
          </Button>
        </div>
      </div>
      <div className="tenant-form-wrapper">
        <div className="table-style">
          <MaterialTable
            icons={tableIcons}
            title=""
            columns={tenantUserTable}
            data={remoteData}
            tableRef={tableRef}
            isLoading={loading}
            page={rowsPerPage}
            onChangeRowsPerPage={setRowsPerPage}
            //onOrderChange={changeOrder}
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
                tooltip: "Edit User",
                onClick: (event, rowData) => {
                  //@ts-ignore
                  setCreateAdminModal(rowData.id);
                },
              }),
              // rowData => ({
              //   icon: () => {
              //     return (
              //       <>
              //         <Badge color="error">
              //           <DeleteIcon color="error" fontSize="small" />
              //         </Badge>
              //       </>
              //     );
              //   },
              //   tooltip: "Delete Tenant User",
              //   onClick: (event, rowData) => {

              //   },
              // }),
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
      </div>
      {createAdminModal && (
        <ModalWindow
          showModal={Boolean(createAdminModal)}
          setShowModal={() => setCreateAdminModal(false)}
          title={
            createAdminModal === true
              ? "Add New Tenant Admin"
              : "Update Tenant Admin"
          }
          size="xs"
        >
          <TenantUserFormWrapper
            tenantId={tenantId}
            closeModal={() => setCreateAdminModal(false)}
            tenantUserId={createAdminModal}
            tableRef={tableRef}
          />
        </ModalWindow>
      )}
    </>
  );
};
interface TenantUserFormProps {
  tenantId?: number | boolean;
  closeModal?: any;
  data?: GetTenantAdminDataQuery;
  tenantUserId?: string | null | boolean;
  loading?: boolean;
  tableRef?: any;
}
export function withExtraInfo<P>(
  WrappedComponent: React.ComponentType<P & TenantUserFormProps>
) {
  const ComponentWithExtraInfo = (props: any) => {
    const { data, loading } = useGetTenantAdminDataQuery({
      variables: {
        user_id: props.tenantUserId ? props.tenantUserId : null,
      },
      fetchPolicy: "network-only",
    });
    return (
      <WrappedComponent
        {...props}
        key={`tenant-admin-${props.tenantUserId}-${loading}`}
        loading={loading}
        data={data}
      />
    );
  };
  return ComponentWithExtraInfo;
}

function TenantUserFormWrapper(props: TenantUserFormProps) {
  const Component =
    props.tenantUserId !== true
      ? withExtraInfo(TenantUserForm)
      : TenantUserForm;

  return <Component {...props} />;
}

const addTenantFormSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().when("edit_form", {
    is: "",
    then: yup.string().required("email is required").email("Invalid email"),
  }),
});
const TenantUserForm = (props: TenantUserFormProps) => {
  const { tenantId, closeModal, data, loading, tenantUserId, tableRef } = props;
  const [showMessage, setShowMessage] = useState(false);

  const form = useForm({
    resolver: yupResolver(addTenantFormSchema),
    defaultValues: {
      ...data?.tenant_admin[0]?.user,
    },
  });
  const [
    addNewTenantAdmin,
    { loading: addTenantLoading, error: addTenantError },
  ] = useCreateTenantAdminMutation({
    errorPolicy: "all",
  });

  const [
    updateTenantUser,
    { loading: updateTenantUserLoading, error: updateTenantUserError },
  ] = useTenantUserUpdateMutation({
    errorPolicy: "all",
  });

  const { handleSubmit } = form;

  const handleFormSubmit = async (data: CreateTenantAdminInput) => {
    if (tenantId && tenantId !== true) {
      if (tenantUserId && tenantUserId !== true) {
        // update tenant data
        const { errors } = await updateTenantUser({
          variables: {
            id: parseInt(tenantUserId.toString()),
            name: data.name,
            email: data.email,
          },
          refetchQueries: ["TenantAdminList", "GetTenantAdminData"],
        });
        if (!errors) {
          tableRef.current && tableRef.current.onQueryChange();
          setShowMessage(true);
        }
      } else {
        //insert tenant data
        const { errors } = await addNewTenantAdmin({
          variables: {
            input: {
              email: data.email,
              name: data.name,
              tenant_id: parseInt(tenantId.toString()),
            },
          },
          refetchQueries: ["TenantAdminList", "GetTenantAdminData"],
        });
        if (!errors) {
          tableRef.current && tableRef.current.onQueryChange();
          setShowMessage(true);
        }
      }
    } else {
      console.log("Tenant ID not available");
    }
  };

  return (
    <>
      <ErrorToast
        error={addTenantError}
        processCustomError={() =>
          `Unable to create tenant admin - ${addTenantError?.message}`
        }
      />
      <ErrorToast
        error={updateTenantUserError}
        processCustomError={() =>
          `Unable to update tenant admin - ${updateTenantUserError?.message}`
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
                      className={`${tenantUserId !== true ? "input-disabled" : ""
                        }`}
                      inputProps={{ readOnly: tenantUserId !== true }}
                    />

                    <span style={{ display: "none" }}>
                      <InputField
                        name="edit_form"
                        label="edit_form"
                        defaultValue={data?.tenant_admin[0]?.user.email}
                      />
                    </span>
                  </>
                )}
              </GridItem>
            </Grid>
          </Grid>
          <ButtonsContainer justifyContent="flex-end">
            <Button
              type="submit"
              color="primary"
              variant="contained"
              disabled={addTenantLoading || loading || updateTenantUserLoading}
              endIcon={
                <ButtonLoading
                  loading={addTenantLoading || updateTenantUserLoading}
                />
              }
            >
              {tenantUserId === true
                ? "Add Tenant Admin"
                : "Update Tenant Admin"}
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
            closeModal(true);
          }}
          show={showMessage}
          type="success"
          outSideClickHide={true}
          message={
            tenantUserId === true
              ? "New Tenant Admin Created"
              : "Tenant Details Updated"
          }
        />
      )}
    </>
  );
};
