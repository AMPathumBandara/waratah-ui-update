import React, { useEffect, useState } from 'react';
import MaterialTable from '@material-table/core';
import { tableIcons } from "utils/MaterialTableIcons";
import { EmailRecipientInput, GetInsuranceQuoteEmailSubscription, Maybe, Recipient, useCreateQuoteEmailContactMutation, useDeleteInsuranceQuoteEmailMutation, useGetArtifactByAppIdAndQuoteNumberQuery, useGetInsuranceQuoteEmailSubscription, useResendQuotePdfEmailMutation, useSendQuotePdfEmailMutation, useUpdateInsuranceQuoteEmailMutation } from 'generated/graphql';
import { ApplicationParams } from 'components/Application/ApplicationModal';
import { useParams } from 'react-router';
import { DateTime } from 'luxon';
import { AccessTime, ArrowForwardIosOutlined, Cancel, Check, CheckCircle, Close, CloudDownload, DoneAll, Edit, Email, FontDownload, GetApp, NextWeek, Refresh, Send, Watch } from '@mui/icons-material';
import { Avatar, Badge, Box, Button, Chip, CircularProgress, Link, Tooltip } from '@mui/material';
import ToastMessage from 'components/Toast/ToastMessage';
import ButtonLoading from 'components/From/ButtonLoading';
import { dowloadInsuredArtifact } from './downloads';
import { getFileName } from '.';
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import theme from 'theme/theme';

// Utility type to extract the type of array elements
type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

// Extract the type of elements within the insurance_quote_email array
type InsuranceQuoteEmailElement = ArrayElement<GetInsuranceQuoteEmailSubscription['insurance_quote_email']>;

interface ContactDetailProps {
  disableSend: boolean;
  disableButtonText: string | undefined;
  fileRefetch: any;
  artifactDataSubscription: any;
}

const useStyles = makeStyles(() => ({
  textPrimary: {
    color: theme.palette.primary.main
  },
  textSecondary: {
    color: theme.palette.secondary.main
  },
}));

