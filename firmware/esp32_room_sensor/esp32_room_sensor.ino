#include <WiFi.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Wire.h>
#include <BH1750.h>

// Isi sesuai jaringan dan server backend Anda.
const char* WIFI_SSID = "NAMA_WIFI";
const char* WIFI_PASSWORD = "PASSWORD_WIFI";
const char* API_URL = "http://192.168.1.10:8000/api/sensors/data";
const char* DEVICE_KEY = "GANTI_DENGAN_SENSOR_API_KEY";
const char* DEVICE_ID = "kelas-1"; // Ubah untuk setiap ESP32: kelas-1 s.d. kelas-6

#define ONE_WIRE_BUS 4

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature temperatureSensor(&oneWire);
BH1750 lightSensor;

unsigned long lastSend = 0;
const unsigned long SEND_INTERVAL = 10000;

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Menghubungkan Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("Wi-Fi terhubung. IP ESP32: ");
  Serial.println(WiFi.localIP());
}

void sendSensorData(float temperature, float lux) {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Key", DEVICE_KEY);

  String payload = "{";
  payload += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  payload += "\"temperature\":" + String(temperature, 2) + ",";
  payload += "\"light_level\":" + String(lux, 2);
  payload += "}";

  int httpCode = http.POST(payload);
  Serial.print("HTTP status: ");
  Serial.println(httpCode);

  if (httpCode > 0) {
    Serial.println(http.getString());
  } else {
    Serial.println(http.errorToString(httpCode));
  }

  http.end();
}

void setup() {
  Serial.begin(115200);

  temperatureSensor.begin();
  Wire.begin(21, 22);

  if (!lightSensor.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
    Serial.println("BH1750 tidak terdeteksi. Periksa kabel SDA/SCL.");
  }

  connectWiFi();
}

void loop() {
  if (millis() - lastSend >= SEND_INTERVAL) {
    lastSend = millis();

    temperatureSensor.requestTemperatures();
    float temperature = temperatureSensor.getTempCByIndex(0);
    float lux = lightSensor.readLightLevel();

    if (temperature == DEVICE_DISCONNECTED_C || lux < 0) {
      Serial.println("Pembacaan sensor gagal. Data tidak dikirim.");
      return;
    }

    Serial.printf("Suhu: %.2f C | Cahaya: %.2f lux\n", temperature, lux);
    sendSensorData(temperature, lux);
  }
}
