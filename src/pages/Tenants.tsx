import React, { Suspense, useState } from "react";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import {
  Route,
  Routes,
  useParams,
  useMatches,
  useNavigate,
} from "react-router";
import { scroller } from "react-scroll";
import { TenantHeader } from "components/Application/TenantHeader";
import Footer from "components/Footer";
import FullScreenLoading from "components/Layout/FullScreenLoading";
import { useUser } from "components/Auth/CognitoHooks";
import { useMeQuery } from "generated/graphql";

const TenantList = React.lazy(() => import("components/Tenent/TenantList"));
const TenantDetails = React.lazy(
  () => import("components/Tenent/TenantDetail")
);
const BrokerList = React.lazy(() => import("components/Broker/BrokerList"));
const BrokerProducerList = React.lazy(
  () => import("components/BrokerProducer/BrokerProducerList")
);

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    marginTop: 60,
  },
}));

export default function Tenents() {
  const classes = useStyles();

  const [searchValue, setsearchValue] = useState("");
  const matches = useMatches();
  const current = matches[matches.length - 1];
  let path = current.pathname;
  const params = useParams();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (params) {
      scroller.scrollTo("focus-tenant", {
        duration: 1000,
        delay: 50,
        smooth: true,
        offset: -50,
      });
    }
  }, [params]);

  return (
    <>
      <div className={classes.container}>
        <TenantHeader
          buttonText="Add New Tenant"
          setButtonClick={() => navigate("/tenants")}
          title="Tenants"
          setSearchValue={(v: any) => setsearchValue(v)}
        />

        <div className="tenant-content-wrapper">
          <div>
            <TenantList searchValue={searchValue} />
          </div>
          <div id="focus-tenant">
            <Suspense fallback={<FullScreenLoading />}>
              <Routes>
                <Route path={`${path}`}>
                  <TenantDetails />
                </Route>
                <Route path={`${path}/:tenant_id`}>
                  <TenantDetails />
                </Route>
                <Route path={`${path}/:tenant_id/brokers/:broker_id`}>
                  <BrokerList />
                </Route>
                <Route
                  path={`${path}/:tenant_id/brokers/:broker_id/broker-producers/:producer_id`}
                >
                  <BrokerProducerList />
                </Route>
              </Routes>
            </Suspense>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
