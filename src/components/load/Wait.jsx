import React, { useState, useEffect } from 'react';
import Loading from './Loading';

const LoadingScreen = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => {
      setLoading(false);
    }, 2000); // adjust the time as needed
  }, []);
  
  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <h1>Welcome to my app!</h1>
      {/* Your main app content */}
    </div>
  );
};

export default LoadingScreen;
