import CircularProgress from "@mui/material/CircularProgress";
import { createStyles } from "@mui/material/styles";
import classNames from "classnames";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme: Theme) =>
  ({
    colorPrimary: {
      color: theme.palette.primary.main,
    },
    colorSecondary: {
      color: theme.palette.secondary.main,
    },
    colorContrast: {
      color: theme.palette.primary.contrastText,
    },
  })
);

interface LoadingIconProps {
  loading: Boolean;
  color?: "primary" | "secondary" | "contrast";
}
export default function ButtonLoading(props: LoadingIconProps) {
  const { loading, color } = props;
  const classes = useStyles();

  const colorClassName = classNames({
    [classes.colorPrimary]: color === "primary",
    [classes.colorSecondary]: color === "secondary",
    [classes.colorContrast]: color === "contrast",
  });

  if (loading) {
    return (
      <CircularProgress
        size={20}
        className={colorClassName ? colorClassName : classes.colorPrimary}
      />
    );
  } else {
    return <></>;
  }
}
