import React from 'react';
import { ApolloClient, ApolloConsumer } from '@apollo/client';
import { useSignOut } from "../Auth/CognitoHooks"; 
import { Button } from "@mui/material";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNewRounded";

const Logout = () => {
  const signOut = useSignOut();
  const handleLogout = (client: ApolloClient<object>) => {   
    signOut(() => {
      client.resetStore();
      // localStorage.removeItem('token');
     
      window.location.href = '/login';
    });

  };

  return (
    <ApolloConsumer>
      {(client) => (
        <Button
          variant="text"
          size="medium"
          startIcon={
            <PowerSettingsNewIcon fontSize="small" />
          }
          onClick={() => handleLogout(client)}
        >
          Logout
        </Button>
      )}
    </ApolloConsumer>
  );
};

export default Logout;