# Hiking Buddy

**Hiking Buddy** is an innovative web-based application designed to assist hikers with navigation in natural environments using augmented reality (AR). It enhances outdoor experiences by providing real-time, on-ground AR guidance to help users navigate unfamiliar or poorly marked trails. By visualizing a virtual path directly in the camera view, users follow a sequence of 3D AR markers and arrows that guide them safely along the shortest route between two hiking coordinates. This intuitive system combines a visual map-based view and an AR mode that updates dynamically as hikers progress, making it easier to stay on track without constantly checking maps.

---

## Problem It Solves

For hikers, especially those exploring new or dense trails, finding the right path can be challenging and sometimes unsafe. Natural terrain lacks the clear directional cues found in urban environments, increasing the risk of getting lost. Hiking Buddy addresses this by overlaying digital markers directly onto the real-world environment, enabling hikers to navigate trails confidently and minimizing the need to stop and check maps. This is particularly valuable in dense or unmarked areas, where even small directional mistakes can lead to significant detours.

---

## Key Features

1. **AR Navigation**: Real-time guidance with 3D AR markers (arrows) that update dynamically as hikers move along the trail.
2. **Shortest Route Calculation**: A self-made routing system calculates the optimal path between locations and displays it as a visual overlay.
3. **Map and AR View Modes**: Users can toggle between a map-based view for general orientation and an AR view for immersive, on-ground navigation.
4. **Node-Based Guidance**: Route markers are based on nodes, guiding users from one point to the next and keeping them on the right path.
5. **Overpass API Integration**: Utilizes comprehensive GPS data, including coordinates, elevation, and turns, to ensure accurate and up-to-date trail mapping.

---

### Installation
```
For Running Locally run the below in your terminal
 
git clone https://github.com/Super1115/hikingBuddy.git
cd hikingBuddy
npm i
npm run dev
```

---

## Challenges

- **WebXR and ARCore**: Understanding the nuances of WebXR, which combines 3D spatial concepts with 2D interface interactions, required significant effort, as did mastering ARCore.
- **Frontend-Backend Integration**: Ensuring smooth communication between the backend (where route calculations occur) and the frontend display was challenging, as page inconsistencies often interrupted functionality.
- **XR Intergrate**: Creating a seamless XR environment without disrupting other website features is a major challenge. The XR component must integrate smoothly to enhance the user experience without causing any technical conflicts.
- **Nodes Guide**: Determining direction based solely on nodes is complex. To guide users accurately, we need their real-time location to estimate which node they are closest to on the trail. On larger trails, displaying all node data at once can be difficult and may overwhelm the interface.
- **Real-Time Terrain**: Providing accurate directions also requires real-time terrain analysis, which is challenging without visual assessments. An arrow might lead to a blocked or inaccessible path, as we lack real-time knowledge of trail conditions. Additionally, the Overpass API does not specify maximum or minimum distances between nodes, making it hard to adjust directions effectively.

---

## Technologies Used

- **AR.js** for AR navigation.
- **Overpass API** for real-time trail data.
- **Visual Studio** for development and debugging.
- **GitHub** for version control and collaboration.

---

## Impact

Hiking Buddy empowers outdoor enthusiasts to explore with confidence by providing an interactive, AR-guided experience that keeps them safely on course. This solution is ideal for making hiking more accessible and enjoyable, especially in complex or remote environments.
