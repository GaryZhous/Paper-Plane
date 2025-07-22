const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const escapeHtml = require('escape-html');
const app = express();
const PORT = 8080;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client/build')));
let sliderValue = "50"; 
let optimumSpeed = null;

let latestSensorData = {
    AX: null, AY: null, AZ: null,
    GX: null, GY: null, GZ: null,
    optimumSpeed: null
};

async function calculateOptimumSpeed(ax, ay, az) {
    const magnitude = Math.sqrt(ax**2 + ay**2 + az**2);
    let speed = 180 - (magnitude * 10);
    speed = Math.max(0, speed);
    speed = Math.min(180, speed);
    return Math.round(speed);
}

app.get('/api/slider-value', (req, res) => {
    console.log(sliderValue);
    res.send(escapeHtml(sliderValue));
});

app.post('/api/slider-value', (req, res) => {
    sliderValue = req.body.value.toString(); 
    console.log(sliderValue);
    res.send('Value updated');
});

app.post('/api/sensor-data', async (req, res) => {
    const { AX, AY, AZ, GX, GY, GZ } = req.body;

    if (AX && AY && AZ && GX && GY && GZ) { 
        console.log("Received sensor data from ESP32:", AX, AY, AZ, GX, GY, GZ);

        optimumSpeed = await calculateOptimumSpeed(AX, AY, AZ);
        latestSensorData = {
            AX, AY, AZ, GX, GY, GZ,
            optimumSpeed
        };
        console.log(`Sensor data received and stored. Optimum speed: ${optimumSpeed}`);
        res.send(`Sensor data received and stored. Optimum speed: ${optimumSpeed}`);
    } else {
        res.status(400).send("Incorrect data format.");
    }
});

app.get('/api/get-latest-sensor-data', (req, res) => {
    res.json(latestSensorData);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});