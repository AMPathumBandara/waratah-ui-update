import React from "react";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    background: "#FFF",
    borderRight: "1px solid #D9D9D9",
    position: "relative",
    overflow: "hidden",
    height: "calc(100vh - 70px)",
  },
}));

export default function SideBar(props: any) {
  const classes = useStyles();
  return <div className={classes.root}>{props.children}</div>;
}
