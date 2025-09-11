import { useApolloClient } from "@apollo/client";
import { useSignOut } from "./CognitoHooks";
import { useEffect } from "react";

export default function Logout() {
  const client = useApolloClient();
  const signOut = useSignOut();

  // Trigger sign out immediately on render
  useEffect(() => {
    signOut(() => {
      client.resetStore();
      window.location.replace("/login");
    });
  }, [client, signOut]);

  return null; // No UI needed
}

