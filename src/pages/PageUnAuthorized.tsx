import { Grid, Typography } from "@mui/material";
import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class PageUnAuthorized extends Component {
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
              <h3>Access Denied!</h3>
              <p>The page you're looking for was not allowed!</p>
              <Link to={{ pathname: `/` }}>Back to Home</Link>
            </div>
          </Grid>
        </Grid>
      </div>
    );
  }
}
