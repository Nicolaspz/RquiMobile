import React, { useState, createContext, ReactNode, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View } from 'react-native';
import { api } from "../services/api";

type authContextData = {
  user: UserProps;
  isAuthenticated: boolean;
  signIn: (credentials: SignInProps) => Promise<void>;
  signUp: (data: SignUpProps) => Promise<void>;
  loadingAuth: boolean;
  loading: boolean;
  sigOut: () => Promise<void>;
};

type UserProps = {
  id: string;
  name: string;
  email: string;
  token: string;
  role: string;
  telefone: string;
  tipo_pagamento: string;
  nif: string;
  morada: string;
  user_name: string;
};

type AuthProviderProps = {
  children: ReactNode;
};

type SignInProps = {
  credential: string;
  password: string;
};

type SignUpProps = {
  name: string;
  email: string;
  role: string;
  telefone: string;
  tipo_pagamento: string;
  morada: string;
  nif: string;
  user_name: string;
};

export const AuthContext = createContext({} as authContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProps>({
    id: '',
    name: '',
    email: '',
    token: '',
    role: '',
    telefone: '',
    tipo_pagamento: '',
    nif: '',
    morada: '',
    user_name: ''
  });

  const [loadingAuth, setLoadingAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user.name;

  useEffect(() => {
    async function getUser() {
      const userInfo = await AsyncStorage.getItem('@sujeitopizzaria');
      let hasUser: UserProps = JSON.parse(userInfo || '{}');
      if (Object.keys(hasUser).length > 0) {
        api.defaults.headers.common['Authorization'] = `Bearer ${hasUser.token}`;
        setUser(hasUser);
      }
      setLoading(false);
    }

    getUser();
  }, []);

  async function signIn({ credential, password }: SignInProps) {
    setLoadingAuth(true);

    try {
      const response = await api.post('/session', { credential, password });

      const data = response.data;
      await AsyncStorage.setItem('@sujeitopizzaria', JSON.stringify(data));

      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      setUser(data);
      setLoadingAuth(false);
    } catch (error: any) {
      setLoadingAuth(false);
      throw error.response?.data || { error: 'Erro ao tentar se comunicar com o servidor' };
    }
  }

  async function signUp(data: SignUpProps) {
    setLoadingAuth(true);

    try {
      const response = await api.post('/users', data);
      //console.log('Sucesso', 'Usuário registrado com sucesso!');
      setLoadingAuth(false);
    } catch (error: any) {
      setLoadingAuth(false);
      console.log('Erro', 'Erro ao registrar usuário', error);
      throw error.response?.data || { error: 'Erro ao registrar usuário. Tente novamente.' };
    }
  }

  async function sigOut() {
    await AsyncStorage.clear().then(() => {
      setUser({
        id: '',
        name: '',
        email: '',
        token: '',
        role: '',
        telefone: '',
        tipo_pagamento: '',
        nif: '',
        morada: '',
        user_name: ''
      });
    });
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signIn, signUp, loading, loadingAuth, sigOut }}>
      <View style={{ flex: 1 }}>{children}</View>
    </AuthContext.Provider>
  );
}
