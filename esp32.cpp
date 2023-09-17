#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <ArduinoJson.h>
#include <Wire.h>

enum PINS {
  pin1 = 4,
  pin2 = 16,
  pin3 = 17,
  pin4 = 5
};

Adafruit_MPU6050 mpu;

const char* ssid = "HackTheNorth";
const char* password = "HTNX2023";
const char* serverIP = "10.33.143.168";
const int serverPort = 8080;

void initWiFi() {
  int count = 0;
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED && count++ < 10) {
    Serial.print('.');
    delay(1000);
  }
  if(count < 10)
    Serial.println("Ready!");
  else
    Serial.println("Failed to connect!");
}

void setup() {
  Serial.begin(9600);
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  delay(1000);
  initWiFi();
  pinMode(pin1, OUTPUT);
  pinMode(pin2, OUTPUT);
  pinMode(pin3, OUTPUT);
  pinMode(pin4, OUTPUT);
  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip");
    while (1) {
      delay(10);
    }
  }
}

String received() {
  HTTPClient http;
  http.begin("http://" + String(serverIP) + ":" + String(serverPort) + "/api/slider-value");
  int code = http.GET();
  if (code == HTTP_CODE_OK) {
    String resp = http.getString();
    http.end();
    return resp;
  }
  http.end();
  return "Failed";
}

void sendSensorData(float AX, float AY, float AZ, float GX, float GY, float GZ) {
    HTTPClient http;

    // Create JSON document
    DynamicJsonDocument doc(1024);

    // Populate the JSON document
    doc["AX"] = AX;
    doc["AY"] = AY;
    doc["AZ"] = AZ;
    doc["GX"] = GX;
    doc["GY"] = GY;
    doc["GZ"] = GZ;

    String jsonData;
    serializeJson(doc, jsonData);  // Convert JSON document to string

    http.begin("http://" + String(serverIP) + ":" + String(serverPort) + "/api/sensor-data");
    http.addHeader("Content-Type", "application/json");  // Set header to JSON

    int httpResponseCode = http.POST(jsonData);  // Send the request

    if(httpResponseCode > 0) {
        String response = http.getString();
        Serial.println(response);
    } else {
        Serial.print("Error sending POST request: ");
        Serial.println(httpResponseCode);
    }

    http.end();
}

void loop() {
  int value = received().toInt();
  Serial.println(value);
  analogWrite(pin1, value);
  analogWrite(pin2, value);
  analogWrite(pin3, value);
  analogWrite(pin4, value);
  
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);
  
  sendSensorData(a.acceleration.x, a.acceleration.y, a.acceleration.z, g.gyro.x, g.gyro.y, g.gyro.z);
  
  delay(2000);
}
