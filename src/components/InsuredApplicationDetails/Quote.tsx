// React Imports
import React, { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import Button from "@mui/material/Button";
import {
  useApplicationQuoteQuery,
  UpdateInsuranceDatesMutationVariables,
  useUpdateInsuranceDatesMutation,
  useGetTenantSettingsQuery,
  useWatchScanResultSubscription,
  InsuranceArtifactSubscriptionResult,
  useGetInsuranceQuoteEmailSubscription,
  Recipient,
  useUpdatePremiumDataMutation,
  UpdatePremiumInput,
  useWatchQuotesSubscription,
  useWatchLatestQuotePdfQuoteIdsByAppIdSubscription,
  useManualTriggerScanMutation,
} from "generated/graphql";
import NewQuote from "./NewQuote";
import ApolloErrorToast from "components/Toast/ApolloErrorToast";
import { ApplicationParams, getFileName } from "./index";
import Card from "components/Layout/Card";
import ButtonsContainer from "components/Layout/ButtonsContainer";
import ButtonLoading from "components/From/ButtonLoading";
import InputField from "components/From/InputField";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Alert from "@mui/material/Alert";
import {
  LoadingInput,
  LoadingQuoteCard,
  LoadingQuoteSelectionsCard,
  LoadingScanStatus,
  LoadingScanVirdict,
} from "components/ContentLoaders";
import { currencyFormatter, currencyFormatterWithCents } from "utils";
import ScanVerdictDetailModal from "./ScanVerdictDetail";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from '@mui/material/LinearProgress';
import LinearBuffer from "./LinearBuffer";
import { dowloadInsuredArtifact } from "./downloads";
import ModalWindow from "components/ModalWindow";
import ContactDetail from "./QuoteContacts";
import FeatureFlag from "utils/FeatureFlag";
import { useUser } from "components/Auth/CognitoHooks";
import { Checkbox, IconButton, TextField, Tooltip } from "@mui/material";
import { AttachmentOutlined, AttachmentRounded, Check, Close, Edit, Error, PinDrop } from "@mui/icons-material";
import ToastMessage from "components/Toast/ToastMessage";
import CustomQuote from "./CustomQuote";
import QuoteSelector from "./QuoteSelector";
import GridItem from "components/Layout/GridItem";

// Styles
const useStyles = makeStyles((theme: Theme) => ({
  dateFieldsWrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    justifyContent: "space-between",
    "& .MuiFormControl-marginNormal": {
      marginTop: 0,
      marginBottom: 0,
    },
  },
  textGrey: {
    color: "#B4B4B4",
    fontSize: "14px",
  },
  textBlack: {
    color: "#333333",
    fontSize: "16px",
    fontWeight: 600,
  },
  quotesTable: {
    width: "100%",
    "& tr td": {
      verticalAlign: "bottom",
    },
    "& tr td:last-child": {
      textAlign: "right",
    },
    "& span": {
      display: "block",
    },
  },
  showMore: {
    position: "relative",
    overflow: "hidden",
    textAlign: "center",
    cursor: "pointer",
    "& span": {
      display: "inline-block",
      width: "32px",
      height: "32px",
      border: "1px solid #CCC",
      borderRadius: "50%",
      background: "#FFF",
      position: "relative",
      zIndex: 2,
      "& svg": {
        transition: "all 0.5s",
        transform: "rotate(0deg)",
      },
    },
    "&.active span svg": {
      transform: "rotate(180deg)",
    },
    "& hr": {
      position: "absolute",
      width: "100%",
      top: "10px",
      zIndex: 1,
      opacity: 0.3,
    },
  },
  selectQuoteBtn: {
    textAlign: "center",
    paddingTop: "0.5rem",
    cursor: "pointer",
  },
  editPremiumToolbar: {
    display: "inline-flex !important",
    width: "0",
    position: "relative",
    right: "-8px",
  },
  editPremiumBtn: {
    padding: '0',
    fontSize: "17px",
  },
  editPremiumBtnIcon: {
    fontSize: "17px",
  },
  editPremiumInput: {
    fontSize: "14px !important",
    paddingLeft: "45px",
    "& input": {
      fontSize: "13px",
      textAlign: "right",
    },
    '& input[type="number"]': {
      '-moz-appearance': 'textfield', // Firefox
      'appearance': 'textfield',      // Chrome, Safari, Edge
    },
    '& input[type="number"]::-webkit-outer-spin-button': {
      'WebkitAppearance': 'none', // Chrome, Safari
      margin: 0,
    },
    '& input[type="number"]::-webkit-inner-spin-button': {
      'WebkitAppearance': 'none', // Chrome, Safari
      margin: 0,
    },
  },
  quoteSelectCheckBoxWrapper: {
    position: 'absolute',
    top: '10px',
    left: '10px',
  },
  quoteInPDFWrapper: {
    position: 'absolute',
    top: '10px',
    right: '10px',
  }
}));

export const maximumQuoteCount = 3;

