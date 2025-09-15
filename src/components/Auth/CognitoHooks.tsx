// src/components/Auth/CognitoHooks.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Amplify, Auth } from "aws-amplify";
import { CognitoUser } from "@aws-amplify/auth";


Amplify.configure({
  Auth: {
    region: "us-east-1",
    identityPoolRegion: "us-east-1",
    userPoolId: import.meta.env.VITE_USER_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_USER_POOL_WEB_CLIENT_ID,
    authenticationFlowType: "USER_PASSWORD_AUTH",
    storage: localStorage,
  },
});

// ---------------- Types ----------------
export type AuthChallengeName =
  | "NEW_PASSWORD_REQUIRED"
  | "SMS_MFA"
  | "SOFTWARE_TOKEN_MFA"
  | "MFA_SETUP";

export type AuthUser = CognitoUser & {
  challengeName: AuthChallengeName;
  signInUserSession: any;
  username: string;
};

export type SignInInput = {
  email: string;
  password: string;
  onSuccess: (user: AuthUser) => void;
  onError: (err: any) => void;
};

export type SignOutCb = () => void;
export type ForgotPasswordInput = { email: string };
export type ResetPasswordInput = { email: string; code: string; password: string };
export type CompletePasswordInput = { user: CognitoUser; password: string };

// ---------------- Context ----------------
interface AuthState {
  user: AuthUser | null;
  signIn(input: SignInInput): Promise<void>;
  signOut(cb?: SignOutCb): Promise<void>;
  refreshUserSession(): Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

// ---------------- Hook ----------------
function useProvideAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let active = true;

    Auth.currentAuthenticatedUser()
      .then((u) => active && setUser(u))
      .catch(() => active && setUser(null));

    return () => { active = false };
  }, []);

  const signIn = useCallback(async ({ email, password, onSuccess, onError }: SignInInput) => {
    try {
      const u = await Auth.signIn(email, password);
      setUser(u);
      onSuccess(u);
    } catch (err) {
      onError(err);
    }
  }, []);

  const signOut = useCallback(async (cb?: SignOutCb) => {
    await Auth.signOut();
    setUser(null);
    cb?.();
  }, []);

  const refreshUserSession = useCallback(async (): Promise<AuthUser | null> => {
    const u = await Auth.currentAuthenticatedUser();
    const now = Math.floor(Date.now() / 1000);
    const issuedAt = u?.getSignInUserSession()?.getIdToken().getIssuedAt();

    if (issuedAt && now - issuedAt > 300) {
      return new Promise<AuthUser | null>((resolve, reject) => {
        u?.getSession((err: any, session: any) => {
          if (err) return reject(err);
          const refreshToken = session.getRefreshToken();
          u.refreshSession(refreshToken, async (err: any) => {
            if (err) {
              await Auth.signOut();
              setUser(null);
              resolve(null);
            } else {
              const newUser = await Auth.currentAuthenticatedUser({ bypassCache: true });
              resolve(newUser);
            }
          });
        });
      });
    }

    return u;
  }, []);

  return { user, signIn, signOut, refreshUserSession };
}

// ---------------- Exported Hooks ----------------
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const useUser = () => useAuth().user;
export const useSignIn = () => useAuth().signIn;
export const useSignOut = () => useAuth().signOut;
export const useRefreshUserSession = () => useAuth().refreshUserSession;

export function useForgotPassword() {
  return async ({ email }: ForgotPasswordInput) => {
    await Auth.forgotPassword(email);
  };
}

export function useResetPassword() {
  return async ({ email, code, password }: ResetPasswordInput) => {
    await Auth.forgotPasswordSubmit(email, code, password);
  };
}

export function useCompleteNewPassword() {
  return async ({ user, password }: CompletePasswordInput) => {
    await Auth.completeNewPassword(user, password);
  };
}
