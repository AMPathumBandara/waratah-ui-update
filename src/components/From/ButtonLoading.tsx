import CircularProgress from "@mui/material/CircularProgress";
import { createStyles } from "@mui/material/styles";
import classNames from "classnames";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import {
  createTheme,
  ThemeProvider,
  useTheme,
} from "@mui/material/styles";

// const useStyles = makeStyles((theme: Theme) =>
// ({
//   colorPrimary: {
//     color: theme.palette.primary.main,
//   },
//   colorSecondary: {
//     color: theme.palette.secondary.main,
//   },
//   colorContrast: {
//     color: theme.palette.primary.contrastText,
//   },
// })
// );

interface LoadingIconProps {
  loading: Boolean;
  color?: "primary" | "secondary" | "contrast";
}
export default function ButtonLoading(props: LoadingIconProps) {
  const { loading, color = "primary" } = props;

  const theme = useTheme();

  // extend / override the current theme
  const pageTheme = createTheme(theme, {
    custom: {
      colorPrimary: {
        color: theme.palette.primary.main,
      },
      colorSecondary: {
        color: theme.palette.secondary.main,
      },
      colorContrast: {
        color: theme.palette.primary.contrastText,
      },
    },
  });

  if (!loading) return <></>;

  return (
    <ThemeProvider theme={pageTheme}>
      <CircularProgress
        size={20}
        sx={
          color === "primary"
            ? theme.custom.colorPrimary
            : color === "secondary"
            ? theme.custom.colorSecondary
            : theme.custom.colorContrast
        }
      />
    </ThemeProvider>
  );
}