interface QuoteProps {
  handleStageChange: (stage: string) => void;
  selectedQuoteId?: number;
  applicationStage?: String;
  riskScore: number;
  scanData?: any;
  scanLoading?: boolean;
  artifactDataSubscription?: InsuranceArtifactSubscriptionResult;
  fileRefetch: any;
  setQuoteDownloadLoading: any;
}

const Quote: React.FC<QuoteProps> = ({
  handleStageChange,
  selectedQuoteId,
  applicationStage,
  riskScore,
  scanData,
  scanLoading,
  artifactDataSubscription,
  fileRefetch,
  setQuoteDownloadLoading
}) => {
  const classes = useStyles();
  const params = useParams<ApplicationParams>();

  const [newQuote, setNewQuote] = useState(false);
  const [editQuote, setEditQuote] = useState<any>(false);
  const [selectQuote, setSelectQuote] = useState(
    selectedQuoteId ? selectedQuoteId : 0
  );
  const [quoteDownload, setQuoteDownload] = useState(false);
  const [showQuoteEmailModal, setShowQuoteEmailModal] = useState(false);

  const [quoteUpdateLoading, setQuoteUpdateLoading] = useState(false);

  const [customQuoteFormOpen, setcustomQuoteFormOpen] = useState<boolean>(false);
  const [quoteSelectionMode, setQuoteSelectionMode] = useState<boolean>(false);
  const [pdfSelectedIds, setPdfSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    setQuoteDownloadLoading(quoteUpdateLoading);
  }, [quoteUpdateLoading]);

  useEffect(() => {
    if (!quoteSelectionMode) {
      setPdfSelectedIds([]);
    }
  }, [quoteSelectionMode]);

  const [showToastMessage, setToastMessage] = useState<{ show?: boolean, message?: string, type?: 'error' | 'success' }>({});

  const form = useForm();
  const { register, handleSubmit, setValue, getValues, watch } = form;

  const dateSelected = watch("effective_date");

  const [
    manualTriggerScan,
    { loading: manualTriggerScanLoading, error: manualTriggerScanError }
  ] = useManualTriggerScanMutation({
    errorPolicy: "all"
  });

  const [
    updateInsuaranceDates,
    { loading: updateLoading, error: updateError },
  ] = useUpdateInsuranceDatesMutation({
    errorPolicy: "all",
  });

  const emailDataSubscription = useGetInsuranceQuoteEmailSubscription({
    variables: { applicationid_id: params.id || '' }
  });

  const { loading: pdfQuoteIdsDataLoading, data: pdfQuoteIdsData } = useWatchLatestQuotePdfQuoteIdsByAppIdSubscription({
    variables: {
      applicationId: params.id
    }
  });

  const handleNewQuoteOnClick = () => {
    setNewQuote(!newQuote);
  };

  const handleQuoteEditDone = () => {
    setEditQuote(false);
  };
  React.useEffect(() => {
    if (selectQuote > 0) {
      setSelectQuoteMsg(false);
    }
  }, [selectQuote]);

  const handleSubmitOnClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    if (selectQuote === 0) {
      setSelectQuoteMsg(true);
    } else {
      const data = {
        id: params.id,
        expiration_date: getValues("expiration_date"),
        effective_date: getValues("effective_date"),
        stage: "bound",
        quote_id: selectQuote,
      };
      handleFormSubmit(data);
    }
  };

  const handleFormSubmit = async (
    data: UpdateInsuranceDatesMutationVariables
  ) => {
    const createdData = await updateInsuaranceDates({
      variables: {
        ...data,
      },
    });

    if (!createdData.errors) {
      handleStageChange("bound");
    }
  };

  const handleOnChangeEffectiveDate = (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setValue("expiration_date", getExpirationDate(event.currentTarget.value));
  };

  const getExpirationDate = (dateString: string) => {
    const date = new Date(dateString);
    date.setFullYear(date.getFullYear() + 1);
    date.setDate(date.getDate() + 1);
    const newDate =
      date.getFullYear() +
      "-" +
      (date.getMonth() + 1 < 10
        ? "0" + (date.getMonth() + 1)
        : date.getMonth() + 1) +
      "-" +
      (date.getDate() - 1 < 10
        ? "0" + (date.getDate() - 1)
        : date.getDate() - 1);
    return newDate;
  };

  const retriggerScan = async () => {
    console.log("Triggering manual scan");

    const { data, errors } = await manualTriggerScan({
      variables: {
        applicationId: params.id
      }
    });

    if (errors) {
      console.log(errors);
      setToastMessage({
        message: "Error re-triggering scan",
        type: 'error',
        show: true,
      });
    } else {
      setToastMessage({
        message: `Scan re-triggered successfully`,
        type: 'success',
        show: true,
      });
    };
    console.log(scan_result);
  };

  const { data, loading } = useApplicationQuoteQuery({
    variables: {
      id: params.id,
    },
    fetchPolicy: "network-only",
  });

  const { data: tenantData, loading: tenantLoading } =
    useGetTenantSettingsQuery();

  const [selectQuoteMsg, setSelectQuoteMsg] = React.useState(false);

  const { loading: watchLoading, data: watchUpdate } =
    useWatchScanResultSubscription({
      variables: {
        applicationId: params.id,
      },
    });

  const { loading: watchQuotesLoading, data: watchQuotes } =
    useWatchQuotesSubscription({
      variables: {
        applicationId: params.id
      }
    });

  let pdfQuoteIdsArr: Array<number> = [];

  const pdfQuoteIds = pdfQuoteIdsData?.insurance_application_artifact[0]
    ?.insurance_quote_pdf_selection_artifacts[0]
    ?.insurance_quote_pdf_selections || [];

  if (pdfQuoteIds.length > 0) {
    pdfQuoteIds.map((i) => {
      pdfQuoteIdsArr.push(i.quote_id);
    });

    // const pdfQuoteIds = watchQuotes?.insurance_quote || [];

    // if (pdfQuoteIds.length > 0) {
    //   pdfQuoteIds.map((i) => {
    //     pdfQuoteIdsArr.push(i.id);
    //   });

    // //if new selection does not contain previously selected quoteId, removed it
    // !(pdfQuoteIdsArr.includes(selectQuote)) {
    //   setSelectQuote(0);
    // }
  }

  const selectionHasSelectedQuote = pdfQuoteIdsArr.includes(selectQuote);

  const scan_result = watchUpdate?.external_scan[0]?.scan_result?.verdict;

  const quoteLoading = loading || tenantLoading || watchQuotesLoading;

  const scanRequired = Boolean(
    tenantData?.me[0].broker_producer?.broker_agency.tenant?.scan_required
  );

  const quoteCount = watchQuotes?.insurance_quote && watchQuotes?.insurance_quote?.length || 0;

  const updateQuotePDFIdSelection = (selected: boolean, quoteId: number) => {
    const exists: boolean = pdfSelectedIds.includes(quoteId);

    if (selected && !exists) {
      setPdfSelectedIds(a => [...a, quoteId]);
    } else if (!selected && exists) {
      setPdfSelectedIds(a => a.filter(i => i !== quoteId));
    }
  };

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

  //get latest quote uri
  let latestQuoteUri: any;
  if (artifactDataSubscription?.data?.insurance_application_artifact && artifactDataSubscription.data.insurance_application_artifact.length > 0) {
    const latestQuote = artifactDataSubscription?.data?.insurance_application_artifact.filter(i => i.file_type === "quote").pop();

    if (latestQuote) {
      latestQuoteUri = latestQuote.file_uri;
    }
  }

  if (newQuote || editQuote) {
    return (
      <NewQuote
        handleSubmitCallback={
          editQuote ? handleQuoteEditDone : handleNewQuoteOnClick
        }
        quote={
          editQuote
            ? data?.insurance_application_by_pk?.insurance_quotes[
            editQuote - 1
            ]!
            : null
        }
      />
    );
  } else {
    return (
      <>
        {toastMessageComponent}
        <Card shadow={false}>
          <FormProvider {...form}>
            <ApolloErrorToast error={updateError} />
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <Grid container spacing={4}>
                <Grid sx={{ xs: 12, md: 6 }}>
                  <GridItem>
                    <div
                      className={`date-fields-wrapper ${classes.dateFieldsWrapper}`}
                    >
                      {quoteLoading ? (
                        <LoadingInput />
                      ) : (
                        <InputField
                          name="effective_date"
                          label="Effective Date"
                          type="date"
                          defaultValue={
                            data?.insurance_application_by_pk?.effective_date
                          }
                          onChange={() =>
                            setValue(
                              "expiration_date",
                              getExpirationDate(form.getValues("effective_date"))
                            )
                          }
                        />
                      )}

                      {quoteLoading ? (
                        <LoadingInput />
                      ) : (
                        <InputField
                          name="expiration_date"
                          label="Expiration Date"
                          type="date"
                          defaultValue={
                            data?.insurance_application_by_pk?.expiration_date
                              ? data?.insurance_application_by_pk?.expiration_date
                              : data?.insurance_application_by_pk?.effective_date
                                ? getExpirationDate(
                                  data?.insurance_application_by_pk
                                    ?.effective_date
                                )
                                : ""
                          }
                        />
                      )}
                    </div>
                  </GridItem>
                </Grid>
                <Grid sx={{ xs: 12, md: 6 }}>
                  <GridItem>
                    {quoteLoading ? (
                      <LoadingScanVirdict />
                    ) : (
                      <div className="scan-verdict-wrapper">
                        <Card shadow={false} legendTitle="External Risk Factors">
                          <div className="scan-alert">
                            {watchLoading || scanLoading ? (
                              <LoadingScanStatus />
                            ) : (
                              <>
                                <ScanStatus
                                  scanData={scanData}
                                  retriggerScan={retriggerScan}
                                  manualTriggerLoading={manualTriggerScanLoading}
                                />
                              </>
                            )}
                          </div>
                        </Card>
                      </div>
                    )}
                  </GridItem>
                </Grid>

              </Grid>

              <br />

              <Grid container spacing={4}>
                <Grid sx={{ xs: 12, md: 6 }}>
                  <GridItem>
                    <div className="scan-verdict-wrapper">
                      <Card shadow={false} legendTitle="Quote PDF">
                        <div className="scan-alert">
                          {
                            applicationStage !== "declined" && (artifactDataSubscription?.loading || !artifactDataSubscription?.data?.insurance_application_artifact?.length || quoteUpdateLoading)
                              ? <>Preparing Quote PDF....</>
                              : (
                                <Alert severity="info">
                                  Quote PDF Generated: {' '}
                                  <Button
                                    className="btn-verdict"
                                    disabled={quoteSelectionMode || applicationStage === "declined"
                                      //|| (!scan_result || (scan_result === 'pending' || scan_result === 'failed' || scan_result === 'reject')) 
                                      ? true : quoteDownload}
                                    onClick={() => {
                                      setQuoteDownload(true);
                                      dowloadInsuredArtifact(
                                        fileRefetch,
                                        latestQuoteUri || '',
                                        getFileName(latestQuoteUri as string, latestQuoteUri?.replace(".pdf", "") as string) || "Quote",
                                        () => setQuoteDownload(false)
                                      );
                                    }}
                                  >
                                    {
                                      (false
                                        //applicationStage !== "declined" 
                                        //&& (!scan_result || scan_result === 'pending')
                                      )
                                        ? (<>Waiting for scan data....</>)
                                        : (quoteDownload ? <CircularProgress style={{ marginLeft: 5 }} size={18} /> : 'Download')
                                    }
                                  </Button>

                                </Alert>
                              )
                          }
                        </div>
                      </Card>
                    </div>
                  </GridItem>
                </Grid>

                <Grid sx={{ xs: 12, md: 6 }}>
                  <GridItem>
                    <div className="scan-verdict-wrapper">
                      <FeatureFlag
                        roles={["broker_power"]}
                        fallbackRender={() =>
                          // start fallback renderer
                          <Card shadow={false} legendTitle="E-mail Quotes">
                            <div className="scan-alert">

                              <Alert severity="info">
                                E-Mail Quotes {' '} <Button
                                  className="btn-verdict"
                                  onClick={() => setShowQuoteEmailModal(true)}
                                  disabled={applicationStage === "declined"
                                    // || (!scan_result || scan_result === 'failed' || scan_result === 'reject') 
                                    ? true : false}
                                >
                                  Send Quotes
                                </Button>
                              </Alert>
                              {
                                showQuoteEmailModal && (
                                  <ModalWindow
                                    showModal={showQuoteEmailModal}
                                    size="md"
                                    title="Send Quote Details"
                                    setShowModal={() => setShowQuoteEmailModal(false)}
                                  >
                                    <ContactDetail
                                      fileRefetch={fileRefetch}
                                      artifactDataSubscription={artifactDataSubscription}
                                      disableSend={(
                                        quoteUpdateLoading
                                        // || !scan_result || scan_result === 'pending'
                                      )}
                                      disableButtonText={
                                        quoteUpdateLoading ? "Waiting for quote update..." : "Waiting for scan data..."
                                      }
                                    />
                                  </ModalWindow>
                                )}
                            </div>
                          </Card>}
                      // end fallback renderer
                      >
                        <Card shadow={false} legendTitle="Quotes">
                          <Grid container spacing={1}>
                            <Grid sx={{ xs: 12, md: 6 }}>
                              <GridItem>
                                <div className="scan-alert">
                                  <Alert severity="info">
                                    Edit Quote {' '} <Button
                                      className="btn-verdict"
                                      onClick={() => setcustomQuoteFormOpen(true)}
                                      disabled={quoteSelectionMode || customQuoteFormOpen || applicationStage === "declined" || (!scan_result || scan_result === 'failed' || scan_result === 'reject') ? true : false}
                                    >
                                      Create
                                    </Button>
                                  </Alert>
                                </div>
                              </GridItem>
                            </Grid>
                            <Grid sx={{ xs: 12, md: 6 }}>
                              <GridItem>
                                <div className="scan-alert">
                                  <Alert severity="info">
                                    E-Mail Quotes {' '} <Button
                                      className="btn-verdict"
                                      onClick={() => setShowQuoteEmailModal(true)}
                                      disabled={quoteSelectionMode || applicationStage === "declined" || (!scan_result || scan_result === 'failed' || scan_result === 'reject') ? true : false}
                                    >
                                      Send
                                    </Button>
                                  </Alert>
                                  {
                                    showQuoteEmailModal && (
                                      <ModalWindow
                                        showModal={showQuoteEmailModal}
                                        size="md"
                                        title="Send Quote Details"
                                        setShowModal={() => setShowQuoteEmailModal(false)}
                                      >
                                        <ContactDetail
                                          fileRefetch={fileRefetch}
                                          artifactDataSubscription={artifactDataSubscription}
                                          disableSend={(quoteUpdateLoading
                                            //|| !scan_result || scan_result === 'pending'
                                          )}
                                          disableButtonText={
                                            quoteUpdateLoading ? "Waiting for quote update..." : "Waiting for scan data..."
                                          }
                                        />
                                      </ModalWindow>
                                    )}
                                </div>
                              </GridItem>
                            </Grid>
                          </Grid>

                        </Card>
                      </FeatureFlag>
                    </div>
                  </GridItem>
                </Grid>

                <Grid sx={{ xs: 12 }}>
                  <GridItem>
                    {
                      (quoteCount > maximumQuoteCount) &&
                      <Alert severity="warning">
                        <Grid container spacing={2} alignItems="center">
                          <Grid sx={{ xs: 12 }}>
                            <GridItem>
                              More than <b>{maximumQuoteCount} quotes</b> found for this application. Quotes that are already in the <b>PDF</b> version are marked with <span style={{ position: "relative", top: "6px" }}><AttachmentOutlined fontSize="small" color="primary" /></span>
                              <br />
                              <span>To change the selection and generate a new PDF
                                <Button
                                  onClick={() => setQuoteSelectionMode(true)}
                                  disabled={quoteSelectionMode || customQuoteFormOpen}
                                  color="primary">
                                  <b>Click here</b>
                                </Button>
                              </span>
                            </GridItem>
                          </Grid>
                          {/* <Grid item xs={3}>
                          <Button
                            className="btn-verdict"
                            onClick={() => setQuoteSelectionMode(true)}
                            disabled={quoteSelectionMode || customQuoteFormOpen}
                          >
                            Select Now
                          </Button>
                        </Grid> */}
                        </Grid>

                      </Alert>
                    }
                  </GridItem>
                </Grid>

              </Grid>

              <br />

              <QuoteSelector
                enabled={quoteSelectionMode}
                setEnabled={setQuoteSelectionMode}
                selectedIds={pdfSelectedIds}
              >
                <Grid container spacing={4}>
                  {quoteLoading ? (
                    <LoadingQuoteSelectionsCard />
                  ) : (
                    <>
                      <FeatureFlag
                        roles={["broker_power"]}
                        fallbackRender={() => <></>}
                      >
                        <CustomQuote
                          formOpen={customQuoteFormOpen}
                          setFormOpen={setcustomQuoteFormOpen}
                          setQuoteCreateToastMessage={setToastMessage}
                        />
                      </FeatureFlag>
                      {watchQuotes?.insurance_quote.map(
                        (quoteItems) => (
                          <QuoteList
                            key={quoteItems.id}
                            item={quoteItems}
                            selectedQuoteId={selectionHasSelectedQuote ? selectQuote : 0}
                            activeQuoteId={(id: number) => setSelectQuote(id)}
                            setQuoteUpdateLoading={setQuoteUpdateLoading}
                            applicationStage={applicationStage}
                            selectMode={quoteSelectionMode}
                            pdfSelectedIds={pdfSelectedIds}
                            updateQuotePDFIdSelection={updateQuotePDFIdSelection}
                            disableAdd={pdfSelectedIds.length >= maximumQuoteCount}
                            quoteSelectionMode={quoteSelectionMode}
                            pdfQuoteIds={pdfQuoteIdsArr}
                            artifactLoading={applicationStage === "declined" || (artifactDataSubscription?.loading || !artifactDataSubscription?.data?.insurance_application_artifact?.length || quoteUpdateLoading)}
                          />
                        )
                      )}
                    </>
                  )}
                </Grid>
              </QuoteSelector>

              {selectQuoteMsg && (
                <>
                  <br />
                  <Alert severity="error">Please select a Quote</Alert>
                </>
              )}

              <ButtonsContainer justifyContent="flex-end">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={
                    !selectionHasSelectedQuote || quoteSelectionMode ||
                    !(
                      dateSelected ||
                      data?.insurance_application_by_pk?.effective_date !== null
                    ) ||
                    updateLoading ||
                    applicationStage === "declined" ||
                    // (scanRequired &&
                    //   scanData?.external_scan[0]?.scan_result?.verdict !==
                    //   "approve") ||
                    quoteLoading
                  }
                  onClick={handleSubmitOnClick}
                  endIcon={<ButtonLoading loading={updateLoading} />}
                >
                  Next
                </Button>
              </ButtonsContainer>
            </form>
          </FormProvider >
        </Card >
      </>
    );
  }
};

