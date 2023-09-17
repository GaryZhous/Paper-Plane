import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // State for slider
  const [sliderValue, setSliderValue] = useState(50);

  // State for sensor data
  const [sensorData, setSensorData] = useState({
    AX: null, AY: null, AZ: null,
    GX: null, GY: null, GZ: null
  });

  useEffect(() => {
    const fetchSensorData = () => {
      // Fetch sensor data
      fetch("/api/get-latest-sensor-data")
        .then(res => res.json())
        .then(data => {
          setSensorData(data);
        })
        .catch(error => {
          console.error("Error fetching sensor data:", error);
        });
    };

    fetchSensorData();

    const interval = setInterval(fetchSensorData, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSliderChange = (e) => {
    const value = e.target.value;
    setSliderValue(value);

    fetch('/api/slider-value', {
      method: 'POST',
      body: JSON.stringify({ value }),
      headers: { 'Content-Type': 'application/json' }
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        {/* Slider */}
        <div className="slider-container">
          <div className="slider-value-display">{sliderValue}</div>
          <input 
            type="range" 
            min="0" 
            max="180" 
            value={sliderValue}
            onChange={handleSliderChange}
          />
        </div>

        {/* Sensor Data Table */}
        <table>
          <thead>
            <tr>
              <th>AX</th>
              <th>AY</th>
              <th>AZ</th>
              <th>GX</th>
              <th>GY</th>
              <th>GZ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{sensorData.AX}</td>
              <td>{sensorData.AY}</td>
              <td>{sensorData.AZ}</td>
              <td>{sensorData.GX}</td>
              <td>{sensorData.GY}</td>
              <td>{sensorData.GZ}</td>
            </tr>
          </tbody>
        </table>
      </header>
    </div>
  );
}

export default App;