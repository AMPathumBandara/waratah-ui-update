import { createTheme, responsiveFontSizes } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "'Open Sans', sans-serif",
    fontSize: 16,
    subtitle1: {
      fontFamily: "'Open Sans', sans-serif",
    },
  },
  palette: {
    background: {
      default: "#FFFFFF",
      emphasis: "#E8EAF6",
      secondary: "#C5CAE9",
      header: "#121037",
    },
    text: {
      primary: "#4E5766",
      secondary: "#4E5766",
      hint: "#9FA8DA",
    },
    primary: {
      main: "#47763B",
    },
    secondary: {
      main: "#36563D",
    },
    contrastThreshold: 1.8,
  },
  shadows: [
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
  ],
  overrides: {
    MuiInputBase: {
      input: {
        fontFamily: "'Open Sans', sans-serif",
        fontSize: "16px",
      },
    },
    MuiInputLabel: {
      root: {
        textTransform: "none",
        fontWeight: 600,
        color: "#333333",
      },
    },
    MuiButton: {
      root: {
        textTransform: "none",
      },
    },
  },
});

export default responsiveFontSizes(theme);
