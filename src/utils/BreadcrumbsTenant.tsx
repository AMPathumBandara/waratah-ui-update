// React Imports
import React from "react";
// 3rd Parry
// Material UI
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";

import { Link, Breadcrumbs, Grid, SvgIcon } from "@mui/material";
// Local
import { ReactComponent as BrokerIcon } from "./Broker.svg";
import { ReactComponent as TenantIcon } from "./Tenant.svg";
import GridItem from "components/Layout/GridItem";
// Styles
const useStyles = makeStyles((theme: Theme) => ({
  container: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  font: {
    fontSize: "0.8em",
  },
  icon: {
    height: 30,
    width: 40,
    marginRight: 8,
    fill: "#525a69",
  },
}));

// Interface
interface Props {
  data: {
    name: string;
    link: string;
  }[];
}

const BreadcrumbsTenant: React.FC<Props> = ({ data }) => {
  // Styles
  const classes = useStyles();

  return (
    <Breadcrumbs aria-label="breadcrumb" className={classes.container}>
      {data.map((link, index) => (
        <Grid container key={index}>
          <Grid>
            <GridItem>
              {index === 0 ? (
                <TenantIcon className={classes.icon} />
              ) : (
                <BrokerIcon className={classes.icon} />
              )}
            </GridItem>
          </Grid>
          <Grid>
            <GridItem>
              <Link color="inherit" href={link.link} className={classes.font}>
                {link.name}
              </Link>
            </GridItem>
          </Grid>
        </Grid>
      ))}
    </Breadcrumbs>
  );
};

export default BreadcrumbsTenant;
