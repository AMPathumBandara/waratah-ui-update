import React, { useEffect } from "react";
import { Route, useNavigate } from "react-router-dom";
import { NavigationAccess } from "utils";
import { useUser } from "components/Auth/CognitoHooks";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  path: string;
}

export default function ProtectedRoute({ component: Component, path }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const loggedUser = useUser();

  if (!loggedUser) {
    navigate("/login");
    return null;
  }

  const authUser =
    loggedUser?.signInUserSession?.idToken?.payload?.["cognito:groups"][0];

  //const Component = props.component;

  const allowUsersPath = NavigationAccess.filter(f => f.path === path);

  if (
    path !== "*" &&
    authUser &&
    !allowUsersPath[0]?.allowUsers?.includes(`${authUser}`)
  ) {
    navigate("/access-denied");
    return null;
  }

  // return (
  //   <>
  //     <Route
  //       //exact={props.exact}
  //       path={props.path}
  //       element={<Component />}
  //     />
  //   </>
  // );
  return <Component />
}
