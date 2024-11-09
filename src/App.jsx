import React from 'react';
import './App.css';
import Homepage from './pages/Homepage';
import SecondPage from "./pages/SecondPage";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path ="/" element ={<Homepage/>}/>
          <Route path ="/ARpage" element ={<SecondPage/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
