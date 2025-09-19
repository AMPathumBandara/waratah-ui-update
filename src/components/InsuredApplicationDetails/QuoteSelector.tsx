import { Button, Card, Grid } from "@mui/material";
import { Close, Save } from "@mui/icons-material";
import { maximumQuoteCount } from "./Quote";
import { useCreatePdfQuoteSelectionMutation } from "generated/graphql";
import { useParams } from "react-router";
import { ApplicationParams } from ".";
import ToastMessage from "components/Toast/ToastMessage";
import { useState } from "react";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import GridItem from "components/Layout/GridItem";

// Styles
const useStyles = makeStyles((theme: Theme) => ({
    selectionWrapper: {
        padding: "1.2rem",
        borderRadius: "4px",
        background: "#FFF",
        border: "2px solid rgb(171, 133, 252)",
        position: "relative",
        boxShadow: "0px 3px 2px rgba(0, 0, 0, 0.05)",
    },
    textBlack: {
        color: "#333333",
        fontSize: "16px",
        fontWeight: 600,
    },
}));

interface QuoteSelectorProps {
    enabled?: boolean;
    setEnabled?: any;
    selectedIds?: number[];
    children?: any;
}

const QuoteSelector: React.FC<QuoteSelectorProps> = ({
    enabled = false,
    setEnabled,
    selectedIds = [],
    children
}) => {
    const classes = useStyles();
    const params = useParams<ApplicationParams>();

    const [showToastMessage, setToastMessage] = useState<{ show?: boolean, message?: string, type?: 'error' | 'success' }>({});

    const remainingCount = maximumQuoteCount - selectedIds.length;

    const [
        CreatePdfQuoteSelection,
        { loading: createLoading }
    ] = useCreatePdfQuoteSelectionMutation({
        errorPolicy: "all"
    });

    const saveSelection = async () => {
        const { errors: createError } = await CreatePdfQuoteSelection({
            variables: {
                input: {
                    applicationId: params.id || '',
                    quoteIds: selectedIds
                }
            }
        });

        if (createError) {
            console.log(createError[0].message);
            setToastMessage({
                message: 'Save Quote selection failed',
                type: 'error',
                show: true,
            });
        } else {
            setToastMessage({
                message: 'Save Quote selection successful',
                type: 'success',
                show: true,
            });
            setEnabled(false);
        }
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
            {
                enabled
                    ?
                    <>
                        <Card className={classes.selectionWrapper}>
                            <Grid container justifyContent="flex-end">
                                <Grid size={{ xs: 8 }}>
                                    <GridItem>
                                        <span
                                            className={classes.textBlack}
                                        >
                                            Remaining selections for quote PDF : <b>{remainingCount}</b>
                                        </span>
                                    </GridItem>
                                </Grid>
                                <Grid size={{ xs: 4 }}>
                                    <GridItem sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="small"
                                            startIcon={<Save />}
                                            disabled={createLoading || remainingCount > 0}
                                            onClick={() => saveSelection()}
                                        >
                                            {createLoading ? 'Generating...' : 'Generate'}
                                        </Button>
                                        &nbsp;
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            size="small"
                                            startIcon={<Close />}
                                            onClick={() => setEnabled(false)}
                                            disabled={createLoading}
                                        >
                                            Cancel
                                        </Button>
                                    </GridItem>
                                </Grid>
                            </Grid>
                            <br />
                            {children}
                        </Card>
                    </>
                    :
                    children
            }
        </>

    );
};

export default QuoteSelector;