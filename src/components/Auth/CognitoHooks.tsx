import React from "react";
import Amplify from "aws-amplify";
import Auth, { CognitoUser } from "@aws-amplify/auth";

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

export type SignInInput = {
  email: string;
  password: string;
  onSuccess: (user: AuthUser) => void;
  onError: (err: any) => void;
};

export type SignOutCb = () => void;

export type ResendSignUpInput = {
  email: string;
};

export type ForgotPasswordInput = {
  email: string;
};

export type ResetPasswordInput = {
  email: string;
  code: string;
  password: string;
};

export type CompletePasswordInput = {
  user: CognitoUser;
  password: string;
};

export type AuthChallengeName =
  | "NEW_PASSWORD_REQUIRED"
  | "SMS_MFA"
  | "SOFTWARE_TOKEN_MFA"
  | "MFA_SETUP";

export type AuthUser =  CognitoUser & {
  challengeName: AuthChallengeName;
  signInUserSession: any;
  username: string;
}

interface AuthState {
  user: AuthUser | null;
  signIn(input : SignInInput): Promise<void>;
  signOut(cb: SignOutCb): Promise<void>;
  refreshUserSession(): Promise<AuthUser | null>;
}

export const AuthContext = React.createContext<AuthState>({
  user: null,
  signIn: async (input) => {},
  signOut: async (cb) => {},
  refreshUserSession: async () => null
});

interface AuthProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children } : AuthProps) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const [user, setUser] = React.useState<AuthUser | null>(null);

  React.useEffect(() => {
    let active = true;

    const check = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        if (active) {
          setUser(user);
        }
      } catch (error) {
        if (active) {
          setUser(null);
        }
      }
    }

    check();

    return () => { active = false }
  }, [setUser]);

  const signIn = React.useCallback(async ({ email, password, onSuccess, onError } : SignInInput) => {
    try {
      const user = await Auth.signIn(email, password);
      setUser(user);
      onSuccess(user);
    } catch(err) {
      onError(err);
    }
  }, [setUser]);

  const signOut = React.useCallback(async (cb: SignOutCb) => {
    await Auth.signOut();
    setUser(null);
    if(cb) {
      cb();
    }
  }, [setUser]);

  const refreshUserSession = React.useCallback(async () => {
    const user = await Auth.currentAuthenticatedUser();
    const now = Math.floor(Date.now() / 1000);
    const issuedAt = user?.getSignInUserSession()?.getIdToken().getIssuedAt();
    const drift = now - issuedAt;
    //  refresh after 300 seconds
    if (drift > 300) {
      return new Promise<AuthUser | null>((resolve, reject) => {
        user?.getSession((err:any, session:any) => {
          if(err) {
            reject(err);
            return;
          }
          const refreshToken = session.getRefreshToken();
          user.refreshSession(refreshToken, async (err: any, data: any) => {
            if(err) {
              await Auth.signOut();
              setUser(null);
              resolve(null);
            } else {
              const newUser = Auth.currentAuthenticatedUser({bypassCache: true});
              resolve(newUser);
              //  don't update state, it could cause full app refresh, since library handles the caching
              //  we don't need to update user in session, useCurrentUser for token retrievals
            }
          });
        });
      });     
    }
    return Promise.resolve(user);
  }, [setUser]);


  return { user, signIn, signOut, refreshUserSession };
}

export function useUser() {
  const { user } = React.useContext(AuthContext);
  if (!user) {
    return null;
  }
  return user;
}

export function useCurrentUser() {
  return async function cognitoAuth() {
    return await Auth.currentAuthenticatedUser();
  }
}

export function useSignIn() {
  return React.useContext(AuthContext).signIn;
}

export function useSignOut() {
  return React.useContext(AuthContext).signOut;
}

export function useRefreshUserSession() {
  return React.useContext(AuthContext).refreshUserSession;
}

export function useForgotPassword() {
  return async function forgotPassword({ email } : ForgotPasswordInput) {
    await Auth.forgotPassword(email);
  }
}

export function useResetPassword() {
  return async function resetPassword({ email, code, password } : ResetPasswordInput) {
    await Auth.forgotPasswordSubmit(email, code, password);
  }
}

export function useCompleteNewPassword() {
  return async function completeNewPassword({ user, password } : CompletePasswordInput) {
    await Auth.completeNewPassword(user, password);
  }
}
