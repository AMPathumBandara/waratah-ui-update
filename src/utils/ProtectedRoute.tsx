import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationAccess } from "utils";
import { useUser } from "components/Auth/CognitoHooks";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  path: string;
}

export default function ProtectedRoute({ component: Component, path }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const loggedUser = useUser();

  useEffect(() => {
    if (!loggedUser) {
      navigate("/login");
      return;
    }

    const authUser =
      loggedUser?.signInUserSession?.idToken?.payload?.["cognito:groups"][0];

    const allowUsersPath = NavigationAccess.filter(f => f.path === path);

    if (
      path !== "*" &&
      authUser &&
      !allowUsersPath[0]?.allowUsers?.includes(`${authUser}`)
    ) {
      navigate("/access-denied");
    }
  }, [loggedUser, navigate, path]);

  // Render the protected component only if the user exists
  if (!loggedUser) return null;

  return <Component />;
}
