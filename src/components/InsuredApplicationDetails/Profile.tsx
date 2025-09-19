// React Imports
import React, { useState } from "react";
// Material UI
import Grid from "@mui/material/Grid";
import { makeStyles, Theme } from "@mui/material/styles";
import { FormProvider, useForm, useFieldArray } from "react-hook-form";
import {
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Alert from "@mui/material/Alert";
import validator from "validator";
import {
  ApplicationProfileQuery,
  useApplicationProfileQuery,
  useMeQuery,
  useCreateInsuredApplicationMutation,
  UiInsuredApplicationInput,
  ProfileFieldsFragment,
  useGetBrokerAgencyListQuery,
  GetBrokerAgencyListQuery,
  useGetIndustryDataQuery,
  useAddOrganizationContactMutation,
  useOrganizationContactsListQuery,
  useGetOrgDetailByDomainMutation,
  InsuredApplicationInput,
  useDeleteInsuredOrgContactMutationMutation,
  useGetImsCompanyBusinessTypeDataQuery,
  useCreateInsuredOrganizationApplicationUiMutation,
  useGenerateQuotesMutation,
  Maybe,
} from "generated/graphql";

import { ApplicationParams } from ".";
import { States } from "./Consts";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import InputField from "../From/InputField";
import { useParams, useNavigate, useMatch } from "react-router";
import ToastMessage from "components/Toast/ToastMessage";
import SelectForm from "../From/Select";
import ApolloErrorToast from "components/Toast/ApolloErrorToast";
import Card from "components/Layout/Card";
import ButtonsContainer from "components/Layout/ButtonsContainer";
import ButtonLoading from "components/From/ButtonLoading";
import { email_regx, getHostName, getDomain } from "utils";
import { LoadingInput } from "components/ContentLoaders";
import ErrorToast from "components/Toast/ApolloErrorToast";
import DeleteIcon from "@mui/icons-material/Delete";
import { DateTime } from "luxon";
import _ from "lodash";
import ConfirmationModal from "components/Common/ConfirmationModal";
import { ApolloError } from "@apollo/client";
import { useUser } from "components/Auth/CognitoHooks";
import GridItem from "components/Layout/GridItem";

const schema = yup.object().shape({
  // insured_name: yup.string().when("edit_form", {
  //   is: "",
  //   then: yup.string().required("Organization name is required"),
  // }),
  // contact_name: yup.string().required("Contact name is required"),
  // contact_email: yup
  //   .string()
  //   .required("Contact email is required")
  //   .matches(email_regx, "Invalid Email"),
  // full_name: yup.string().when("edit_form", {
  //   is: "",
  //   then: yup.string().required("Full name is required"),
  // }),
  // date_of_birth: yup.string().when("edit_form", {
  //   is: "",
  //   then: yup.string().required("Date of birth is required"),
  // }),
  // occupation_name: yup.string().when("edit_form", {
  //   is: "",
  //   then: yup.string().required("Occupation name is required"),
  // }),

  // insurance_contacts: yup
  //   .array()
  //   .of(
  //     yup.object().shape({
  //       name: yup.string().required("Name is required"),
  //       email: yup
  //         .string()
  //         .email("Invalid email")
  //         .required("Email is required"),
  //       type: yup.string(),
  //     })
  //   )
  //   .min(1, "At least one contact detail is required for Home"),
  // security_contacts: yup.array().of(
  //   yup.object().shape({
  //     name: yup.string(),
  //     email: yup.string().email("Invalid email"),
  //     type: yup.string(),
  //   })
  // ),
  address: yup
    .string()
    .max(100, "Address must be less than 100 characters")
    .required("Address is required"),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
  zip: yup
    .string()
    .max(10, "Zip code must be less than 5 characters")
    .required("Zip code is required"),
  // domain: yup.string().required("Website is required"),
  // industry: yup.string().required("Industry is required"),
  // revenue: yup
  //   .number()
  //   .required("Revenue is required")
  //   .min(15000, "Revenue must be greater than or equal to 15000")
  //   .max(100000000, "Revenue must be below 100,000,000")
  //   .typeError("Please enter numeric value"),
  // employees: yup
  //   .string()
  //   .required("Number of employee is required")
  //   .matches(
  //     /^(\d{1,3}(\,\d{3})*|(\d+))(\.\d{2})?$/,
  //     "Please enter valid number"
  //   )
  //   .typeError("Please enter numeric value"),
  disclaimer: yup.boolean().oneOf([true], "Must Accept Terms and Conditions"),
});

interface fetchDomainData {
  address: string;
  city: string;
  state: string;
  employees: string;
  industry: string;
  zip: string;
  revenue: number;
  insured_name: string;
  domain: string;
  naics: Number;
  disclaimer: boolean;
  dnbCode: Number;
}
interface ProfileProps {
  applicationData?: ApplicationProfileQuery;
  handleStageChange: (stage: string) => void;
  id: string;
  brokerList?: GetBrokerAgencyListQuery;
  brokerName?: String;
  loading?: boolean;
  domainData?: any;
  applicationStage?: string | undefined;
}

function withExtraInfo<P>(WrappedComponent: React.ComponentType<P>) {
  const ComponentWithExtraInfo = (props: P) => {
    const params = useParams<ApplicationParams>();
    const { data, loading } = useApplicationProfileQuery({
      variables: {
        id: params.id,
      },
      fetchPolicy: "network-only",
    });

    const { data: orgContactsData, loading: orgContactsLoading } =
      useOrganizationContactsListQuery({
        variables: {
          orgId: Number(
            data?.insurance_application_by_pk?.insured_organization?.id
          ),
        },
        skip: loading,
      });

    // return loading ? (
    //   <WrappedCircularProgress />
    // ) : (
    //   <WrappedComponent {...props} key={`application-${params.id}-${loading}`} applicationData={data} loading={loading} />
    // );
    return (
      <WrappedComponent
        {...props}
        applicationData={data}
        orgContactsData={orgContactsData}
        loading={loading}
      />
    );
  };
  return ComponentWithExtraInfo;
}

function withoutExtraInfo<P>(WrappedComponent: React.ComponentType<P>) {
  const ComponentWithoutExtraInfo = (props: P) => {
    // Fetch Broker Agencies
    const { data, loading } = useGetBrokerAgencyListQuery();

    // return loading ? (
    //   <WrappedCircularProgress />
    // ) : (
    //   <WrappedComponent {...props} key={`application-with-brokerList-${loading}`} loading={loading} brokerList={data} />
    // );
    return <WrappedComponent {...props} loading={loading} brokerList={data} />;
  };
  return ComponentWithoutExtraInfo;
}

export function ProfilePage(props: ProfileProps) {
  const params = useParams<ApplicationParams>();

  const Component = params.id
    ? withExtraInfo(ProfilePageComponent)
    : withoutExtraInfo(ProfilePageComponent);

  return <Component {...props} />;
}

const flattenApplication: UiInsuredApplicationInput | any = (
  applicationFragment?: ProfileFieldsFragment | null
) => {
  if (!applicationFragment) {
    return {};
  }

  const {
    insured_organization, //: { name, insured_organization_contacts, ...org },
    __typename,
    broker_agency,
    id,
    revenue,
    ...rest
  } = applicationFragment;

  const name = insured_organization?.name;
  const insured_organization_contacts = insured_organization?.insured_organization_contacts;

  return {
    ...rest,
    insured_organization,
    revenue: parseFloat(applicationFragment.revenue.replace(/\$|,/g, "")),
    insured_name: name,
    insurance_contacts: insured_organization_contacts?.filter(
      (f) => f.type === "insurance"
    ),
    security_contacts: insured_organization_contacts?.filter(
      (f) => f.type === "security"
    ),
    // contact_name: insured_organization_contacts?.[0].name,
    // contact_email: insured_organization_contacts?.[0].email,
    organization_type: applicationFragment.organization_type,
    broker_agency: broker_agency,
  };
};

const ProfilePageComponent: React.FC<ProfileProps> = ({
  applicationData,
  handleStageChange,
  brokerList,
  loading,
  domainData,
  applicationStage,
}) => {
  const params = useParams<ApplicationParams>();
  const navigate = useNavigate();

  const { data: meData, loading: meLoading } = useMeQuery();

  const me = meData?.me?.[0];
  const brokerName = me?.broker_producer?.broker_agency.name;

  const brokerAgencyId = me?.broker_producer?.broker_agency.id;
  const paymentOption = me?.broker_producer?.broker_agency?.payment_option;
  const calculateFee = me?.broker_producer?.broker_agency?.calculate_fee;
  const calculateTax = me?.broker_producer?.broker_agency?.calculate_tax;
  const userId = me?.auth0_id;

  //let { path, url } = useRouteMatch();
  const [invalidIndustryError, setInvalidIndustryError] = useState(false);
  const [appId, setAppId] = useState<string | null>(null);

  const {
    data: industryData,
    loading: industryLoading,
    error: indsutryError,
  } = useGetIndustryDataQuery();

  const {
    data: organizationTypeData,
    loading: organizationTypeLoading,
    error: organizationTypeError,
  } = useGetImsCompanyBusinessTypeDataQuery();

  // const [
  //   createInsuredApplication,
  //   { loading: insertLoading, error: insertError },
  // ] = useCreateInsuredApplicationMutation({
  //   errorPolicy: "all",
  // });

  const [
    createInsuredOrganizationApplicationUi,
    { loading: insertLoading, error: insertError },
  ] = useCreateInsuredOrganizationApplicationUiMutation({
    errorPolicy: "all",
  });

  const [
    generateQuotes,
    { loading: generateQuotesLoading, error: generateQuotesError },
  ] = useGenerateQuotesMutation({
    errorPolicy: "all",
  });

  const [
    addOrganizationContacts,
    { loading: addOrgContactLoading, error: addOrgContactError },
  ] = useAddOrganizationContactMutation({
    errorPolicy: "all",
  });

  const [
    fetchOrgData,
    { loading: fetchOrgDataLoading, error: fetchOrgDataError },
  ] = useGetOrgDetailByDomainMutation({
    errorPolicy: "all",
  });

  const loadedApplicationData = flattenApplication(
    applicationData?.insurance_application_by_pk
  );

  console.log(loadedApplicationData);

  //@ts-ignore
  const [fetchDomainInfo, setFetchDomainInfo] = useState<fetchDomainData>({});

  const [prefillMsg, setPrefillMsg] = useState(false);
  const [disclaimerCheck, setDisclaimerCheck] = React.useState(false);

  const industries = [...(industryData?.organization_industry || [])];

  const organizationTypes = [...(organizationTypeData?.ims_company_business_type || [])];

  const defaultDomainData = {
    ...(domainData ? domainData : {}),
    insurance_contacts: loadedApplicationData.insurance_contacts || [
      { name: "", email: "", type: "insurance" },
    ],
    security_contacts: loadedApplicationData.security_contacts || [
      { name: "", email: "", type: "security" },
    ],
  };

  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ...(defaultDomainData ? defaultDomainData : loadedApplicationData),
      insurance_contacts: loadedApplicationData.insurance_contacts || [
        { name: "", email: "", type: "insurance" },
      ],
      security_contacts: loadedApplicationData.security_contacts || [
        { name: "", email: "", type: "security" },
      ],
    },
  });

  const { handleSubmit, control } = form;

  const {
    fields: insuranceContacts,
    append: addInsuranceContact,
    remove: removeInsuranceContact,
  } = useFieldArray({
    control,
    name: "insurance_contacts",
    keyName: "tempId",
  });

  const {
    fields: securityContacts,
    append: addSecurityContact,
    remove: removeSecurityContact,
  } = useFieldArray({
    control,
    name: "security_contacts",
    keyName: "tempId",
  });

  const handleFormSubmit = async (data: UiInsuredApplicationInput) => {
    console.log("handleFormSubmit -> data", data);
    const {
      //@ts-ignore
      contacts,
      //@ts-ignore
      edit_form,
      //@ts-ignore
      disclaimer,
      //@ts-ignore
      insurance_contacts = [
        {
          "name": "Pathum Bandara",
          "email": "pathum@visionxllc.com",
          "type": "insurance"
        }
      ],
      //@ts-ignore
      security_contacts = [],
      rentals_data,
      ...rest
    } = data;

    function mergeArrays(insurance_contacts: any, security_contacts: any) {
      if (security_contacts && security_contacts.length > 0) {
        return insurance_contacts
          .concat(security_contacts)
          .filter((item: any) => item?.name && item?.email);
      } else {
        return insurance_contacts;
      }
    }

    const filterContacts = mergeArrays(insurance_contacts, security_contacts);

    // const filterRevenue = data.revenue.toString().replace(/\,/g, "");
    const filterRevenue = 30000;

    let variables = {
      ...rest,
      insured_name: (rentals_data?.full_name || 'app') + "_" + Date.now(),
      //@ts-ignore
      domain: 'demo.com', //getHostName(data?.domain),
      revenue: Number(filterRevenue),
      industry: 'Airlines',//data.industry,
      insured_contacts: filterContacts,
      // naics_code:
      //   industryData?.organization_industry
      //     .filter((item) => {
      //       return item?.industry === data?.industry;
      //     })[0]
      //     ?.naics_codes[0]!.naics.toString() ||
      //   fetchDomainInfo?.naics.toString(),
      naics_code: '333242',
      employees: Number(data?.employees || 0),
      // Add expiration and effective dates as well if they are present
      expiration_date: loadedApplicationData?.expiration_date,
      effective_date: loadedApplicationData?.effective_date,
      quotes: [],
      // created_by_user_id: userId
      stage: "quote",
      rentals_data: rentals_data,
    };

    if (!brokerList || brokerAgencyId) {
      variables.broker_agency_id =
        loadedApplicationData?.broker_agency?.id || brokerAgencyId;
    } else {
      const broker_name = data.broker_agency_id.toString();
      // variables.broker_agency_id = brokerList?.broker_agency.filter(
      //   broker => broker?.name === broker_name
      // )[0].id;
    }

    setInvalidIndustryError(false);

    //get quotes
    const quotes = await generateQuoteList(
      variables?.revenue,
      variables?.industry,
      variables?.state,
      variables?.employees,
      paymentOption,
      calculateFee,
      calculateTax
    );

    console.log("Generated quotes", { quotes });

    variables = { ...variables, quotes: quotes };

    console.log("Variables", { variables });

    if (brokerAgencyId || loadedApplicationData || brokerList) {
      // const createdData = await createInsuredApplication({
      //   variables: {
      //     object: variables,
      //   },
      //   refetchQueries: params.id
      //     ? ["organizationList", "applicationProfile", "applicationQuote"]
      //     : ["organizationList"],
      // });

      const createdData = await createInsuredOrganizationApplicationUi({
        variables: variables,
        refetchQueries: params.id
          ? ["organizationList", "applicationProfile", "applicationQuote"]
          : ["organizationList"],
      });

      console.log(createdData);

      if (createdData?.errors === undefined) {
        if (
          //path === "/applications-list/" ||
          //path === "/applications-list/:id"
          useMatch("/applications-list/") ||
          useMatch("/applications-list/:id")
        ) {
          navigate(
            `/applications-list/${createdData.data?.insert_insured_organization_one?.insurance_applications[0].id}`
          );
        } else {
          navigate(
            `/applications/${createdData.data?.insert_insured_organization_one?.insurance_applications[0].id}`
          );
        }
      } else if (createdData?.errors[0]?.message.includes("Enter a valid Industry")) {
        const res = JSON.parse(createdData?.errors[0]?.message);
        setAppId(res.applicationId);
        console.log(res.applicationId);
        setInvalidIndustryError(true);
      }
    }
  };

  const generateQuoteList = async (revenue: number, industry: string, state: Maybe<string> | undefined, employees: number, paymentOption: string | undefined, calculateFee: boolean | null | undefined, calculateTax: boolean | null | undefined) => {
    const quoteData = await generateQuotes({
      variables: {
        revenue: revenue.toString(),
        industry: industry,
        state: state,
        employees: employees.toString(),
        paymentOption: paymentOption,
        calculateFee: calculateFee,
        calculateTax: calculateTax
      }
    });

    console.log("Generated quotes response", { quoteData });
    return quoteData?.data?.generateQuotes?.quotes;
  }

  const gotoApplication = async (applicationId: string | null) => {
    if (applicationId) {
      navigate(
        `/applications/${applicationId}`
      );
    } else {
      console.log("Application id not found.");
    }
  }

  const fetchDomainData = async (domain: string) => {
    console.log("fetchDomainData -> domain", domain);
    let sanitizedDomain = "";
    try {
      sanitizedDomain = getDomain(domain);
    } catch (error) {
      form.setError("domain", {
        message: "Invalid web address",
      });
      return false;
    }
    if (!validator.isFQDN(sanitizedDomain)) {
      form.setError("domain", {
        message: "Invalid web address",
      });
      return false;
    } else {
      form.clearErrors("domain");
    }
    if (domain !== "") {
      const { data } = await fetchOrgData({
        variables: {
          //@ts-ignore
          domain: sanitizedDomain,
        },
      });

      //@ts-ignore
      if (Object.keys(data?.searchDnB).length > 1) {
        //@ts-ignore
        const { __typename, ...rest } = data?.searchDnB;
        //@ts-ignore
        setFetchDomainInfo({
          domain: sanitizedDomain,
          ...rest,
        });
      } else {
        setPrefillMsg(true);
      }
    }
  };

  React.useEffect(() => {
    if (loadedApplicationData?.id !== undefined) {
      form.reset({
        ...loadedApplicationData,
      });
    }
  }, [loadedApplicationData?.id]);

  React.useEffect(() => {
    if (defaultDomainData?.domain !== undefined) {
      form.reset({
        ...defaultDomainData,
      });
    }
  }, [defaultDomainData?.domain]);

  React.useEffect(() => {
    //@ts-ignore
    if (
      fetchDomainInfo !== undefined &&
      Object.keys(fetchDomainInfo).length === 0 &&
      form.getValues("domain")
    ) {
      form.setValue("industry", "");
      form.setValue("state", "");
      setPrefillMsg(true);
    } else if (fetchDomainInfo !== undefined) {
      //@ts-ignore
      const setIndustry = fetchDomainInfo?.naics_icdb?.organization_industry?.industry;

      form.setValue("insured_name", fetchDomainInfo?.insured_name);
      form.setValue("revenue", fetchDomainInfo?.revenue);
      form.setValue("employees", fetchDomainInfo?.employees);
      form.setValue("industry", setIndustry);
      form.setValue("address", fetchDomainInfo?.address);
      form.setValue("state", fetchDomainInfo?.state?.trim().toUpperCase().replace(/\s/g, ""));
      form.setValue("city", fetchDomainInfo?.city);
      form.setValue("zip", fetchDomainInfo?.zip);
      form.setValue("organization_type", String(fetchDomainInfo?.dnbCode));
    }
  }, [fetchDomainInfo]);

  const formLoading = loading || fetchOrgDataLoading || industryLoading || organizationTypeLoading;

  const [state, setState] = React.useState({
    // verifyIncome: false,
    // verifySafetySmokeDetector: false,
    // verifySafetySprinkler: false,
    //verifyAddress: false,
    // verifySafetyDeadbolt: false,
  });

  const handleBlur = (fieldName: any, checkboxName: any) => {
    //@ts-ignore
    //  != operator is used to check regardless of type
    if (form.getValues(fieldName) !== "" && fetchDomainInfo?.[fieldName] != form.getValues(fieldName)) {
      setState((prevState) => ({ ...prevState, [`${checkboxName}`]: true }));
    }
  };

  const allVerified = Object.values(state).every((value) => value === true);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  React.useEffect(() => {
    if (!allVerified) {
      setDisclaimerCheck(false);
    }
  }, [disclaimerCheck, allVerified]);

  const handleDisclaimerChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDisclaimerCheck(event.target.checked);
  };

  const checkKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }

  return (
    <>
      {prefillMsg && (
        <ToastMessage
          type="warning"
          show={prefillMsg}
          hide={() => setPrefillMsg(false)}
          autoHide={true}
          outSideClickHide={true}
          message="Organization information not available"
        />
      )}
      <ErrorToast
        error={indsutryError}
        processCustomError={() =>
          `Unable to load industries - ${indsutryError?.message}`
        }
      />
      <ErrorToast
        error={organizationTypeError}
        processCustomError={() =>
          `Unable to load organization types - ${organizationTypeError?.message}`
        }
      />
      <ErrorToast
        error={fetchOrgDataError}
        processCustomError={() => `Error - ${fetchOrgDataError?.message}`}
      />
      {
        !invalidIndustryError && (
          <ErrorToast
            error={insertError}
            processCustomError={() => `Unable to insert - ${insertError?.message}`}
          />
        )
      }
      {
        invalidIndustryError && (
          <ToastMessage
            autoHide={true}
            hide={() => {
              gotoApplication(appId)
            }}
            show={invalidIndustryError}
            type="error"
            outSideClickHide={true}
            autoHideTime={2000}
            message={'This is not a industry that we sell cyber insurance to'}
          />
        )
      }
      <Card shadow={false}>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(handleFormSubmit)} onKeyDown={(e) => checkKeyDown(e)}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 12 }}>
                <GridItem>
                  {loading ? (
                    <LoadingInput />
                  ) : (
                    <InputField
                      name="rentals_data[full_name]"
                      label="Full Name"
                      defaultValue={loadedApplicationData?.rentals_data?.full_name}
                    />
                  )}
                </GridItem>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <GridItem>
                  {formLoading ? (
                    <LoadingInput />
                  ) : (
                    <>
                      <InputField
                        name="rentals_data[ssn]"
                        label="SSN"
                        className={`${applicationStage === "bound" ? "input-disabled" : ""
                          }`}
                        inputProps={{ readOnly: applicationStage === "bound" }}
                        defaultValue={loadedApplicationData?.rentals_data?.ssn}
                      />
                      <span style={{ display: "none" }}>
                        <InputField
                          name="edit_form"
                          label="edit_form"
                          defaultValue={loadedApplicationData?.insured_name}
                        />
                      </span>
                    </>
                  )}
                </GridItem>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <GridItem>
                  <InputField
                    name="rentals_data[date_of_birth]"
                    label="Date of Birth"
                    type="date"
                    value={loadedApplicationData?.rentals_data?.date_of_birth}
                  />
                </GridItem>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <GridItem>
                  {formLoading ? (
                    <LoadingInput />
                  ) : (
                    <>
                      <InputField
                        name="address"
                        label="Address"
                        defaultValue={loadedApplicationData?.insured_organization?.address}
                      //onBlur={() => handleBlur("address", "verifyAddress")}
                      />
                      {/* <div className="data-verify-checkbox">
                      <Checkbox
                      name="verifyAddress"
                      checked={state["verifyAddress"]}
                      disabled={!form.getValues("address")}
                      style={{ padding: 0, marginRight: "5px" }}
                      onChange={handleChange}
                      />
                      <label>Verify Address</label>
                      </div> */}
                    </>
                  )}
                </GridItem>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <GridItem>
                  {formLoading ? (
                    <LoadingInput />
                  ) : (
                    <InputField
                      name="city"
                      label="City"
                      defaultValue={loadedApplicationData?.insured_organization?.city}
                    />
                  )}
                </GridItem>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <GridItem>
                  {formLoading ? (
                    <LoadingInput />
                  ) : (
                    <SelectForm
                      name="state"
                      label="State"
                      trimForSingleValue={true}
                      options={
                        States.map((st) => ({ value: st, label: st })).sort() ||
                        []
                      }
                      defaultValue={loadedApplicationData?.insured_organization?.state}
                    />
                  )}
                </GridItem>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <GridItem>
                  {formLoading ? (
                    <LoadingInput />
                  ) : (
                    <InputField
                      name="zip"
                      label="Zip"
                      defaultValue={loadedApplicationData?.insured_organization?.zip}
                    />
                  )}
                </GridItem>
              </Grid>
              <div className="contact-group-label">
                <span>Occupation Details</span>
              </div>
              <Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <GridItem>
                    {formLoading ? (
                      <LoadingInput />
                    ) : (
                      <>
                        <InputField
                          name="rentals_data[occupation_name]"
                          label="Occupation Name"
                          className={`${applicationStage === "bound" ? "input-disabled" : ""
                            }`}
                          inputProps={{ readOnly: applicationStage === "bound" }}
                          value={loadedApplicationData?.rentals_data?.occupation_name}
                        />
                        <span style={{ display: "none" }}>
                          <InputField
                            name="edit_form"
                            label="edit_form"
                            defaultValue={loadedApplicationData?.insured_name}
                          />
                        </span>
                      </>
                    )}
                  </GridItem>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <GridItem>
                    {formLoading ? (
                      <LoadingInput />
                    ) : (
                      <>
                        <InputField
                          name="rentals_data[income]"
                          label="Income"
                          startAdornment="$"
                          type="number"
                          min={0}
                          value={loadedApplicationData?.rentals_data?.income}
                        //onBlur={() => handleBlur("income", "verifyIncome")}
                        />
                        {/* <div className="data-verify-checkbox">
                      <Checkbox
                        name="verifyIncome"
                        checked={state["verifyIncome"]}
                        disabled={!form.getValues("rentals_data[income]")}
                        style={{ padding: 0, marginRight: "5px" }}
                        onChange={handleChange}
                      />
                      <label>Verify Income</label>
                    </div> */}
                      </>
                    )}
                  </GridItem>
                </Grid>
                <div className="contact-group-label">
                  <span>Porperty Details</span>
                </div>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <GridItem>
                    {formLoading ? (
                      <LoadingInput />
                    ) : (
                      <>
                        <SelectForm
                          name="rentals_data[propertyInfo][dwelling_type]"
                          label="Type of dwelling"
                          isClearable={false}
                          options={["Apartment", "Condo", "Single-family rental", "Other"]
                            .map((item) => ({
                              value: item,
                              label: item,
                            }))
                            .sort()}
                          defaultValue={loadedApplicationData?.rentals_data?.propertyInfo?.dwelling_type}
                        />
                      </>
                    )}
                  </GridItem>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <GridItem>
                    {formLoading ? (
                      <LoadingInput />
                    ) : (
                      <>
                        <SelectForm
                          name="rentals_data[propertyInfo][construction_type]"
                          label="Construction Type"
                          isClearable={false}
                          options={["Brick", "Wood frame", "Other"]
                            .map((item) => ({
                              value: item,
                              label: item,
                            }))
                            .sort()}
                        />
                      </>
                    )}
                  </GridItem>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <GridItem>
                    <InputField
                      name="rentals_data[propertyInfo][year_built]"
                      label="Year built"
                      type="number"
                    />
                  </GridItem>
                </Grid>
                <div className="contact-group-label">
                  <span>Safety Features</span>
                </div>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <GridItem>
                    {formLoading ? (
                      <LoadingInput />
                    ) : (
                      <>
                        <Checkbox
                          name="rentals_data[propertyInfo][safety_smoke_detector]"
                          // checked={state["verifySafetySmokeDetector"]}
                          // disabled={!form.getValues("safetySmokeDetector")}
                          style={{ padding: 0, marginRight: "5px" }}
                          onChange={handleChange}
                        />
                        <label>Smoke detectors</label>
                      </>
                    )}
                  </GridItem>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <GridItem>
                    {formLoading ? (
                      <LoadingInput />
                    ) : (
                      <>
                        <Checkbox
                          name="rentals_data[propertyInfo][safety_sprinkler]"
                          // checked={state["verifySafetySprinkler"]}
                          // disabled={!form.getValues("safetySprinkler")}
                          style={{ padding: 0, marginRight: "5px" }}
                          onChange={handleChange}
                        />
                        <label>Sprinkler systems</label>
                      </>
                    )}
                  </GridItem>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <GridItem>
                    {formLoading ? (
                      <LoadingInput />
                    ) : (
                      <>
                        <Checkbox
                          name="rentals_data[propertyInfo][safety_deadbolt]"
                          // checked={state["verifySafetyDeadbolt"]}
                          // disabled={!form.getValues("safetyDeadbolt")}
                          style={{ padding: 0, marginRight: "5px" }}
                          onChange={handleChange}
                        />
                        <label>Deadbolts</label>
                      </>
                    )}
                  </GridItem>
                </Grid>


                {/* <div className="contact-group-label">
                <span>Insurance Contact Details</span>
              </div>
              {insuranceContacts?.map((field, index) => (
                <InsuranceContactDetails
                  key={field.tempId}
                  index={index}
                  field={field}
                  removeInsuranceContact={(id: any) =>
                    removeInsuranceContact(id)
                  }
                  errors={form.errors}
                />
              ))}
              <Button
                type="button"
                color="default"
                variant="outlined"
                disabled={
                  insertLoading || formLoading || insuranceContacts.length > 4
                }
                startIcon={<AddIcon />}
                onClick={() => addInsuranceContact({ name: "", email: "" })}
                className="contact-group-add-btn"
              >
                Add New Insurance contact
              </Button> */}

                {/* <div className="contact-group-label">
                <span>Security Contact Details</span>
              </div>
              {securityContacts?.map((field, index) => (
                <>
                  <SecurityContactDetails
                    key={field.tempId}
                    index={index}
                    field={field}
                    removeSecurityContact={(id: any) => {
                      removeSecurityContact(id);
                    }}
                    errors={form.errors}
                  />
                </>
              ))}
              <Button
                type="button"
                color="default"
                variant="outlined"
                disabled={
                  insertLoading || formLoading || insuranceContacts.length > 4
                }
                startIcon={<AddIcon />}
                onClick={() => {
                  addSecurityContact({ name: "", email: "" });
                }}
                className="contact-group-add-btn"
              >
                Add New Security contact
              </Button> */}

                <Grid size={{ xs: 12, sm: 12 }}>
                  <GridItem>
                    {/* {!allVerified && (
                  <Alert severity="warning" className="tnc-alert-warning">
                    To enable Terms & Conditions you must be Address
                  </Alert>
                )} */}

                    <span style={{ display: "none" }}>
                      <InputField
                        name="disclaimer"
                        label="disclaimer"
                        value={disclaimerCheck}
                      />
                    </span>
                    <div className="profile-tnc-wrapper">
                      <Checkbox
                        name="disclaimercheckbox"
                        disabled={!allVerified}
                        checked={disclaimerCheck}
                        style={{ padding: 0, marginRight: "5px" }}
                        onChange={handleDisclaimerChange}
                      />

                      <div className="profile-tnc-content">
                        <p className="tnc-text">
                          I DECLARE that, the above statements, information, and
                          particulars provided are true, and I have not suppressed
                          or misstated any material fact, and that I agree that this
                          information provided shall be the basis of the contract
                          with the underwriters.
                        </p>
                        <p>
                          <span>Signature of Broker : </span>
                          {form.watch("insurance_contacts")[0]?.name}
                        </p>
                        <p>
                          <span>
                            Name/title of person authorized to sign on behalf of
                            applicant :
                          </span>{" "}
                          {brokerName}
                        </p>
                        <p>
                          <span>Date : </span>
                          {DateTime.now().toLocaleString(DateTime.DATE_MED)}
                        </p>
                      </div>

                      {!disclaimerCheck ? (
                        <span
                          style={{
                            display: "block",
                            color: "red",
                            fontWeight: 500,
                            marginLeft: "32px",
                            fontSize: "14px",
                          }}
                        >
                          {form.formState.errors["disclaimer"]?.message as string}
                        </span>
                      ) : (
                        <></>
                      )}
                    </div>
                  </GridItem>
                </Grid>
              </Grid>
              <ButtonsContainer justifyContent="flex-end">
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  disabled={insertLoading || formLoading}
                  endIcon={<ButtonLoading loading={insertLoading} />}
                >
                  Next
                </Button>
              </ButtonsContainer>
            </Grid>
          </form>
        </FormProvider>
      </Card>
    </>
  );
};

