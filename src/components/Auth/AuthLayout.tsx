import React from "react";
import { createStyles, createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import { Box, Grid } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import GridItem from "components/Layout/GridItem";

// const useStyles = makeStyles((theme: Theme) =>
// ({
//   root: {
//     minHeight: "100vh",
//     background:
//       "linear-gradient(105.69deg, rgba(196, 212, 255, 0.11) 2.49%, rgba(196, 212, 255, 0) 100.51%)",
//     backgroundSize: "cover",
//     backgroundPosition: "center",
//     display: "flex",
//     alignItems: "center",
//     justifyItems: "center",
//   },
//   loginContainer: {
//     maxWidth: 900,
//     width: "95%",
//     margin: "0 auto",
//     backgroundColor: "white",
//     borderRadius: "10px",
//     padding: "3rem 2rem",
//     boxShadow: "0px 10px 40px rgba(0, 0, 0, 0.08)",
//     "& img": {
//       maxWidth: 320,
//       margin: "0 auto",
//     },
//     "& > div:first-child": {
//       borderRight: "1px solid #e6e6e6",
//     },
//   },
// })
// );

export default function AuthLayout(props: any) {
  const { children } = props;
  const theme = useTheme();

  // extend / override the current theme
  const pageTheme = createTheme(theme, {
    custom: {
      root: {
        minHeight: "100vh",
        background:
          "linear-gradient(105.69deg, rgba(196, 212, 255, 0.11) 2.49%, rgba(196, 212, 255, 0) 100.51%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center", // corrected
      },
      loginContainer: {
        maxWidth: 900,
        width: "95%",
        margin: "0 auto",
        backgroundColor: "white",
        borderRadius: "10px",
        padding: "3rem 2rem",
        boxShadow: "0px 10px 40px rgba(0, 0, 0, 0.08)",
        "& img": {
          maxWidth: 320,
          margin: "0 auto",
        },
        "& > div:first-child": {
          borderRight: "1px solid #e6e6e6",
        },
      },
    },
  });


  return (
    <ThemeProvider theme={pageTheme}>
      <Box className="abc" sx={(theme) => theme.custom.root}>
        <Grid
          container
          spacing={1}
          direction="row"
          sx={(theme) => theme.custom.loginContainer}
        >
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            size={{ xs: 12, md: 6 }}
          >
            <GridItem>
              <img src="/assets/images/visionxlogo.jpg" />
            </GridItem>
          </Grid>
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            size={{ xs: 12, md: 6 }}
          >
            <GridItem>
              {children}
            </GridItem>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
}
