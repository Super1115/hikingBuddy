import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../components/styles.css";
import ARSection from "../sections/ARSection";
import { useNavigate } from "react-router-dom";
import http from "http"
import * as turf from '@turf/turf';
import fastpriorityqueue from 'fastpriorityqueue'



const agent = new http.Agent({ keepAlive: true, keepAliveMsecs: 20000 });

// Function to fetch OSM data from Overpass API using KeepAlive agent
async function fetchOSMData(bbox) {
    const query = `
    [out:json];
    (
      way["highway"="path"](${bbox});
      way["highway"="trail"](${bbox});
      way["highway"="footway"](${bbox});
      way["highway"="mountain_path"](${bbox});
      way["highway"="track"](${bbox});
      way["highway"="cycleway"](${bbox});
      way["highway"="bridleway"](${bbox});
      way["highway"="residential"](${bbox});
      way["highway"="unclassified"](${bbox});
      way["highway"="living_street"](${bbox});
      way["highway"="road"](${bbox});
      way["highway"="pedestrian"](${bbox});
    );
    out geom;
    `;

    const options = {
        hostname: 'overpass-api.de',
        port: 80,
        path: '/api/interpreter',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        agent: agent,
        timeout: 20000
    };

    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    console.log('Received OSM Data:', JSON.stringify(jsonData, null, 2));

                    if (!jsonData.elements || jsonData.elements.length === 0) {
                        console.error('OSM data has no elements. Please check the query or bbox.');
                        resolve(null);
                        return;
                    }
                    resolve(jsonData.elements);  // Resolve with elements directly
                } catch (error) {
                    console.error('Error parsing OSM data:', error);
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.error('Error fetching OSM data:', error);
            reject(error);
        });

        req.write(query);
        req.end();
    });
}

