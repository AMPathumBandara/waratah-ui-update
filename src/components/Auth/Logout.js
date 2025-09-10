import { ApolloConsumer } from "@apollo/client";
import { useSignOut } from "./CognitoHooks"; 

export default function Logout() {
  const signOut = useSignOut();
  return (
    <ApolloConsumer>{client => signOut(() => {
        client.resetStore();
        window.location.replace("/login");
      })}
    </ApolloConsumer>
  );
}
