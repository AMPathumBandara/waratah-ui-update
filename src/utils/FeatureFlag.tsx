// import { CircularProgress } from "@mui/material";
import React, { ReactElement, ReactNode } from "react";
import { useUser } from "components/Auth/CognitoHooks";

type role =
  | "broker"
  | "admin"
  | "underwriter"
  | "intake"
  | "super_admin"
  | "tenant_admin"
  | "broker_power";

export const role_key = "https://hasura.io/jwt/claims/roles";

interface FeatureFlagProps {
  roles: Array<role>;
  checkAll?: boolean;
  fallbackRender: () => any;
  children?: ReactNode
}

const FeatureFlag: React.FC<FeatureFlagProps> = ({
  roles,
  checkAll,
  fallbackRender,
  children,
}): ReactElement => {
  const loggedUser = useUser();

  const userRoles =
    loggedUser?.signInUserSession?.idToken?.payload?.["cognito:groups"][0] ||
    [];

  if (checkAll && roles.every(r => userRoles.includes(r))) {
    return <>{children}</>;
  } else if (
    roles.some(r => {
      return userRoles.includes(r);
    })
  ) {
    return <>{children}</>;
  }
  return fallbackRender();
};

export default FeatureFlag;