// Function to calculate the distance between two geographical points
function haversineDistance(coord1, coord2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = coord1[0] * Math.PI / 180; // latitude of coord1
    const φ2 = coord2[0] * Math.PI / 180; // latitude of coord2
    const Δφ = (coord2[0] - coord1[0]) * Math.PI / 180;
    const Δλ = (coord2[1] - coord1[1]) * Math.PI / 180; // longitude difference

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Function to build a graph from the OSM data
function buildGraphFromOSMData(osmData) {
    if (!osmData) {
        console.error('OSM data is missing elements.');
        return null;
    }

    const graph = {};

    osmData.forEach(element => {
        // Only process items with LineString geometry (paths)
        
        // Extract coordinates from each path in the OSM data
        const coordinates = [];
        element.geometry.forEach(coord => {
            coordinates.push([coord.lat, coord.lon]);
        });

        // Loop through each coordinate pair and create graph edges
        for (let i = 0; i < coordinates.length - 1; i++) {
            const start = coordinates[i];
            const end = coordinates[i + 1];

            // Serialize coordinates as strings to use as unique keys in the graph
            const startKey = JSON.stringify(start);
            const endKey = JSON.stringify(end);

            // Avoid recalculating distance if nodes already exist in graph
            const distance = haversineDistance(start, end);

            // Initialize graph entries only if they don't already exist
            if (!graph[startKey]) graph[startKey] = [];
            if (!graph[endKey]) graph[endKey] = [];

            // Add edges in both directions (undirected graph)
            graph[startKey].push({ node: end, weight: distance });
            graph[endKey].push({ node: start, weight: distance });
        }
    });
    console.log(graph)
    return graph;
}
  
function dijkstra(graph, start, end) {
    // Helper function to convert coordinates to the string format used in the graph
    function toCoordString(coord) {
      return `[${coord[0]},${coord[1]}]`;
    }
  
    // Convert start and end coordinates to the appropriate string format
    const startNode = toCoordString(start);
    const endNode = toCoordString(end);
  
    // Min-heap priority queue for the nodes to be visited
    const pq = new fastpriorityqueue((a, b) => a[1] < b[1]);
    
    // Initialize distances and previous node tracker
    const distances = {};
    const previous = {};
    
    // Set initial distances to infinity and previous nodes to null
    Object.keys(graph).forEach(node => {
      distances[node] = Infinity;
      previous[node] = null;
    });
    
    distances[startNode] = 0;
    pq.add([startNode, 0]);
  
    // Process the priority queue
    while (!pq.isEmpty()) {
      const [current, currentDist] = pq.poll();
      
      // Log current node processing
      console.log(`Processing node: ${current} with distance: ${currentDist}`);
  
      // If we've reached the destination, reconstruct the path
      if (current === endNode) {
        let path = [];
        let temp = endNode;
        while (temp !== null) {
          path.unshift(temp); // Add current node to the beginning of the path
          temp = previous[temp];
        }
        return { distance: distances[endNode], path };
      }
  
      // Check if the current node exists in the graph
      if (!graph[current]) {
        console.log(`No neighbors found for node: ${current}`);
        continue; // If the node has no neighbors, skip it
      }
  
      // Explore neighbors
      graph[current].forEach(neighbor => {
        const { node, weight } = neighbor;
        const neighborStr = toCoordString(node); // Convert neighbor to string
        const newDist = currentDist + weight;
  
        if (newDist < distances[neighborStr]) {
          distances[neighborStr] = newDist;
          previous[neighborStr] = current;
          pq.add([neighborStr, newDist]);
        }
      });
    }
  
    return { distance: Infinity, path: [] };  // Return empty path if no path found
  }
// Function to get nodes with index in JSON format
function getNodesWithIndex(nodes) {
    return nodes.map((node, index) => ({
        index: index + 1,
        coordinates: JSON.parse(node)
    }));
}
// Function to find the nearest point on a path using the graph
// Function to find the nearest point on paths using line segments
function findNearestPointOnPaths(graph, point) {
    let nearestPoint = null;
    let minDistance = Infinity;

    Object.keys(graph).forEach(nodeKey => {
        const nodeCoordinates = JSON.parse(nodeKey);

        graph[nodeKey].forEach(neighbor => {
            const line = turf.lineString([nodeCoordinates, neighbor.node]);
            const snapped = turf.nearestPointOnLine(line, turf.point(point));

            const distance = haversineDistance(point, [snapped.geometry.coordinates[0], snapped.geometry.coordinates[1]]);
            
            if (distance < minDistance) {
                minDistance = distance;
                nearestPoint = snapped.geometry.coordinates;
            }
        });
    });

    return nearestPoint;
}


// Function to calculate the bounding box based on start and end coordinates with a margin
function getBoundingBoxWithMargin(startCoord, endCoord, margin = 0.075) {
    const latitudes = [startCoord[0], endCoord[0]];
    const longitudes = [startCoord[1], endCoord[1]];

    // Find the min and max latitudes and longitudes
    const minLat = Math.min(...latitudes) - margin;
    const maxLat = Math.max(...latitudes) + margin;
    const minLon = Math.min(...longitudes) - margin;
    const maxLon = Math.max(...longitudes) + margin;

    // Return the bounding box as a string in the format: "minLat,minLon,maxLat,maxLon"
    return `${minLat},${minLon},${maxLat},${maxLon}`;
}

// Update the main function to use the new bounding box
async function findNearestRoute(startCoord, endCoord) {
    // Get bounding box with margin
    const bbox = getBoundingBoxWithMargin(startCoord, endCoord);
    console.log('Bounding Box:', bbox);

    const osmData = await fetchOSMData(bbox);
    if (!osmData) {
        console.log('No OSM data found in this area');
        return null;
    }

    const graph = buildGraphFromOSMData(osmData);
    if (!graph || Object.keys(graph).length === 0) {
        console.log('Graph is empty, no paths found!');
        return null;
    }

    // Adjust start and end coordinates to the nearest point on the graph
    const nearestStart = findNearestPointOnPaths(graph, startCoord);
    const nearestEnd = findNearestPointOnPaths(graph, endCoord);
    console.log(`Nearest Start Point: ${nearestStart}`);
    console.log(`Nearest End Point: ${nearestEnd}`);

    const result = dijkstra(graph, nearestStart, nearestEnd);

    if (result.distance == Infinity) {
        console.log('No route found.');
        return null;
    }

    console.log(`Shortest path found with distance: ${result.distance} meters`);
    return getNodesWithIndex(result.path);
}

// Example usage
// const startCoord = [24.9520860, 121.5343395];  // Example start coordinates
// const endCoord = [24.9521506, 121.5342808];    // Example end coordinates

// findNearestRoute(startCoord, endCoord).then(result => {
//     if (result) {
//         console.log('Nodes with Index (JSON):', JSON.stringify(result, null, 2));
//     } else {
//         console.log('No route found.');
//     }
// });

// findNearestRoute([1,1], [1,1]).then(result => {
//     if (result) {
//         console.log('Nodes with Index (JSON):', JSON.stringify(result, null, 2));
//         result.forEach(node=>{
//             nodecoord = node.coordinates // [lat,lon]
//         })
//     } else {
//         console.log('No route found.');
//     }
// });


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

const Homepage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [route, setRoute] = useState(null);
  const navigate = useNavigate();

  // Inline styles
  const homepageStyle = {
    backgroundColor: '#f0f0f0',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  };

  const headingStyle = {
    color: '#333',
    fontSize: '2rem',
    marginBottom: '20px',
  };

  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  };

  const spinnerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100px',
  };

  const spinnerCircleStyle = {
    border: '8px solid #f3f3f3',
    borderTop: '8px solid #4CAF50',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 2s linear infinite',
  };

  // Loading spinner animation
  const keyframesStyle = {
    '@keyframes spin': {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
  };

  const locationUpdate = async () => {
    setIsLoading(true); // Show loading spinner
    const startLocation = document.getElementById("start-location").value;
    const endLocation = document.getElementById("end-location").value;
    
    try {
      const startCoord = startLocation.split(",").map(Number);
      const endCoord = endLocation.split(",").map(Number);
      
      const result = await findNearestRoute(startCoord, endCoord);
      if (result) {
        setRoute(result);
        navigate("/ARpage", { state: { route: result } }); // Navigate to SecondPage with route data
      } else {
        console.log("No route found.");
      }
    } catch (error) {
      console.error("Error finding route:", error);
    } finally {
      setIsLoading(false); // Hide loading spinner
    }
  };

  return (
    <div className="container" style={homepageStyle}>
      <motion.section className="welcome" initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
        <h2 style={headingStyle}>Welcome to Hiking Buddy!</h2>
      </motion.section>

      <div className="right-side">
        <div id="map"></div>
        <div className="map-controls">
          <motion.button className="map-control-button animate__animated animate__fadeIn" style={buttonStyle} onClick={locationUpdate}>
            <span>Set Route</span>
          </motion.button>
        </div>

        <div className="overlay-bar animate__animated animate__fadeIn">
          <div>
            <input type="text" id="start-location" placeholder="Start Location (lat,lon)" />
            <input type="text" id="end-location" placeholder="End Location (lat,lon)" />
          </div>
          <button className="ar-button" onClick={locationUpdate} style={buttonStyle}>
            Set Route
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isLoading && (
          <motion.div className="loading-spinner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="spinner" style={spinnerStyle}>
              <div className="spinner-circle" style={spinnerCircleStyle}></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Homepage;