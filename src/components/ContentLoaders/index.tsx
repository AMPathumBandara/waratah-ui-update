import "react-loading-skeleton/dist/skeleton.css";
import Skeleton from "react-loading-skeleton";
import { Grid } from "@mui/material";
import GridItem from "components/Layout/GridItem";

export const LoadingApplicationItem = (props: any) => (
  <div className="application-item">
    <div className="circle-wrapper">
      <div className="circle">
        <div style={{ marginTop: -5 }}>
          <Skeleton height={35} width={35} borderRadius={35} />
        </div>
      </div>
    </div>
    <div className="info-wrapper">
      <div className="info">
        <h3 className="title">
          <Skeleton height={15} borderRadius={10} />
        </h3>

        <p className="detail">
          <Skeleton height={10} width="75%" borderRadius={10} />
        </p>
      </div>
      <div className="date-wrapper">
        <span className="date">
          <Skeleton height={10} borderRadius={10} />
        </span>

        <span className="date">
          <Skeleton height={10} borderRadius={10} />
        </span>
      </div>
    </div>
  </div>
);

export function SortAsc(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 25 25"
      {...props}
      width="23"
      height="23"
    >
      <path
        fill={props.color}
        d="M11.8 5.6h2.6c.2 0 .3-.1.5-.2.1-.1.2-.3.2-.5V3.7c0-.2-.1-.3-.2-.5-.1-.1-.3-.2-.4-.2h-2.6c-.2 0-.3.1-.5.2s-.2.3-.2.5V5c0 .2.1.3.2.5.1.1.3.1.4.1zm0 5.3H17c.2 0 .3-.1.5-.2.1-.1.2-.3.2-.5V8.9c0-.2-.1-.3-.2-.5-.1-.1-.3-.2-.5-.2h-5.2c-.2 0-.3.1-.5.2-.1.1-.2.3-.2.5v1.3c0 .2.1.3.2.5.2.1.4.2.5.2zm10.5 7.8H11.8c-.2 0-.3.1-.5.2-.1.1-.2.3-.2.5v1.3c0 .2.1.3.2.5.1.1.3.2.5.2h10.5c.2 0 .3-.1.5-.2.1-.1.2-.3.2-.5v-1.3c0-.2-.1-.3-.2-.5-.1-.1-.3-.2-.5-.2zm-10.5-2.6h7.9c.2 0 .3-.1.5-.2.1-.1.2-.3.2-.5v-1.3c0-.2-.1-.3-.2-.5-.1-.1-.3-.2-.5-.2h-7.9c-.2 0-.3.1-.5.2-.1.1-.2.3-.2.5v1.3c0 .2.1.3.2.5.2.2.4.2.5.2zM2.7 8.2h2v12.5c0 .2.1.3.2.5.1.1.3.2.5.2h1.3c.2 0 .3-.1.5-.2.1-.1.2-.3.2-.5V8.2h2c.6 0 .9-.7.5-1.1L6.4 3.2c-.1-.1-.3-.2-.5-.2-.1 0-.3.1-.4.2L2.2 7.1c-.4.4-.1 1.1.5 1.1z"
      />
    </svg>
  );
}

export function SortDesc(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 25 25"
      {...props}
      width="23"
      height="23"
    >
      <path
        fill={props.color}
        d="M14.5 18.8h-2.6c-.2 0-.3.1-.5.2-.1.1-.2.3-.2.5v1.3c0 .2.1.3.2.5.1.1.3.2.5.2h2.6c.2 0 .3-.1.5-.2.1-.1.2-.3.2-.5v-1.3c0-.2-.1-.3-.2-.5-.2-.2-.4-.2-.5-.2zm-5.3-2.7h-2V3.7c0-.2-.1-.3-.2-.5-.1-.1-.2-.2-.4-.2H5.3c-.2 0-.4.1-.5.2-.1.1-.2.3-.2.5v12.5h-2c-.6 0-.9.7-.5 1.1l3.3 3.9c.1.1.3.2.5.2s.3-.1.5-.2l3.3-3.9c.4-.5.1-1.2-.5-1.2zm10.5-7.9h-7.9c-.2 0-.3.1-.5.2-.1.1-.2.3-.2.5v1.3c0 .2.1.3.2.5.1.1.3.2.5.2h7.9c.2 0 .3-.1.5-.2.1-.1.2-.3.2-.5V8.9c0-.2-.1-.3-.2-.5-.1-.1-.3-.2-.5-.2zm-2.6 5.3h-5.2c-.2 0-.3.1-.5.2-.1.1-.2.3-.2.5v1.3c0 .2.1.3.2.5.1.1.3.2.5.2h5.2c.2 0 .3-.1.5-.2.1-.1.2-.3.2-.5v-1.3c0-.2-.1-.3-.2-.5-.2-.1-.3-.2-.5-.2zM22.3 3H11.8c-.2 0-.3.1-.5.2-.1.1-.2.3-.2.5V5c0 .2.1.3.2.5.1.1.3.2.5.2h10.5c.2 0 .3-.1.5-.2.1-.2.2-.4.2-.5V3.7c0-.2-.1-.3-.2-.5s-.3-.2-.5-.2z"
      />
    </svg>
  );
}