export default ProfilePage;

const contactValidate = (error: any, fieldName: string) => {
  if (error && error[fieldName]?.message) {
    return true;
  } else {
    return false;
  }
};

const ContactValidateMessage = (props: any) => {
  const { error, fieldName } = props;

  if (error && error[fieldName]) {
    return <p className="error-text">{error[fieldName].message}</p>;
  }
  return <></>;
};

const DeleteContact = React.memo((props: any) => {
  const { index, field, removeContact } = props;

  const [openDeleteContact, setOpenDeleteContact] = useState(false);

  const [
    deleteInsuredContact,
    { loading: deleteInsuredContactLoading, error: deleteInsuredContactError },
  ] = useDeleteInsuredOrgContactMutationMutation({
    errorPolicy: "all",
  });

  const handleClickOpen = () => {
    if (field.hasOwnProperty("id")) {
      setOpenDeleteContact(true);
    } else {
      removeContact(index);
    }
  };

  const handleClose = () => {
    setOpenDeleteContact(false);
  };

  const deleteContact = async () => {
    if (field.hasOwnProperty("id") || field.id !== "") {
      const { id } = field;
      const deletedContact = await deleteInsuredContact({
        variables: {
          id,
        },
      });

      if (deletedContact.data?.delete_insured_organization_contact_by_pk?.id) {
        removeContact(index);
        setOpenDeleteContact(false);
      }
    }
  };

  return (
    <>
      <IconButton
        aria-label="delete"
        onClick={handleClickOpen}
        disabled={deleteInsuredContactLoading}
      >
        <DeleteIcon />
      </IconButton>
      {openDeleteContact && (
        <ConfirmationModal
          open={openDeleteContact}
          onClose={handleClose}
          title="Are you sure?"
          message="Do you want to delete this contact? This action cannot be undone."
          onConfirm={deleteContact}
          confirmButtonText="Delete"
        />
      )}
      <ErrorToast
        error={deleteInsuredContactError}
        processCustomError={() =>
          `Unable to delete contac - ${deleteInsuredContactError?.message}`
        }
      />
    </>
  );
});

