// src/apollo/ApolloAuthWrapper.tsx
import React, { ReactNode, useMemo } from "react";
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
import { onError } from "@apollo/client/link/error";
import { useRefreshUserSession } from "components/Auth/CognitoHooks";

interface ApolloAuthWrapperProps {
  children: ReactNode;
}

const ApolloAuthWrapper: React.FC<ApolloAuthWrapperProps> = ({ children }) => {
  const refreshUserSession = useRefreshUserSession();
  
  // Helper to safely get token
  const getToken = async (): Promise<string | null> => {
    try {
      const user = await refreshUserSession();
      console.log(user);
      return user?.getSignInUserSession()?.getIdToken()?.getJwtToken() ?? null;
    } catch {
      return null;
    }
  };

  // HTTP Link
  const httpLink = createHttpLink({
    uri: import.meta.env.VITE_GRAPHQL_HTTP_URL,
  });

  // Auth Link
  const authLink = setContext(async (_, { headers }) => {
    const token = await getToken();
    return {
      headers: {
        ...headers,
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    };
  });

  // WebSocket Link using graphql-ws
  const wsLink = new GraphQLWsLink(
    createClient({
      url: import.meta.env.VITE_GRAPHQL_WS_URL!,
      connectionParams: async () => {
        const token = await getToken();
        return token ? { headers: { authorization: `Bearer ${token}` } } : {};
      },
      retryAttempts: 5,
    })
  );

  // Error Link
  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.error(
          `[GraphQL error]: Message: ${message}, Location:`,
          locations,
          `Path: ${path}`
        )
      );
    }
    if (networkError) console.error(`[Network error]:`, networkError);
  });

  // Split link: subscriptions vs queries/mutations
  const splitLink = useMemo(() => {
    return ApolloLink.split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      ApolloLink.from([errorLink, authLink, httpLink])
    );
  }, [wsLink, httpLink, authLink]);

  // Apollo Client (stable across renders)
  const client = useMemo(
    () =>
      new ApolloClient({
        link: splitLink,
        cache: new InMemoryCache(),
      }),
    [splitLink]
  );

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default ApolloAuthWrapper;
