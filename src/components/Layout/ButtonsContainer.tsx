import React from "react";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import { Grid } from "@mui/material";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    borderRadius: "4px",
    background: "#FFF",
    border: "1px solid #D9D9D9",
  },
  boxShadow: {
    boxShadow: "0px 3px 2px rgba(0, 0, 0, 0.05)",
  },
}));

interface ButtonContainerProps {
  children?: any;
  spacing?: String;
  margin?: String;
  alignItems?: "baseline" | "center" | "flex-end" | "flex-start" | "stretch";
  alignContent?:
    | "space-around"
    | "space-between"
    | "flex-end"
    | "flex-start"
    | "center"
    | "stretch";
  justifyContent?:
    | "space-around"
    | "space-between"
    | "flex-end"
    | "flex-start"
    | "center"
    | "space-evenly";
}
export default function ButtonsContainer(props: ButtonContainerProps) {
  const {
    children,
    spacing,
    margin,
    alignItems,
    alignContent,
    justifyContent,
  } = props;
  const classes = useStyles();

  return (
    <Grid
      container
      alignItems={alignItems}
      alignContent={alignContent}
      justifyContent={justifyContent}
      style={spacing ? { padding: `${spacing}` } : { padding: "2rem 0 0 0" }}
    >
      {children}
    </Grid>
  );
}
