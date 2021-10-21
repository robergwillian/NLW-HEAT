import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../service/api";

type User = {
  id: number;
  name: string;
  login: string;
  avatar_url: string;
};

type AuthContextData = {
  user: User | null;
  signInUrl: string;
  signOut : () => void;
};

type AuthResponse = {
  token: string;
  user: {
    id: number;
    avatar_url: string;
    name: string;
    login: string;
  };
};

type AuthProvider = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider(props: AuthProvider) {
  const [user, setUser] = useState<User | null>(null);

  
  async function signIn(gitHubCode: string) {
      const response = await api.post<AuthResponse>("authenticate", {
          code: gitHubCode,
        });
        
        const { token, user } = response.data;
        
        localStorage.setItem("doWhile:token", token);
        
        api.defaults.headers.common.authorization = `Bearer ${token}`;
        
        setUser(user);
    }

    function signOut() {
        setUser(null)
        localStorage.removeItem("doWhile:token")
    }
    
    
    useEffect(() => {
        const token = localStorage.getItem("doWhile:token");
        
        if (token) {
            api.defaults.headers.common.authorization = `Bearer ${token}`;
            
            api.get<User>("/profile").then((response) => {
                setUser(response.data)
                
            });
        }
    }, []);
    
    useEffect(() => {
        const url = window.location.href;
        const hasGithubCode = url.includes("?code=");
        
        if (hasGithubCode) {
            const [urlWithoutCode, gitHubCode] = url.split("?code=");
            
            window.history.pushState({}, "", urlWithoutCode);
            signIn(gitHubCode);
        }
    }, []);
    
    
    const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=e62eec4bd011f9479e5e&redirect_uri=http://localhost:3000`;
    
    return (
        <AuthContext.Provider value={{ signInUrl, user, signOut }}>
      {props.children}
    </AuthContext.Provider>
  );
}