interface QuoteListDataProps {
  item?: any;
  selectedQuoteId?: number;
  activeQuoteId?: any;
  setQuoteUpdateLoading: React.Dispatch<React.SetStateAction<boolean>>;
  applicationStage?: any;
  selectMode?: boolean;
  pdfSelectedIds?: number[];
  updateQuotePDFIdSelection?: any;
  disableAdd?: boolean;
  quoteSelectionMode?: boolean;
  pdfQuoteIds?: number[];
  artifactLoading?: boolean;
}

const feeLabel = (fee: any) => { };

const QuoteList: React.FC<QuoteListDataProps> = ({
  item,
  selectedQuoteId,
  activeQuoteId,
  setQuoteUpdateLoading,
  applicationStage,
  selectMode = false,
  pdfSelectedIds = [],
  updateQuotePDFIdSelection,
  disableAdd,
  quoteSelectionMode,
  pdfQuoteIds = [],
  artifactLoading = false,
}) => {
  const classes = useStyles();
  const [quoteExpand, setQuoteExpand] = useState<null | string>(item.id);
  const [showEditPremium, setShowEditPremium] = useState(false);
  const [newPremium, setNewPremium] = useState<null | number>(0.00);
  const [premiumError, setPremiumError] = useState<boolean>(false);
  const [showToastMessage, setToastMessage] = useState<{ show?: boolean, message?: string, type?: 'error' | 'success' }>({});
  const [quoteSelectedForPDF, setQuoteSelectedForPDF] = useState<boolean>(false);

  //at load
  const quoteSelected: boolean = pdfSelectedIds.includes(item?.id);
  const inPDF: boolean = pdfQuoteIds.includes(item.id);

  const loggedUser = useUser();

  const [
    updatePremium,
    { loading: updatePremiumLoading, error: updatePremiumError }
  ] = useUpdatePremiumDataMutation({
    errorPolicy: "all",
    onCompleted: () => {
      setQuoteUpdateLoading(false);
    }
  });

  const getPercentage = (value: any) => {
    const numericValue = value * 100;
    return `${numericValue.toFixed(2)}%`;
  };

  const removeNonNumeric = async (txt: string) => {
    return txt.replace(/[^\d.-]/g, '');
  }

  const setPremium = async (val: string) => {
    setNewPremium(Number(await removeNonNumeric(val)));
  };

  useEffect(() => {
    if (showEditPremium) {
      setPremium(item.premium);
    }
  }, [showEditPremium]);

  const savePremium = async () => {
    if (!newPremium) {
      setPremiumError(true);
      return;
    }
    setPremiumError(false);
    setShowEditPremium(false);

    const req: UpdatePremiumInput = {
      id: item.id,
      premium: newPremium,
      policyLimit: Number(await removeNonNumeric(item.policy_limit)),
      excess: Number(await removeNonNumeric(item.deductible)),
      inPDFIds: pdfQuoteIds,
    };

    setQuoteUpdateLoading(true);

    const { errors } = await updatePremium({
      variables: {
        object: req
      },

    });

    if (errors) {
      console.log(errors);
      setQuoteUpdateLoading(false);
      setToastMessage({
        message: "Error updating premium value",
        type: 'error',
        show: true,
      });
    } else {
      setQuoteUpdateLoading(false);
      setToastMessage({
        message: `Premium updated successfully`,
        type: 'success',
        show: true,
      });
    };
  };

  const updateSelection = (val: boolean) => {
    setQuoteSelectedForPDF(val);
    updateQuotePDFIdSelection(val, item.id);
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

  let tooltipTitle = '';
  if (!quoteSelected && disableAdd) {
    tooltipTitle = 'Maximum selected. Deselect others to select this.'
  } else if (quoteSelected) {
    tooltipTitle = 'De-select this quote'
  } else {
    tooltipTitle = 'Select this quote'
  }

  return (
    <>
      {toastMessageComponent}
      <Grid sx={{ xs: 12, md: 4 }} key={item.id}>
        <GridItem>
          <Card shadow={false}>
            {
              selectMode &&
              <div className={classes.quoteSelectCheckBoxWrapper}>
                <Tooltip
                  title={tooltipTitle}
                  aria-label={tooltipTitle}
                >
                  <span>
                    <Checkbox
                      defaultChecked={quoteSelected}
                      color="primary"
                      onChange={(e) => updateSelection(e.target.checked)}
                      disabled={!quoteSelected && disableAdd}
                    />
                  </span>
                </Tooltip>
              </div>
            }
            {
              inPDF && !selectMode &&
              <div className={classes.quoteInPDFWrapper}>
                <Tooltip
                  title="In Quote PDF"
                  aria-label="In Quote PDF"
                >
                  <span>
                    <AttachmentOutlined fontSize="small" color="primary" />
                  </span>
                </Tooltip>
              </div>
            }
            <div>
              <table className={classes.quotesTable}>
                <tbody>
                  <tr>
                    <td>
                      <span className={classes.textGrey}>Limit</span>
                      <span className={classes.textBlack}>
                        {currencyFormatter(item.policy_limit)}
                      </span>
                    </td>
                    <td>
                      {/* <span className={classes.textGrey}>Premium</span> */}
                      <span
                        className={classes.textBlack}
                        style={{ fontSize: "18px" }}
                      >
                        {currencyFormatterWithCents(item.total_premium)}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span className={classes.textGrey}>Sub Limit</span>
                      <span className={classes.textBlack}>
                        {item.sub_limits?.map((a: any) => currencyFormatter(a.amount))}
                      </span>
                    </td>
                    <td>
                      <span className={classes.textGrey}>Deductible</span>
                      <span className={classes.textBlack}>
                        {currencyFormatter(item.deductible)}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              className={`${classes.showMore} ${quoteExpand === item.id ? "active" : ""
                }`}
              onClick={() => {
                quoteExpand === item.id
                  ? setQuoteExpand(null)
                  : setQuoteExpand(item.id);
              }}
            >
              <span>
                <KeyboardArrowDownIcon />
              </span>
              <hr />
            </div>
            {quoteExpand === item.id ? (
              <div>
                <table className={classes.quotesTable}>
                  <tbody>
                    <tr>
                      <td>
                        <span className={classes.textGrey}>Premium</span>
                      </td>
                      <td>
                        <span className={classes.textGrey}>
                          {
                            showEditPremium
                              ? (
                                <>
                                  <TextField
                                    className={classes.editPremiumInput}
                                    id="premium-edit-value"
                                    variant="standard"
                                    size="small"
                                    type="number"
                                    value={newPremium}
                                    onChange={(e) => setNewPremium(Number(e.target.value))}
                                    error={premiumError}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        savePremium();
                                      }
                                    }}
                                  />
                                </>
                              ) : (
                                currencyFormatterWithCents(item.premium)
                              )
                          }
                          {
                            <FeatureFlag
                              roles={["broker_power"]}
                              fallbackRender={() => <></>}
                            >
                              <span className={classes.editPremiumToolbar}>
                                {
                                  showEditPremium
                                    ? (
                                      <>
                                        <Tooltip
                                          title="Save"
                                          aria-label="Save"
                                        >
                                          <IconButton
                                            color="primary"
                                            className={classes.editPremiumBtn}
                                            onClick={savePremium}
                                            disabled={updatePremiumLoading}
                                          >
                                            <Check className={classes.editPremiumBtnIcon} />
                                          </IconButton>
                                        </Tooltip>

                                        <Tooltip
                                          title="Close"
                                          aria-label="Close"
                                        >
                                          <IconButton
                                            color="secondary"
                                            className={classes.editPremiumBtn}
                                            onClick={() => setShowEditPremium(false)}
                                            disabled={updatePremiumLoading}
                                          >
                                            <Close className={classes.editPremiumBtnIcon} />
                                          </IconButton>
                                        </Tooltip>
                                      </>
                                    )
                                    : (
                                      !quoteSelectionMode && <Tooltip
                                        title="Edit Premium"
                                        aria-label="Edit Premium"
                                      >
                                        <IconButton
                                          color="primary"
                                          className={classes.editPremiumBtn}
                                          onClick={() => setShowEditPremium(true)}
                                          disabled={artifactLoading}
                                        >
                                          {
                                            updatePremiumLoading ? (
                                              <CircularProgress className={classes.editPremiumBtnIcon} style={{ marginLeft: 5 }} size={18} />
                                            ) : (
                                              <Edit className={classes.editPremiumBtnIcon} />
                                            )
                                          }
                                        </IconButton>
                                      </Tooltip>
                                    )
                                }
                              </span>
                            </FeatureFlag>
                          }
                        </span>
                      </td>
                    </tr>

                    {item?.fees?.items?.map((fee: any) => (
                      <tr key={`${item.id}-${fee.name}`}>
                        <td>
                          <span className={classes.textGrey}>
                            {fee.name}{" "}
                            {fee.rate && `(${getPercentage(fee.rate)})`}
                          </span>
                        </td>
                        <td>
                          <span className={classes.textGrey}>
                            $
                            {fee.amount !== undefined &&
                              currencyFormatterWithCents(fee.amount)
                            }
                          </span>
                        </td>
                      </tr>
                    ))}
                    {item.taxes?.label !== undefined && (
                      <tr>
                        <td>
                          <span className={classes.textGrey}>
                            {item.taxes?.label || "Tax"} (
                            {getPercentage(item.taxes?.rate)})
                          </span>
                        </td>
                        <td>
                          <span className={classes.textGrey}>
                            $
                            {item.taxes?.amount !== undefined &&
                              //Number(item.taxes?.amount).toFixed(2)
                              currencyFormatterWithCents(item.taxes?.amount)
                            }
                          </span>
                        </td>
                      </tr>
                    )}

                    <tr>
                      <td>
                        <span className={classes.textBlack}>Total</span>
                      </td>
                      <td>
                        <span className={classes.textBlack}>{currencyFormatterWithCents(item.total_premium)}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <></>
            )}

            {
              (!quoteSelectionMode
                //&& inPDF
              ) && <div
                onClick={() => {
                  //setSelectedQuote(item.id);
                  activeQuoteId(item.id);
                }}
                className={classes.selectQuoteBtn}
              >
                <Tooltip
                  title={`${selectedQuoteId === item.id ? "Selected quote" : "Select quote"}`}
                >
                  <CheckCircleIcon
                    fontSize="large"
                    htmlColor={`${selectedQuoteId === item.id ? "#00CF5F" : "#C4C4C4"
                      }`}
                  />
                </Tooltip>
              </div>
            }
            {/* {
            (!quoteSelectionMode && !inPDF) && <div
              className={classes.selectQuoteBtn}
            >
              <Tooltip
                title="Cannot select quote, not in Quote PDF"
              >
                <Error
                  fontSize="large"
                  htmlColor="#ffcb7f"
                />
              </Tooltip>
            </div>
          } */}
          </Card>
        </GridItem>
      </Grid>
    </>
  );
};

