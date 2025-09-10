import React, { useEffect } from "react";
import { Route, useHistory } from "react-router-dom";
import { NavigationAccess } from "utils";
import { useUser } from "components/Auth/CognitoHooks";

export default function ProtectedRoute(props: any) {
  const history = useHistory();

  const loggedUser = useUser();

  if (!loggedUser) {
    history.push("/login");
  }

  const authUser =
    loggedUser?.signInUserSession?.idToken?.payload?.["cognito:groups"][0];

  const Component = props.component;

  const allowUsersPath = NavigationAccess.filter(f => f.path === props.path);

  if (
    props.path !== "*" &&
    authUser &&
    !allowUsersPath[0]?.allowUsers?.includes(`${authUser}`)
  ) {
    history.push("/access-denied");
  }
  return (
    <>
      <Route
        exact={props.exact}
        path={props.path}
        render={() => <Component />}
      />
    </>
  );
}
