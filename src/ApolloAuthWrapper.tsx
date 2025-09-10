// src/apollo/ApolloAuthWrapper.tsx
import React, { ReactNode } from "react";
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { setContext } from "@apollo/client/link/context";
import { useRefreshUserSession } from "components/Auth/CognitoHooks";

interface ApolloAuthWrapperProps {
  children: ReactNode;
}

const ApolloAuthWrapper: React.FC<ApolloAuthWrapperProps> = ({ children }) => {
  const refreshUserSession = useRefreshUserSession();

  // HTTP Link
  const httpLink = createHttpLink({
    uri: import.meta.env.VITE_GRAPHQL_HTTP_URL,
  });

  // WebSocket Link using graphql-ws
  const wsLink = new GraphQLWsLink(
    createClient({
      url: import.meta.env.VITE_GRAPHQL_WS_URL!,
      connectionParams: async () => {
        try {
          const user = await refreshUserSession();
          return {
            headers: {
              authorization: `Bearer ${user
                ?.getSignInUserSession()
                ?.getIdToken()
                .getJwtToken()}`,
            },
          };
        } catch {
          return { headers: {} };
        }
      },
      retryAttempts: 5, // optional
    })
  );

  // Auth Link
  const authLink = setContext(async (_, { headers }) => {
    try {
      const user = await refreshUserSession();
      return {
        headers: {
          ...headers,
          authorization: `Bearer ${user
            ?.getSignInUserSession()
            ?.getIdToken()
            .getJwtToken()}`,
        },
      };
    } catch {
      return { headers };
    }
  });

  // Split link: subscriptions vs queries/mutations
  const splitLink = ApolloLink.split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink,
    authLink.concat(httpLink)
  );

  // Apollo Client
  const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default ApolloAuthWrapper;