export default Quote;

interface CustomAlertProps {
  children?: any;
  severity?: "warning" | "error" | "success";
  external_id?: string;
}

const CustomAlert = ({ children, severity, external_id }: CustomAlertProps) => {
  const [showInfoModal, setShowInfoModal] = useState(false);

  return (
    <>
      <Alert
        severity={severity ? severity : "success"}
        action={
          severity !== "success" && (
            <FeatureFlag
              roles={["broker_power"]}
              fallbackRender={() => <></>}
            >
              <Button
                className="btn-verdict"
                onClick={() => setShowInfoModal(true)}
              >
                View Details
              </Button>
            </FeatureFlag>
          )
        }
      >
        {children}
      </Alert>
      {showInfoModal && (
        <ScanVerdictDetailModal
          showModal={showInfoModal}
          setShowModal={() => setShowInfoModal(false)}
          external_id={external_id}
        />
      )}
    </>
  );
};
const ScanStatus = (props: any) => {
  const classes = useStyles();
  const { scanData, retriggerScan, manualTriggerLoading } = props;

  const getExternal_id = scanData?.external_scan[0]?.external_id || undefined;

  if (scanData?.external_scan[0]?.scan_result?.verdict === 'reject') {
    console.log(scanData?.external_scan[0]?.scan_result);
    return (
      <CustomAlert external_id={getExternal_id} severity="error">
        Rejected
      </CustomAlert>
    )
  }

  switch (scanData?.external_scan[0]?.status) {
    case "pending":
      return (
        <div className="scan-progress">
          <LinearBuffer progress={scanData?.external_scan[0]?.scan_result?.progress || 5} />
        </div>
      );

    case "success":
      switch (scanData?.external_scan[0]?.scan_result?.verdict) {
        case "approve":
          return (
            <CustomAlert external_id={getExternal_id} severity="success">
              Approved:
              <span>
                a security risk report will be sent to the broker on binding
              </span>
            </CustomAlert>
          );

        case "reject":
          return (
            <CustomAlert external_id={getExternal_id} severity="error">
              Rejected
            </CustomAlert>
          );
        case "pending":
          return (
            <CustomAlert external_id={getExternal_id} severity="warning">
              Scan Pending
            </CustomAlert>
          );
        case "timed_out":
          return (
            <CustomAlert external_id={getExternal_id} severity="warning">
              Scan Timed Out
            </CustomAlert>
          );

        default:
          return <></>;
      }

    case "failed":
      return (
        <CustomAlert external_id={getExternal_id} severity="error">
          Scan Failed
        </CustomAlert>
      );
    case "error":
      return (
        <CustomAlert external_id={getExternal_id} severity="error">
          Scan Error
        </CustomAlert>
      );

    case "":
      switch (scanData?.external_scan[0]?.scan_result?.verdict) {
        case "timed_out":
          return (
            <CustomAlert external_id={getExternal_id} severity="warning">
              Scan Timed Out
            </CustomAlert>
          );
        case "pending":
          return (
            <>
              <Grid container spacing={1}>
                <Grid sx={{ xs: 12, md: 8 }}>
                  <GridItem>
                    <Alert severity="warning">
                      Scan not Available
                    </Alert>
                  </GridItem>
                </Grid>
                <Grid sx={{ xs: 12, md: 4 }}>
                  <GridItem>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      {/* <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      onClick={() => retriggerScan()}
                      disabled={manualTriggerLoading}
                    >
                      {
                        (manualTriggerLoading)
                          ? (<>
                            <CircularProgress
                              className={classes.editPremiumBtnIcon}
                              style={{ marginLeft: 5 }}
                              size={18} /> Triggering...
                          </>)
                          : (<>
                            Re-trigger scan
                          </>)
                      }
                    </Button> */}
                    </div>
                  </GridItem>
                </Grid>
              </Grid>
            </>
          );
        default:
          return <Alert severity="warning">Scan not Available</Alert>;
      }


    default:
      return <Alert severity="warning">Scan not Available</Alert>;
  }
};
