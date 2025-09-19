import React from "react";
import { useNavigate } from "react-router";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import Button from "@mui/material/Button";
import { Grid } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import InputField from "components/From/InputField";
import { yupResolver } from "@hookform/resolvers/yup";
import { getDomain, getHostName, webAddress } from "utils";
import * as yup from "yup";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
// import DefaultLogo from "waratah-logo.svg";
import DefaultLogo from "./visionxlogo.jpg";
import Footer from "components/Footer";
import { useGetOrgDetailByDomainMutation } from "generated/graphql";
import ButtonLoading from "components/From/ButtonLoading";
import ErrorToast from "components/Toast/ErrorToast";
import validator from "validator";
import GridItem from "components/Layout/GridItem";

const useStyles = makeStyles((theme: Theme) => ({
  landingWrapper: {
    textAlign: "center",
    padding: "3rem 1.5rem",
    "& img": {
      marginTop: "3rem",
      maxWidth: "100%",
      width: "650px",
      height: "auto",
    },
  },
}));

const schema = yup.object().shape({
  domain: yup.string().required("Domain name is required"),
  //.matches(webAddress, "Invalid Domain name"),
});

const ApplicationLandingPage: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [
    fetchOrgData,
    { loading: fetchOrgDataLoading, error: fetchOrgDataError },
  ] = useGetOrgDetailByDomainMutation({
    errorPolicy: "all",
  });

  const form = useForm({
    resolver: yupResolver(schema),
  });
  const { handleSubmit } = form;

  const handleFormSubmit = async (formData: any) => {  
    // Get the hostname
    let domain = formData.domain;
    try {
      domain = getDomain(formData.domain);
    } catch (error) {
      form.setError("domain", {
        message: "Invalid web address",
      });
      return false;
    }
    
    if (domain !== "" && !validator.isFQDN(domain)) {
      form.setError("domain", {
        message: "Invalid web address",
      });
      return false;
    }
    const { data } = await fetchOrgData({
      variables: {
        domain: domain,
      },
    });
    if (data?.searchDnB) {
      const {
        address,
        city,
        revenue,
        state,
        zip,
        employees,
        industry,
        insured_name,
      } = data?.searchDnB;
      navigate("/applications/create", {
        state: {
          domain: getDomain(domain),
          city,
          address,
          revenue,
          state,
          zip,
          employees,
          industry,
          insured_name,
        }
      });
    }
  };

  return (
    <>
      <ErrorToast
        error={fetchOrgDataError}
        processCustomError={() =>
          `Unable to check domain information - ${fetchOrgDataError?.message}`
        }
      />
      <Grid container alignItems="center" className="landing-page-wrapper">
        <Grid size={{xs: 12, md: 6}}>
          <GridItem className={classes.landingWrapper}>
            <img alt="" src={`/assets/images/broker-landing-page.svg`} />
          </GridItem>
        </Grid>
        <Grid size={{xs: 12, md: 6}}>
          <GridItem className={classes.landingWrapper}>
            <div className="landing-inner-wrap">
              <FormProvider {...form}>
                <form onSubmit={handleSubmit(handleFormSubmit)}>
                  <div className="flex flex-row item-flex-start landingpageFormWrapper">
                    <InputField
                      name="domain"
                      label="Enter Domain Name"
                      variant="outlined"
                      size="medium"
                      shrinkLabel={false}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      size="medium"
                      type="submit"
                      disabled={fetchOrgDataLoading}
                      endIcon={
                        fetchOrgDataLoading ? (
                          <ButtonLoading loading={fetchOrgDataLoading} />
                        ) : (
                          <ArrowForwardIosIcon />
                        )
                      }
                    >
                      Start
                    </Button>
                  </div>
                </form>
              </FormProvider>
              <div className="devider">
                <span>OR</span>
              </div>
              <div className="btn-view-all-application">
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  type="submit"
                  endIcon={<ArrowForwardIosIcon />}
                  onClick={() => navigate("/applications")}
                >
                  View all Applications
                </Button>
              </div>
              <div className="waratah-logo">
                <img alt="Logo" src={DefaultLogo} />
              </div>
            </div>
          </GridItem>
        </Grid>
      </Grid>
      <Footer />
    </>
  );
};

export default ApplicationLandingPage;
