import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../components/styles.css";
import ARSection from "../sections/ARSection";
import { Navigate } from "react-router-dom";


const route = {
  start: 0.0,
  end: 0.0,
};

function locationUpdate(){
  console.log("Hi");
  const startLocation = document.getElementById("start-location").value;
  const endLocation = document.getElementById("end-location").value;
  // You can store these values in variables
  console.log("Start Location:", startLocation);
  console.log("End Location:", endLocation);

  route.start = parseFloat(startLocation); // Ensure the input is converted to a number
  route.end = parseFloat(endLocation);
  console.log("Updated Route:", route);
}

// Component for Toast Notifications
const Toast = ({ message, isVisible, onHide }) => (
  <motion.div
    className={`toast ${isVisible ? "show" : ""}`}
    initial={{ x: 120 }}
    animate={{ x: isVisible ? 0 : 120 }}
    exit={{ x: 120 }}
  >
    <span className="toast-icon">✨</span>
    <span className="toast-message">{message}</span>
  </motion.div>
);

// Landscape Recognition Component
const LandscapeRecognition = ({ isVisible, landscape, tips }) => (
  <motion.div
    className="landscape-recognition"
    initial={{ y: 50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 50, opacity: 0 }}
    style={{ display: isVisible ? "block" : "none" }}
  >
    <h3>Landscape Information</h3>
    <p id="landscape-description">{landscape}</p>
    <div id="nature-tips" dangerouslySetInnerHTML={{ __html: tips }} />
  </motion.div>
);

