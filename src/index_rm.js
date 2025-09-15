import React from "react";
import ReactDOM from "react-dom";
import * as Sentry from "@sentry/react";
import App from "./App";
import ApolloAuthWrapper from "./ApolloAuthWrapper";
import { AuthProvider } from "components/Auth/CognitoHooks";

if (process.env.REACT_APP_SENTRY_URL) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_URL,
    autoSessionTracking: true,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.feedbackIntegration({
        // Additional SDK configuration goes in here, for example:
        colorScheme: "system",
        isEmailRequired: true,
        showBranding: false,
      }),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 0.1,
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  });
}

ReactDOM.render(
  <AuthProvider>
    <ApolloAuthWrapper>
      <App />
    </ApolloAuthWrapper>
    {/* <App /> */}
  </AuthProvider>,
  document.getElementById("root")
);