const ContactDetail: React.FC<ContactDetailProps> = ({
  disableSend,
  disableButtonText,
  fileRefetch,
  artifactDataSubscription
}) => {

  const params = useParams<ApplicationParams>();
  const [sendingEmails, setSendingEmails] = useState(false);
  const [downloadingQuote, setDownloadQuote] = useState<boolean>(false);
  const [notSentAvailable, setNotSentAvailable] = useState<boolean>(false);
  const [sent, setSent] = useState<any>([]);
  const [notSent, setNotSent] = useState<any>([]);

  const classes = useStyles();

  const emailDataSubscription = useGetInsuranceQuoteEmailSubscription({
    variables: { applicationid_id: params.id || '' }
  });

  useEffect(() => {
    checkForNotSent(emailDataSubscription.data?.insurance_quote_email);
  }, [emailDataSubscription.data?.insurance_quote_email]);

  const latest = (artifactDataSubscription?.data?.insurance_application_artifact[0]?.file_uri?.split('/')?.pop() || '').replace(".pdf", "").replace("Quote-", "");

  const checkForNotSent = async (quoteEmails: Array<any> | undefined) => {
    if (quoteEmails && quoteEmails.length > 0) {
      const _sent = quoteEmails.filter(item => item.email_sent_at !== null);
      const _notSent = quoteEmails.filter(item => item.email_sent_at === null);

      setSent(_sent);
      setNotSent(_notSent);

      setNotSentAvailable(_notSent.length > 0);
    } else {
      setNotSentAvailable(false);
      setSent([]);
      setNotSent([]);
    }
  };

  const [
    createQuoteEmailContact,
    { loading: createLoading, error: createError }
  ] = useCreateQuoteEmailContactMutation({
    errorPolicy: "all"
  });

  const [
    updateInsuranceQuoteEmail,
    { loading: updateLoading, error: updateError }
  ] = useUpdateInsuranceQuoteEmailMutation({
    errorPolicy: "all"
  });

  const [
    deleteInsuranceQuoteEmail,
    { loading: deleteLoading, error: deleteError }
  ] = useDeleteInsuranceQuoteEmailMutation({
    errorPolicy: "all"
  });

  const [
    sendQuotePdfEmail,
    { loading: emailSendLoading, error: emailSendError }
  ] = useSendQuotePdfEmailMutation({
    errorPolicy: "all"
  });

  const [
    resendQuotePdfEmail,
    { loading: emailResendLoading, error: emailResendError }
  ] = useResendQuotePdfEmailMutation({
    errorPolicy: "all"
  });

  const { refetch: refetchArtifactData } = useGetArtifactByAppIdAndQuoteNumberQuery({
    variables: {
      applicationid_id: params.id,
      quote_number: "%"
    },
    skip: true
  });

  const scanReportDownload = async (quoteNumber: string) => {
    setDownloadQuote(true);

    const { data: artifact, loading: artifactDataLoading, error: artifactDataError } = await refetchArtifactData({
      applicationid_id: params.id,
      quote_number: "%" + quoteNumber as string + "%"
    });

    if (artifactDataError) {
      let msg = artifactDataError.message;
      let errMsg = 'Failed to fetch pdf';

      console.log(artifactDataError);
      setToastMessage({
        message: errMsg,
        type: 'error',
        show: true,
      });
      return;
    }

    if (!artifact) {
      console.error("error occurred");
      return;
    }

    const fileUri = artifact?.insurance_application_artifact[0]?.file_uri || '';
    const fileName = getFileName(
      artifact?.insurance_application_artifact[0]?.file_uri || '' as string, 
      artifact?.insurance_application_artifact[0]?.file_uri || '' as string)?.replace(".pdf", "") as string;

    await dowloadInsuredArtifact(fileRefetch, fileUri, fileName, () => {
      setDownloadQuote(false);
    });
  }

  const [data, setData] = useState<InsuranceQuoteEmailElement[]>([]);

  const [showToastMessage, setToastMessage] = useState<{ show?: boolean, message?: string, type?: 'error' | 'success' }>({});

  const columns = [
    { title: 'Name', field: 'name' },
    { title: 'E-Mail', field: 'email' },
    // {
    //   title: "Quote Number",
    //   field: "quote_number",
    //   editable: false,
    //   // field: "cognito_status",
    //   // editable: false,
    //   render: (rowData: InsuranceQuoteEmailElement) => {
    //     const latest = (artifactDataSubscription?.data?.insurance_application_artifact[0]?.file_uri?.split('/')?.pop() || '').replace(".pdf", "").replace("Quote-", "");
    //     const quoteNumber = (!rowData.quote_number || rowData.quote_number === "-1")
    //       ? latest : (rowData.quote_number as string).replace(".pdf", "").replace("Quote-", "");

    //     return (
    //       <div>
    //         <div>
    //           <Button
    //             style={{ cursor: 'pointer' }}
    //             onClick={() => scanReportDownload(quoteNumber)}
    //             disabled={downloadingQuote}
    //             color='primary'
    //             title='Click to download'
    //           >
    //             {
    //               quoteNumber
    //             }
    //             {
    //               downloadingQuote
    //                 ? <CircularProgress style={{ marginLeft: 5 }} size={18} />
    //                 : <GetApp style={{ marginLeft: 5 }} />
    //             }
    //           </Button>
    //           {
    //             quoteNumber === latest &&
    //             <>
    //               <Chip
    //                 label="latest"
    //                 color="primary"
    //                 style={{
    //                   marginLeft: "26px",
    //                   height: "18px",
    //                   padding: "9px 0",
    //                   position: "relative",
    //                   top: "-9px"
    //                 }}
    //               />
    //             </>
    //           }
    //         </div>
    //       </div>
    //     )
    //   }
    // },
    {
      title: 'Status',
      field: 'status',
      editable: false,
      render: (rowData: InsuranceQuoteEmailElement) => {
        if (!rowData.status || rowData.status === "init") {
          return (
            <div>
              <Chip
                size="small"
                variant="outlined"
                label="Not Sent"
                color="default"
                icon={<NextWeek />}
              />
            </div>
          )
        }
        let icon = <></>;
        let title = "";
        if (rowData.status === "success") {
          icon = <Email />;
          title = rowData.email_sent_at ? "Email sent at " + DateTime.fromISO(rowData.email_sent_at).toFormat("MM/dd/yy, hh:mm a") : "-"
        }
        if (rowData.status === "fail") {
          icon = <Cancel />;
          title = "Sending failed"
        }
        return (
          <div>
            <Chip
              size="small"
              icon={icon}
              variant="outlined"
              label={rowData.email_sent_at ? DateTime.fromISO(rowData.email_sent_at).toFormat("MM/dd/yy, hh:mm a") : "-"}
              color="secondary"
              title={title}
            />
          </div>
        )
      }
    },

  ];

  const sentColumns = [
    { title: 'Name', field: 'name' },
    { title: 'E-Mail', field: 'email' },
    {
      title: "Quote Number",
      field: "quote_number",
      editable: false,
      // field: "cognito_status",
      // editable: false,
      render: (rowData: InsuranceQuoteEmailElement) => {
        const quoteNumber = (rowData.quote_number as string).replace(".pdf", "").replace("Quote-", "");

        return (
          <div>
            <div>
              <Button
                style={{ cursor: 'pointer' }}
                onClick={() => scanReportDownload(quoteNumber)}
                disabled={downloadingQuote}
                color='primary'
                title='Click to download'
              >
                {
                  quoteNumber
                }
                {
                  downloadingQuote
                    ? <CircularProgress style={{ marginLeft: 5 }} size={18} />
                    : <GetApp style={{ marginLeft: 5 }} />
                }
              </Button>
            </div>
          </div>
        )
      }
    },
    {
      title: 'Sent status',
      field: 'status',
      editable: false,
      render: (rowData: InsuranceQuoteEmailElement) => {
        if (!rowData.status || rowData.status === "init") {
          return (
            <div>
              <Chip
                size="small"
                variant="outlined"
                label="Not Sent"
                color="default"
                icon={<NextWeek />}
              />
            </div>
          )
        }
        let icon = <></>;
        let title = "";
        if (rowData.status === "success") {
          icon = <Email />;
          title = rowData.email_sent_at ? "Email sent at " + DateTime.fromISO(rowData.email_sent_at).toFormat("MM/dd/yy, hh:mm a") : "-"
        }
        if (rowData.status === "fail") {
          icon = <Cancel />;
          title = "Sending failed"
        }
        return (
          <div>
            <Chip
              size="small"
              icon={icon}
              variant="outlined"
              label={rowData.email_sent_at ? DateTime.fromISO(rowData.email_sent_at).toFormat("MM/dd/yy, hh:mm a") : "-"}
              color="secondary"
              title={title}
            />
          </div>
        )
      }
    },

  ];

  const handleAdd = async (data: any) => {
    const request = {
      ...data,
      application_id: params.id
    };
    const { errors } = await createQuoteEmailContact({
      variables: {
        object: request
      }
    });

    if (errors) {
      let msg = errors[0].message;
      let errMsg = 'Add contact Failed';
      if (msg.startsWith("Uniqueness violation")) {
        errMsg = `Email ${data.email} already exists, please check again.`
      }
      console.log(errors);
      setToastMessage({
        message: errMsg,
        type: 'error',
        show: true,
      });
    }
  };

  const handleUpdate = async (data: any) => {
    const request = {
      id: data.id,
      email: data.email,
      name: data.name
    };
    const { errors } = await updateInsuranceQuoteEmail({
      variables: {
        ...request
      }
    });

    if (errors) {
      console.log(errors);
      setToastMessage({
        message: "Unable to update contact",
        type: 'error',
        show: true,
      });
    }
  };

  const handleDelete = async (data: any) => {
    const request = {
      id: data.id
    };
    const { errors } = await deleteInsuranceQuoteEmail({
      variables: {
        ...request
      }
    });

    if (errors) {
      console.log(errors);
      setToastMessage({
        message: "Unable to Delete contact",
        type: 'error',
        show: true,
      });
    }
  };

  const handleResend = async (data: any) => {
    setSendingEmails(true);

    const request = {
      id: data.id
    };
    const { errors } = await resendQuotePdfEmail({
      variables: {
        object: request
      }
    });

    if (errors) {
      console.log(errors);
      setToastMessage({
        message: "Unable to resend email",
        type: 'error',
        show: true,
      });
    } else {
      setToastMessage({
        message: `Email resent successfully to ${data.email}`,
        type: 'success',
        show: true,
      });
    }
    setSendingEmails(false);
  };

  const sendEmails = async () => {
    setSendingEmails(true);

    let list = emailDataSubscription.data?.insurance_quote_email || [];
    //filter out sent emails
    if (list.length > 0) {
      list = list.filter(l => (l.status === null || !(l.status === "success" || l.status === "inprogress")));
    }

    if (!list || list.length == 0) {
      //TODO: show error message
      console.error("No eligible emails found");
      setToastMessage({ show: true, message: "No eligible emails found. Start by adding new emails.", type: 'error' });
      setSendingEmails(false);
      return;
    }

    const recipients: Array<Recipient> = list.map((item: any) => {
      return {
        id: item.id,
        name: item.name,
        email: item.email
      }
    });

    let obj: EmailRecipientInput = {
      application_id: params.id,
      recipients
    }

    const { data: sentData, errors } = await sendQuotePdfEmail({
      variables: {
        object: obj
      },
    });

    if (errors) {
      const msg = errors[0]?.message;
      setToastMessage({
        message: msg ? msg : 'Email sending failed',
        type: 'error',
        show: true,
      });
    } else {
      const updateCount = sentData?.sendQuotePDFEmailsFromUI?.count;
      const msg = `${updateCount} email(s) sent successfully.`
      console.log(msg);

      setToastMessage({
        message: `${msg}`,
        type: 'success',
        show: true,
      });
    }
    setSendingEmails(false);
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
    <>
      {toastMessageComponent}
      <MaterialTable
        title={
          <div className={classes.textSecondary} style={{ display: 'flex', alignItems: 'center', gap: "8px" }}>
            <AccessTime />
            <h3 className='title'>Pending Email(s)</h3>
          </div>
        }
        //@ts-ignore
        columns={columns}
        data={notSent || []}
        options={{
          search: false, // Disable search functionality
          sorting: false, // Disable sorting functionality
          actionsColumnIndex: -1,
          paging: false, // Disable paging functionality
        }}
        icons={tableIcons}
        actions={[
          rowData => ({
            icon: () => {
              if (emailResendLoading) {
                return <ButtonLoading loading={true} />
              } else {
                return <Refresh />
              }
            },
            hidden: rowData.status !== "success",
            disabled: emailResendLoading || downloadingQuote,
            tooltip: "Resend Email",
            onClick: async (event, rowData) => {
              await handleResend(rowData);
            },
          })
        ]}
        editable={{
          isEditable: (rowData) => {
            return rowData.status !== "success"
          },
          isDeletable: (rowData) => {
            return rowData.status !== "success"
          },
          onRowAdd: async (newData) => {
            await handleAdd(newData);
          },
          onRowUpdate: async (newData, oldData) => {
            if (newData.status !== "success") {
              await handleUpdate(newData);
            }
          },
          onRowDelete: async (oldData) => {
            if (oldData.status !== "success") {
              await handleDelete(oldData);
            }
          }
        }}
      />

      <h4 className='title'>
        <Tooltip
          title="This will be sent for pending emails"
        >
          <span>
            &nbsp;&nbsp;Latest Quote:
            <Button
              style={{ cursor: 'pointer' }}
              onClick={() => scanReportDownload(latest)}
              disabled={downloadingQuote}
              color='primary'
              title='Click to download'
            >
              {
                latest
              }
              {
                downloadingQuote
                  ? <CircularProgress style={{ marginLeft: 5 }} size={18} />
                  : <GetApp style={{ marginLeft: 5 }} />
              }
            </Button>
          </span>
        </Tooltip>
      </h4>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          color="primary"
          variant="contained"
          onClick={() => sendEmails()}
          //disabled={disableSend || sendingEmails || emailSendLoading || downloadingQuote || !notSentAvailable}
          size='small'
          endIcon={
            emailSendLoading ? (
              <ButtonLoading loading={emailSendLoading} />
            ) : (
              <></>
            )
          }
        >
          {
            disableSend ? (
              <>{disableButtonText}</>
            ) : (
              <>Send Emails &nbsp; <Send /></>
            )
          }
        </Button>
      </Box>
      <br />
      <Box>
        <MaterialTable
          title={
            <div className={classes.textSecondary} style={{ display: 'flex', alignItems: 'center', gap: "8px" }}>
              <DoneAll />
              <h3 className='title'>Sent Email(s)</h3>
            </div>
          }
          //@ts-ignore
          columns={sentColumns}
          data={sent || []}
          options={{
            search: false, // Disable search functionality
            sorting: false, // Disable sorting functionality
            actionsColumnIndex: -1,
            paging: false, // Disable paging functionality
            headerStyle: {
              backgroundColor: '#e0e0e0',
            },
          }}
          style={{ border: "1px solid #e8e8e8", background: "#f7f7f7", padding: "10px" }}
          icons={tableIcons}
          actions={[
            rowData => ({
              icon: () => {
                if (emailResendLoading) {
                  return <ButtonLoading loading={true} />
                } else {
                  return <Refresh />
                }
              },
              hidden: rowData.status !== "success",
              disabled: emailResendLoading || downloadingQuote,
              tooltip: "Resend Email",
              onClick: async (event, rowData) => {
                await handleResend(rowData);
              },
            })
          ]}
        />
      </Box>
    </>
  );
};

export default ContactDetail;