import React from "react";
import { Navigate } from "react-router-dom";
import ARSection from "../sections/ARSection";

function SecondPage() {
  
  const [goToHomePage, setgoToHomePage] = React.useState(false);
  if (goToHomePage) {
    return <Navigate to="/" />;
  }

  const buttonStyle = {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    margin: "10px 0"
  };

  return (
    <div>
      <button 
        onClick={() => setgoToHomePage(true)} 
        style={buttonStyle}
      >
        Home Page
      </button>
      <ARSection />
    </div>
  );
}

export default SecondPage;