export const LoadingLogo = (props: any) => (
  <div style={{ maxWidth: 150, width: "100%" }}>
    <Skeleton
      height={45}
      borderRadius={5}
      style={{ position: "relative", top: -3 }}
    />
  </div>
);
export const LoadingAvatar = (props: any) => (
  <Skeleton width={40} height={40} borderRadius={40} />
);

export const LoadingInput = (props: any) => (
  <Skeleton height={40} borderRadius={5} />
);

export const LoadingScanStatus = (props: any) => (
  <Skeleton height={50} borderRadius={5} />
);

export const LoadingApplicationSteps = (props: any) => (
  <div className="stepsLoader">
    <div className="step-item">
      <Skeleton height={40} width={40} borderRadius={40} />
      <Skeleton height={8} borderRadius={3} />
    </div>

    <div className="steps-seperator">
      <Skeleton height={3} width={70} borderRadius={3} />
    </div>
    <div className="step-item">
      <Skeleton height={40} width={40} borderRadius={40} />
      <Skeleton height={8} borderRadius={3} />
    </div>
    <div className="steps-seperator">
      <Skeleton height={3} width={70} borderRadius={3} />
    </div>
    <div className="step-item">
      <Skeleton height={40} width={40} borderRadius={40} />
      <Skeleton height={8} borderRadius={3} />
    </div>
  </div>
);

export const LoadingScanVirdict = (props: any) => (
  <Skeleton height={100} borderRadius={5} />
);
export const LoadingQuoteCard = (props: any) => (
  <>
    <Grid sx={{ sm: 12, md: 6 }}>
      <GridItem>
        <Skeleton height={100} borderRadius={5} />
      </GridItem>
    </Grid>
    <Grid sx={{ sm: 12, md: 6 }}>
      <GridItem>
        <Skeleton height={100} borderRadius={5} />
      </GridItem>
    </Grid>
  </>
);
export const LoadingQuoteSelectionsCard = (props: any) => (
  <>
    <Grid sx={{ sm: 12, md: 4 }}>
      <GridItem>
        <Skeleton height={100} borderRadius={5} />
      </GridItem>
    </Grid>
    <Grid sx={{ sm: 12, md: 4 }}>
      <GridItem>
        <Skeleton height={100} borderRadius={5} />
      </GridItem>
    </Grid>
    <Grid sx={{ sm: 12, md: 4 }}>
      <GridItem>
        <Skeleton height={100} borderRadius={5} />
      </GridItem>
    </Grid>
  </>
);

export const LoadingBindStatus = (props: any) => (
  <Skeleton height={74} borderRadius={5} />
);
export const LoadingBindTableInfor = (props: any) => (
  <Skeleton height={150} borderRadius={5} />
);
export const LoadingJSONObject = (props: any) => (
  <div className="loadingJsonStyle">
    <Skeleton className="skeletonJsonLine" height={7} borderRadius={5} />
    <Skeleton className="skeletonJsonLine" height={7} borderRadius={5} />
    <Skeleton className="skeletonJsonLine" height={7} borderRadius={5} />
    <Skeleton className="skeletonJsonLine" height={7} borderRadius={5} />
    <Skeleton className="skeletonJsonLine" height={7} borderRadius={5} />
    <Skeleton className="skeletonJsonLine" height={7} borderRadius={5} />
    <Skeleton className="skeletonJsonLine" height={7} borderRadius={5} />
  </div>
);
