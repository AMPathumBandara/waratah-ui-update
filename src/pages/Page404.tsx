import { Grid, Typography } from "@mui/material";
import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class Page404 extends Component {
  render() {
    return (
      <div>
        <Grid
          container
          alignContent="center"
          alignItems="center"
          justifyContent="center"
        >
          <Grid>
            <div className="page404-content">
              <h1>404</h1>
              <h3>Page not found</h3>
              <p>The page you're looking for was not found!</p>
              <Link to={{ pathname: `/` }}>Back to Home</Link>
            </div>
          </Grid>
        </Grid>
      </div>
    );
  }
}
