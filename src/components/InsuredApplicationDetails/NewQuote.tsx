// React Imports
import React from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
// Material UI
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";

// Graphql
import {
  useNewInsuranceQuoteMutation,
  NewInsuranceQuoteMutationVariables,
  useUpdateInsuranceQuoteMutation,
  UpdateInsuranceQuoteMutationVariables,
} from "generated/graphql";

// Local Imports
import ApolloErrorToast from "components/Toast/ApolloErrorToast";
import { ApplicationParams } from "./index";

// Classes
const useStyles = makeStyles((theme: Theme) => ({
  container: {
    height: "100%",
    paddingBottom: 100,
  },
  buttons: {
    zIndex: 1,
    borderTop: "1px solid #b3b7bd",
    position: "fixed",
    bottom: 0,
    left: 400,
    paddingBottom: theme.spacing(1),
    paddingTop: theme.spacing(1),
    width: "calc(100vw - 400px)",
    display: "flex",
    backgroundColor: "#b3b7bd",
  },
  buttonContainer: {
    marginLeft: "auto",
    marginRight: 120,
  },
  button: {
    marginRight: theme.spacing(1),
  },
}));

// Interfaces
interface Props {
  handleSubmitCallback: () => void;
  quote?: any;
}

const NewQuote: React.FC<Props> = ({ handleSubmitCallback, quote }) => {
  const { handleSubmit, register, setValue } = useForm();
  const classes = useStyles();

  const params = useParams<ApplicationParams>();

  const [
    insertInsuaranceQuote,
    { loading: insertLoading, error: insertError },
  ] = useNewInsuranceQuoteMutation({
    errorPolicy: "all",
  });

  const [updateInsuranceQuote, { loading: updateLoading }] =
    useUpdateInsuranceQuoteMutation({
      errorPolicy: "all",
    });

  const handleFormSubmit = async (data: NewInsuranceQuoteMutationVariables) => {
    const createdData = await insertInsuaranceQuote({
      variables: {
        ...data,
        tax_percentage: data.tax_percentage === "" ? 0 : data.tax_percentage,
        insurance_application_id: params.id,
      },
      refetchQueries: ["applicationQuote"],
    });

    if (createdData.errors) {
      console.log(createdData.errors);
    } else {
      handleSubmitCallback();
    }
  };

  const handleFormSubmitUpdate = async (
    data: UpdateInsuranceQuoteMutationVariables
  ) => {
    const createdData = await updateInsuranceQuote({
      variables: {
        ...data,
        tax_percentage: data.tax_percentage === "" ? 0 : data.tax_percentage,
        id: quote.id,
      },
      refetchQueries: ["applicationQuote"],
    });
    if (createdData.errors) {
      console.log(createdData.errors);
    }
    handleSubmitCallback();
  };

  const handleBackOnClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    handleSubmitCallback();
  };

  if (quote !== null) {
    setValue(
      "policy_limit",
      quote.policy_limit !== null
        ? quote.policy_limit.replace(/,|\$/g, "")
        : 0.0
    );
    setValue(
      "base_premium",
      quote.base_premium !== null
        ? quote.base_premium.replace(/,|\$/g, "")
        : 0.0
    );
    setValue(
      "deductible",
      quote.deductible !== null ? quote.deductible.replace(/,|\$/g, "") : 0.0
    );
    setValue(
      "other_deductibles",
      quote.other_deductibles !== null
        ? quote.other_deductibles.replace(/,|\$/g, "")
        : 0.0
    );
    setValue(
      "commission_percentage",
      quote.commission_percentage !== null ? quote.commission_percentage : 0
    );
    setValue(
      "tax_percentage",
      quote.tax_percentage !== null ? quote.tax_percentage : 0
    );
    setValue(
      "premium",
      quote.premium !== null ? quote.premium.replace(/,|\$/g, "") : 0.0
    );
    setValue(
      "total_premium",
      quote.total_premium !== null
        ? quote.total_premium.replace(/,|\$/g, "")
        : 0.0
    );
  }

  return (
    <>
      <form
        onSubmit={
          quote === null
            ? handleSubmit(handleFormSubmit)
            : handleSubmit(handleFormSubmitUpdate)
        }
      >
        <ApolloErrorToast error={insertError} />
        <Grid container spacing={3} className={classes.container}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="policy_limit"
              label="Policy Limit"
              type="number"
              required
              fullWidth
              inputRef={register}
              inputProps={{
                step: 0.01,
                min: 0,
                max: 10000000,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="base_premium"
              label="Base Premium"
              type="number"
              required
              fullWidth
              inputRef={register}
              inputProps={{
                step: 0.01,
                min: 0,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="deductible"
              label="Deductible"
              type="number"
              required
              defaultValue="0.00"
              fullWidth
              inputRef={register}
              inputProps={{
                step: 0.01,
                min: 0,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="other_deductibles"
              label="Other Deductibles"
              type="number"
              defaultValue="0.00"
              fullWidth
              inputRef={register}
              inputProps={{
                step: 0.01,
                min: 0,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="commission_percentage"
              label="Commission Percentage"
              type="number"
              defaultValue="0"
              required
              fullWidth
              inputRef={register}
              inputProps={{
                // step: 0.01,
                min: 0,
                max: 100,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">%</InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="tax_percentage"
              label="Tax Percentage"
              type="number"
              defaultValue="0"
              fullWidth
              inputRef={register}
              inputProps={{
                // step: 0.01,
                min: 0,
                max: 100,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">%</InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="premium"
              label="Premium"
              type="number"
              required
              fullWidth
              inputRef={register}
              inputProps={{
                step: 0.01,
                min: 0,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="total_premium"
              label="Total Premium"
              type="number"
              required
              fullWidth
              inputRef={register}
              inputProps={{
                step: 0.01,
                min: 0,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        <div className={classes.buttons}>
          <div className={classes.buttonContainer}>
            <Button
              color="primary"
              className={classes.button}
              disabled={insertLoading || updateLoading}
              onClick={handleBackOnClick}
            >
              Back
            </Button>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              className={classes.button}
              disabled={insertLoading || updateLoading}
            >
              {insertLoading || updateLoading ? (
                <CircularProgress size={20} />
              ) : quote === null ? (
                "Add Quote"
              ) : (
                "Update Quote"
              )}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
};

export default NewQuote;
