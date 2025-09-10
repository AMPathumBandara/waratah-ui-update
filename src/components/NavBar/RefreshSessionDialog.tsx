import { Button, Dialog, DialogActions, DialogContent, DialogTitle, makeStyles, Theme } from "@mui/material";
import { Refresh } from "@material-ui/icons";
import React from "react";

// Style
const useStyles = makeStyles((theme: Theme) => ({
    link: {
        textDecoration: "none",
    },
}));

const handleRefresh = (): void => {
    window.location.reload();
};

// Interfaces
interface RefreshSessionDialogProps {
    open: boolean;
}

const RefreshSessionDialog: React.FC<RefreshSessionDialogProps> = ({
    open
}) => {
    const classes = useStyles();

    return (
        <Dialog 
            open={open} 
            onClose={handleRefresh} 
            aria-labelledby="refresh-session"
            BackdropProps={{
                onClick: (e) => e.stopPropagation(),
            }}
            >
            <DialogTitle id="refresh-session-dialog-title">
                Application Updated
            </DialogTitle>
            <DialogContent>
                <p>
                    A new version of the application is now available. Click the <strong>refresh</strong> button to access the latest content.
                </p>
            </DialogContent>
            <DialogActions>
                <Button startIcon={<Refresh />} onClick={handleRefresh} color="primary">
                    Refresh
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RefreshSessionDialog;