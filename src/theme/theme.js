// theme.ts
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
      light: "#9d75f1",
    },
    secondary: {
      main: "#36563D",
    },
    grey: {
      500: "#9FA8DA", // add grey for convenience
    },
    contrastThreshold: 1.8,
  },
  shadows: Array(25).fill("none"),
  components: {
    MuiInputBase: {
      styleOverrides: {
        input: {
          fontFamily: "'Open Sans', sans-serif",
          fontSize: "16px",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          color: "#333333",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
  // <-- CUSTOM NESTED STYLES -->
  custom: {
    login: {
      formWrapper: {
        maxWidth: 320,
        width: "100%",
        "& button": {
          boxShadow: "none",
          borderRadius: 3,
          padding: "8px 16px",
        },
        "& .MuiInputBase-root": {
          borderRadius: 3,
        },
      },
      switchFormBtn: {
        cursor: "pointer",
        display: "inline-block",
        fontSize: 14,
        color: "#9FA8DA",
        textDecoration: "none",
        opacity: 0.8,
        "&:hover": {
          opacity: 1,
        },
      },
    },
  },
});

export default responsiveFontSizes(theme);
