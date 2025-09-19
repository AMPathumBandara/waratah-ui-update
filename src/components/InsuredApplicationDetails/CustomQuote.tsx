import { Box, Button, Card, Collapse, FormControl, Grid, IconButton, NativeSelect, Tooltip } from "@mui/material";
import { Add, AddCircle, Close, PlusOneRounded, Save } from "@mui/icons-material";
import { useCreateCustomQuoteMutation, useGetCustomPolicyLimitsQuery, useGetUnusedRetentionsMutation } from "generated/graphql";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { ApplicationParams } from ".";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import GridItem from "components/Layout/GridItem";

const useStyles = makeStyles((theme: Theme) => ({
    quoteAddCard: {
        borderRadius: "4px",
        background: "#FFF",
        border: "2px solid #8553EE",
        position: "relative",
        padding: "3.5rem 2rem",
        boxShadow: "0px 3px 2px rgba(0, 0, 0, 0.05)",
    },
    quoteActions: {
        position: "absolute",
        top: "10px",
        right: "10px"
    },
    quoteActionsAdd: {
        position: "relative",
        top: "0",
        left: "0",
    },
    quoteActionsClose: {
        position: "absolute",
        top: "10px",
        right: "10px"
    },
    collapseContainer: {
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
    textGrey: {
        color: "#B4B4B4",
        fontSize: "14px",
    },
    textBlack: {
        color: "#333333",
        fontSize: "16px",
        fontWeight: 600,
    },
    selectionInput: {
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
    formControl: {
        minWidth: 120,
    },
    miniSelect: {
        fontSize: '14px',
        '& *': {
            fontSize: '14px',
        },
    },
    styledHR: {
        marginTop: "4px",
        marginBottom: "20px",
        borderTop: "1px solid rgb(255, 255, 255)",
        width: "85%",
    },
}));

interface CustomQuoteProps {
    formOpen?: boolean;
    setFormOpen?: any;
    setQuoteCreateToastMessage?: any;
};

const CustomQuote: React.FC<CustomQuoteProps> = ({
    formOpen,
    setFormOpen,
    setQuoteCreateToastMessage,
}) => {
    const classes = useStyles();
    const [selectedLimit, setSelectedLimit] = useState<number | null>(null);
    const [selectedDeductible, setSelectedDeductible] = useState<number | null>(null);
    const params = useParams<ApplicationParams>();
    const [unUsedDeductibles, setUnusedDeductibles] = useState<Number[]>([]);
    const [delayedOpen, setDelayedOpen] = useState<boolean | undefined>(false);

    const { data: customPolicies, error: customPolicyError, refetch: refetchPolicies } = useGetCustomPolicyLimitsQuery();

    const [
        UnusedRetentionsMutation,
        { loading: deductibleLoading, error: deductibleError }
    ] = useGetUnusedRetentionsMutation({
        errorPolicy: "all"
    });

    const [
        CreateCustomQuoteMutation,
        { loading: createCustomQuoteLoading, error: createCustomQuoteError }
    ] = useCreateCustomQuoteMutation({
        errorPolicy: "all"
    });

    useEffect(() => {
        setTimeout(() => {
            setDelayedOpen(formOpen);
        }, 200);
    }, [formOpen]);

    useEffect(() => {
        setSelectedDeductible(null);

        if (selectedLimit && selectedLimit !== -1) {
            getDeductibles(selectedLimit);
        } else {
            setUnusedDeductibles([]);
        }
    }, [selectedLimit]);

    const getDeductibles = async (limit: number) => {
        const { data: deductibles, errors: deductiblesError } = await UnusedRetentionsMutation({
            variables: {
                object: {
                    applicationId: params.id || '',
                    limit: limit
                }
            }
        });

        if (deductiblesError) {
            console.log(deductiblesError[0].message);
            setUnusedDeductibles([]);
        } else {
            setUnusedDeductibles(deductibles?.getUnusedRetentions?.notUsedDeductibles as Number[] || []);
        }
    }

    const createCustomQuote = async () => {
        const { data: newQuote, errors: newQuoteError } = await CreateCustomQuoteMutation({
            variables: {
                object: {
                    applicationId: params.id || '',
                    limit: Number(selectedLimit),
                    deductible: Number(selectedDeductible),
                }
            }
        });

        if (newQuoteError) {
            console.log(newQuoteError[0].message);
            setQuoteCreateToastMessage({
                message: `Unable to add new quote`,
                type: 'error',
                show: true,
            });
        } else {
            setQuoteCreateToastMessage({
                message: `Quote added successfully`,
                type: 'success',
                show: true,
            });
        }

        setSelectedLimit(-1);
        setFormOpen(false);
    }

    return (
        <>
            {formOpen &&
                <Grid size={{ xs: 12, md: 4 }}>
                    <GridItem>
                        {/* {!formOpen &&
                        <div className={classes.quoteActionsAdd}>
                            <Tooltip
                                title="Add Quote"
                                aria-label="Add Quote"
                            >
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<AddCircle />}
                                    size="small"
                                    onClick={() => setFormOpen(true)}
                                >
                                    Add Quote
                                </Button>
                            </Tooltip>
                        </div>
                    } */}
                        <Collapse in={delayedOpen}>
                            <Card className={classes.quoteAddCard}>
                                {
                                    formOpen && (
                                        <div className={classes.quoteActionsClose}>
                                            <Tooltip
                                                title="Close"
                                                aria-label="Close"
                                            >
                                                <IconButton
                                                    aria-label="Close"
                                                    onClick={() => setFormOpen(false)}
                                                    size="small"
                                                >
                                                    <Close />
                                                </IconButton>
                                            </Tooltip>
                                        </div>
                                    )
                                }
                                <div className={classes.collapseContainer}>
                                    <table className={classes.quotesTable}>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <span className={classes.textGrey}>Limit</span>
                                                    <span className={classes.textGrey}>
                                                        <FormControl className={classes.formControl}>
                                                            <NativeSelect
                                                                className={classes.miniSelect}
                                                                name="limit"
                                                                inputProps={{ 'aria-label': 'limit' }}
                                                                onChange={(e) => setSelectedLimit(Number(e.target.value))}
                                                                value={selectedLimit}
                                                            >
                                                                <option value={-1}>
                                                                    Please select
                                                                </option>
                                                                {
                                                                    customPolicies?.getCustomPolicies?.customPolicyLimits?.map((p, index) => {
                                                                        return <option key={index} value={p as number}>{p}</option>
                                                                    })
                                                                }
                                                            </NativeSelect>
                                                        </FormControl>
                                                    </span>
                                                </td>
                                                <td>
                                                    <span
                                                        className={classes.textBlack}
                                                        style={{ fontSize: "18px" }}
                                                    >
                                                        $xx,xx.xx
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <span className={classes.textGrey}>Sub Limit</span>
                                                </td>
                                                <td>
                                                    <span className={classes.textGrey}>Deductible</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <span className={classes.textBlack} style={{ position: "relative", top: "-8px" }}>
                                                        $xxx,xxx
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={classes.textBlack}>
                                                        <FormControl className={classes.formControl}>
                                                            <NativeSelect
                                                                className={classes.miniSelect}
                                                                name="deductible"
                                                                inputProps={{ 'aria-label': 'deductible' }}
                                                                onChange={(e) => setSelectedDeductible(Number(e.target.value))}
                                                            >
                                                                {
                                                                    (!selectedLimit || !unUsedDeductibles || unUsedDeductibles.length == 0) &&
                                                                    <option value={-1}>
                                                                        Select Limit
                                                                    </option>
                                                                }
                                                                {
                                                                    selectedLimit && deductibleLoading &&
                                                                    <option value={-1}>
                                                                        Loading...
                                                                    </option>
                                                                }
                                                                {
                                                                    selectedLimit && !deductibleLoading && !deductibleError
                                                                    && unUsedDeductibles && unUsedDeductibles.length > 0 &&
                                                                    <>
                                                                        <option value={-1}>
                                                                            Please select
                                                                        </option>
                                                                        {
                                                                            unUsedDeductibles?.map((p, index) => {
                                                                                return <option key={index} value={p as number}>{String(p)}</option>
                                                                            })
                                                                        }
                                                                    </>
                                                                }
                                                            </NativeSelect>
                                                        </FormControl>
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <hr className={classes.styledHR} />
                                    <table className={classes.quotesTable}>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <span className={classes.textGrey}>Premium</span>
                                                </td>
                                                <td>
                                                    <span className={classes.textGrey}>
                                                        $xx,xxx.xx
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <span className={classes.textGrey}>Policy Fees</span>
                                                </td>
                                                <td>
                                                    <span className={classes.textGrey}>
                                                        $xxx.xx
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <span className={classes.textGrey}>Tax</span>
                                                </td>
                                                <td>
                                                    <span className={classes.textGrey}>
                                                        $xx.xx
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <span className={classes.textBlack}>Total</span>
                                                </td>
                                                <td>
                                                    <span className={classes.textBlack}>$xx,xx.xx</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <Box display="flex" justifyContent="flex-end" style={{ marginTop: "11px" }}>
                                        <Tooltip
                                            title="Create Quote"
                                            aria-label="Create Quote"
                                        >
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                startIcon={<Save />}
                                                size="small"
                                                disabled={deductibleLoading || createCustomQuoteLoading || !selectedLimit || !selectedDeductible}
                                                onClick={() => createCustomQuote()}
                                            >
                                                {
                                                    createCustomQuoteLoading ? "Creating..." : "Create"
                                                }
                                            </Button>
                                        </Tooltip>
                                    </Box>
                                </div>
                            </Card>
                        </Collapse>
                    </GridItem>
                </Grid>
            }
        </>
    );
};

export default CustomQuote;