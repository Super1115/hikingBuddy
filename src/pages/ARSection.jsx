import React from "react";

const ARSection = ({ route }) => {
  React.useEffect(() => {
    if (route) {
      console.log("Route data:", route);
      // Render or use the route data as needed within ARSection
    }
  }, [route]);

  return <div>Your AR Experience Here</div>;
};

export default ARSection;
