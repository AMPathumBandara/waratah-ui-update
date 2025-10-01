import { Dialog, DialogContent, Grid, IconButton } from "@mui/material";
import { useApplicationModalContext } from "components/Context/ApplicationModalContext";
import GridItem from "components/Layout/GridItem";
import InsuredApplicationDetails from "components/InsuredApplicationDetails";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation, useParams } from "react-router-dom";
import { useApplicationStageQuery } from "generated/graphql";
import {
    createTheme,
    ThemeProvider,
    useTheme,
} from "@mui/material/styles";
import { memo } from "react";

const ApplicationModal2 = () => {
    const location = useLocation();

    const { onClose } = useApplicationModalContext();

    const locationState = location.state as {
        modalTitle?: string;
    }

    const theme = useTheme();

    const pageTheme = createTheme(theme, {
        custom: {
            modalWrapper: {
                "& .MuiDialogContent-root": {
                    minHeight: "60vh",
                    "&::-webkit-scrollbar": {
                        width: 10,
                    },
                    "&::-webkit-scrollbar-track": {
                        backgroundColor: theme.palette.grey[300],
                        borderRadius: "10px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: theme.palette.grey[400],
                        borderRadius: "10px",
                    },
                },
            },
        }
    });

    return (
        <ThemeProvider theme={pageTheme}>
            <div>
                <Dialog
                    open
                    aria-describedby="dialog-description"
                    fullWidth={true}
                    disableEnforceFocus // This prevents focus trapping
                    disableAutoFocus // Optional: Prevents automatic focus on MUI modal
                    maxWidth="lg"
                    className="modalWrapper"
                >
                    <ApplicationModalHeader title={locationState?.modalTitle ?? ""} headerClose={true} setClose={onClose} />
                    <DialogContent>
                        <MemorizedApplicationDetails />
                    </DialogContent>
                </Dialog>
            </div>
        </ThemeProvider>
    );
}

export default ApplicationModal2;

interface ApplicationModalHeaderProps {
    title?: string;
    headerClose?: boolean;
    setClose?: any;
}

export interface ApplicationParams extends Record<string, string | undefined> {
    id?: string;
}

export const ApplicationTitle = (props: ApplicationModalHeaderProps) => {
    const params = useParams<ApplicationParams>();

    console.log("id", params.id);

    const { data, loading } = useApplicationStageQuery({
        variables: {
            id: params.id,
        },
        fetchPolicy: "cache-first",
        nextFetchPolicy: "cache-first"
    });
    if (loading) {
        return <></>;
    }

    console.log(data);

    return (
        <>Update - {data?.insurance_application_by_pk?.insured_organization?.name}</>
    );
};

const ApplicationModalHeader: React.FC<ApplicationModalHeaderProps> = props => {
    const params = useParams<ApplicationParams>();

    return (
        <Grid
            container
            spacing={0}
            justifyContent="space-between"
            alignItems="flex-start"
            className="modal-header"
            wrap="nowrap"
        >
            <Grid>
                <GridItem>
                    <h4 className="modal-title">
                        {!params.id ? props.title : <ApplicationTitle />}
                    </h4>
                </GridItem>
            </Grid>
            <Grid>
                <GridItem>
                    {props.headerClose && (
                        <IconButton
                            aria-label="close"
                            size="medium"
                            className="modal-close"
                            onClick={() => props.setClose(true)}
                        >
                            <CloseIcon fontSize="medium" />
                        </IconButton>
                    )}
                </GridItem>
            </Grid>
        </Grid>
    );
};

const MemorizedApplicationDetails = memo(InsuredApplicationDetails);