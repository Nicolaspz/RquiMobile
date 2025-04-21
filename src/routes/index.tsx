import React, { useContext, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import AppRoutes from './app.routes';
import AuthRoutes from './auth.routes';
import { AuthContext } from '../contexts/AuthContext';
import Welcome from '../pages/Welcome';

function Routes() {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const [showWelcome, setShowWelcome] = useState(true);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#1d1d2e',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size={60} color="#f5f7fb" />
      </View>
    );
  }

  if (isAuthenticated) {
    return showWelcome ? (
      <Welcome onStart={() => setShowWelcome(false)} />
    ) : (
      <AppRoutes />
    );
  } else {
    return <AuthRoutes />;
  }
}

export default Routes;
