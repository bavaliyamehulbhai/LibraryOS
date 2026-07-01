import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../../services/api';

import { useSelector } from 'react-redux';

const FeatureContext = createContext();

export const FeatureProvider = ({ children }) => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);

  useEffect(() => {
    const fetchFeatures = async () => {
      if (!isAuthenticated) {
        setFeatures([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await api.get('/v1/features/my-access');
        if (res.data.success) {
          setFeatures(res.data.data);
        }
      } catch (error) {
        console.error("Failed to load features", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeatures();
  }, [isAuthenticated]);

  const hasFeature = (featureCode) => {
    return features.includes(featureCode.toUpperCase());
  };

  return (
    <FeatureContext.Provider value={{ features, hasFeature, loading }}>
      {children}
    </FeatureContext.Provider>
  );
};

export const useFeatures = () => useContext(FeatureContext);

export const FeatureGuard = ({ feature, children, fallback = null }) => {
  const { hasFeature, loading } = useFeatures();

  if (loading) return null; // or a skeleton

  if (!hasFeature(feature)) {
    return fallback;
  }

  return children;
};