const InsuranceContactDetails = (props: any) => {
  const { index, field, removeInsuranceContact, errors } = props;

  const error = errors?.insurance_contacts || [];

  return (
    <div className="profile-contact-details-row">
      <Grid size={{ xs: 12, sm: 6 }}>
        <GridItem>
          <InputField
            defaultValue={field.name}
            name={`insurance_contacts[${index}].name`}
            label="Contact name"
            error={contactValidate(error[index], "name")}
          />
          <ContactValidateMessage error={error[index]} fieldName="name" />
        </GridItem>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <GridItem>
          <InputField
            defaultValue={field.email}
            name={`insurance_contacts[${index}].email`}
            label="Contact Email"
            error={contactValidate(error[index], "email")}
          />
          <ContactValidateMessage error={error[index]} fieldName="email" />
        </GridItem>
      </Grid>
      <InputField
        defaultValue={`insurance`}
        name={`insurance_contacts[${index}].type`}
        label="Contact type"
        className="hide"
      />
      {index > 0 && (
        <DeleteContact
          index={index}
          field={field}
          removeContact={(id: any) => removeInsuranceContact(id)}
        />
      )}
    </div>
  );
};

const SecurityContactDetails = (props: any) => {
  const { index, field, removeSecurityContact, errors } = props;
  const error = errors?.security_contacts || [];
  return (
    <div className="profile-contact-details-row">
      <Grid size={{ xs: 12, sm: 6 }}>
        <GridItem>
          <InputField
            defaultValue={field.name}
            name={`security_contacts[${index}].name`}
            label="Contact name"
            error={contactValidate(error[index], "name")}
          />
          <ContactValidateMessage error={error[index]} fieldName="name" />
        </GridItem>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <GridItem>
          <InputField
            defaultValue={field.email}
            name={`security_contacts[${index}].email`}
            label="Contact Email"
            error={contactValidate(error[index], "email")}
          />
          <ContactValidateMessage error={error[index]} fieldName="email" />
        </GridItem>
      </Grid>
      <InputField
        defaultValue="security"
        name={`security_contacts[${index}].type`}
        label="Contact type"
        className="hide"
      />
      {index >= 0 && (
        <DeleteContact
          index={index}
          field={field}
          removeContact={(id: any) => removeSecurityContact(id)}
        />
      )}
    </div>
  );
};
