import React from "react";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    borderRadius: "4px",
    background: "#FFF",
    border: "1px solid #D9D9D9",
    position: "relative",
  },
  boxShadow: {
    boxShadow: "0px 3px 2px rgba(0, 0, 0, 0.05)",
  },
  legendTitle: {
    position: "absolute",
    top: "-13px",
    left: "8px",
    padding: "1px 4px",
    background: "#FFFFFF",
    color: "#333333",
    fontWeight: 600,
  },
  fullHeight: {
    height: "100%",
  },
}));

interface CardProps {
  children?: any;
  spacing?: String;
  shadow?: boolean;
  legendTitle?: String;
  fullHeight?: boolean;
}
export default function Card(props: CardProps) {
  const { children, spacing, shadow, legendTitle, fullHeight } = props;
  const classes = useStyles();

  return (
    <div
      className={`default-card ${classes.root} ${shadow && classes.boxShadow} ${
        fullHeight && classes.fullHeight
      }`}
    >
      {legendTitle && <div className={classes.legendTitle}>{legendTitle}</div>}

      {children}
    </div>
  );
}