// Main App Component
const Homepage = () => {
  const [map, setMap] = useState(null);
  const [startMarker, setStartMarker] = useState(null);
  const [endMarker, setEndMarker] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDropdownActive, setIsDropdownActive] = useState(false);
  const [cityName, setCityName] = useState("Loading...");
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isARActive, setIsARActive] = useState(false);
  const [currentLandscape, setCurrentLandscape] = useState("");
  const [natureTips, setNatureTips] = useState("");

  // Initialize map
  useEffect(() => {
    if (window.google) {
      const initialLocation = { lat: 37.7749, lng: -122.4194 };
      const newMap = new window.google.maps.Map(
        document.getElementById("map"),
        {
          center: initialLocation,
          zoom: 12,
        }
      );

      const newDirectionsService = new window.google.maps.DirectionsService();
      const newDirectionsRenderer = new window.google.maps.DirectionsRenderer();
      newDirectionsRenderer.setMap(newMap);

      setMap(newMap);
      setDirectionsService(newDirectionsService);
      setDirectionsRenderer(newDirectionsRenderer);

      getUserLocation();
    }
  }, []);

  // Toast handler
  const showToast = useCallback((message) => {
    setToastMessage(message);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 3000);
  }, []);

  // Get user location
  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        const geocoder = new window.google.maps.Geocoder();
        const latLng = new window.google.maps.LatLng(lat, lng);

        geocoder.geocode({ location: latLng }, (results, status) => {
          if (status === "OK" && results[0]) {
            const city = results[0].address_components.find((comp) =>
              comp.types.includes("locality")
            )?.long_name;
            if (city) setCityName(city);
          }
        });
      });
    }
  }, []);

  // Route setting handler
  const setRoute = useCallback(() => {
    const startLocation = document.getElementById("start-location").value;
    const endLocation = document.getElementById("end-location").value;

    if (!startLocation || !endLocation) return;

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address: startLocation }, (results, status) => {
      if (status === "OK") {
        const setRoute = useCallback(async () => {
          const startLocation = document.getElementById("start-location").value;
          const endLocation = document.getElementById("end-location").value;

          if (!startLocation || !endLocation) {
            showToast("Please enter both start and end locations");
            return;
          }

          const geocoder = new window.google.maps.Geocoder();

          try {
            // Convert start location to coordinates
            const startResults = await new Promise((resolve, reject) => {
              geocoder.geocode(
                { address: startLocation },
                (results, status) => {
                  if (status === "OK") resolve(results);
                  else reject(new Error("Geocoding failed for start location"));
                }
              );
            });

            // Convert end location to coordinates
            const endResults = await new Promise((resolve, reject) => {
              geocoder.geocode({ address: endLocation }, (results, status) => {
                if (status === "OK") resolve(results);
                else reject(new Error("Geocoding failed for end location"));
              });
            });

            const startLatLng = [
              startResults[0].geometry.location.lat(),
              startResults[0].geometry.location.lng(),
            ];

            const endLatLng = [
              endResults[0].geometry.location.lat(),
              endResults[0].geometry.location.lng(),
            ];

            // Clear previous markers and route
            if (startMarker) startMarker.setMap(null);
            if (endMarker) endMarker.setMap(null);
            if (directionsRenderer)
              directionsRenderer.setDirections({ routes: [] });

            // Set new markers
            const newStartMarker = new window.google.maps.Marker({
              position: { lat: startLatLng[0], lng: startLatLng[1] },
              map: map,
              title: "Start",
            });

            const newEndMarker = new window.google.maps.Marker({
              position: { lat: endLatLng[0], lng: endLatLng[1] },
              map: map,
              title: "End",
            });

            setStartMarker(newStartMarker);
            setEndMarker(newEndMarker);

            // Find the hiking route
            const route = await findNearestRoute(startLatLng, endLatLng);

            if (!route) {
              setIsRoutingError(true);
              showToast("No suitable hiking route found");
              return;
            }

            setRouteNodes(route);

            // Draw the route on the map
            const path = route.map((node) => ({
              lat: node.coordinates[0],
              lng: node.coordinates[1],
            }));

            const routePath = new window.google.maps.Polyline({
              path: path,
              geodesic: true,
              strokeColor: "#FF0000",
              strokeOpacity: 1.0,
              strokeWeight: 2,
            });

            routePath.setMap(map);

            // Fit bounds to show the entire route
            const bounds = new window.google.maps.LatLngBounds();
            path.forEach((point) => bounds.extend(point));
            map.fitBounds(bounds);

            showToast("Route found successfully!");
          } catch (error) {
            console.error("Error setting route:", error);
            showToast("Error finding route. Please try again.");
            setIsRoutingError(true);
          }
        }, [map, startMarker, endMarker, directionsRenderer, showToast]);
        handleStartMarker(startLatLng);

        geocoder.geocode({ address: endLocation }, (results, status) => {
          if (status === "OK") {
            const endLatLng = results[0].geometry.location;
            handleEndMarker(endLatLng);
            calculateRoute(startLatLng, endLatLng);
          }
        });
      }
    });
  }, [map, directionsService, directionsRenderer]);

  //Navigation
  const [goToSecondPage, setGoToSecondPage] = React.useState(false);
  if (goToSecondPage) {
    return <Navigate to="/ARPage" />;
  }

  // Render
  return (
    <div className="container">
      {/* Welcome */}
      <motion.section
        className="welcome"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2>Welcome to Hiking Buddy!</h2>
      </motion.section>

      {/* Right Side */}
      <div className="right-side">
        <div id="map"></div>
        <div className="map-controls">
          <motion.button
            className="map-control-button animate__animated animate__fadeIn"
            onClick={() => {
              setGoToSecondPage(true);
            }}
          >
            <span>AR</span>
          </motion.button>
          <motion.button
            className="map-control-button animate__animated animate__fadeIn"
            onClick={() => showToast("Map style updated")}
          >

          </motion.button>
        </div>

        {/* Overlay Bar */}
        <motion.div className="overlay-bar animate__animated animate__fadeIn">
          <div>
            <input
              type="number"
              id="start-location"
              placeholder="Start Location"
              step="any" // Allows floating point numbers
            />
            <input
              type="number"
              id="end-location"
              placeholder="End Location"
              step="any" // Allows floating point numbers
            />
          </div>
          <div className="travel-mode"></div>
          <button className="ar-button" onClick={locationUpdate}>
            Set Route
          </button>
        </motion.div>
      </div>

      {/* AR Container */}
      <AnimatePresence>
        {isARActive && (
          <motion.div
            className="ar-container"
            id="ar-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="ar-scene">
              {/* AR content will be added here */}
              <ARSection />
            </div>
            <LandscapeRecognition
              isVisible={isARActive}
              landscape={currentLandscape}
              tips={natureTips}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        isVisible={isToastVisible}
        onHide={() => setIsToastVisible(false)}
      />
    </div>
  );
};

export default Homepage;
