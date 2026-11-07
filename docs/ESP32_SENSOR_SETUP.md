# ESP32 Room Sensor

## Tujuan

Satu ESP32 dipasang pada setiap ruang. Setiap perangkat membaca:
- DS18B20 untuk suhu ruangan.
- BH1750 untuk intensitas cahaya.

ESP32 mengirim data melalui Wi-Fi ke FastAPI. Backend menyimpan pembacaan ke tabel `sensor_readings`.

## ID perangkat

Gunakan ID berikut agar sama dengan backend:
- `kelas-1`
- `kelas-2`
- `kelas-3`
- `kelas-4`
- `kelas-5`
- `kelas-6`

ID dapat disesuaikan kemudian pada allowlist backend dan konfigurasi firmware.

## Wiring ESP32

### DS18B20
| DS18B20 | ESP32 |
|---|---|
| VCC | 3V3 |
| GND | GND |
| DATA | GPIO 4 |

Pasang resistor pull-up 4.7 kOhm antara DATA dan 3V3.

### BH1750
| BH1750 | ESP32 |
|---|---|
| VCC | 3V3 |
| GND | GND |
| SDA | GPIO 21 |
| SCL | GPIO 22 |

## Library Arduino IDE

Install library:
- OneWire
- DallasTemperature
- BH1750

WiFi, HTTPClient, dan Wire sudah tersedia pada paket board ESP32.

## Konfigurasi backend

Tambahkan ke file `backend/.env`:

```env
SENSOR_API_KEY=ganti_dengan_secret_yang_panjang_dan_acak
```

Gunakan nilai yang sama pada variabel `DEVICE_KEY` di firmware. Jangan commit secret asli ke GitHub.

Jalankan ulang FastAPI setelah mengubah file .env.

## Konfigurasi firmware

Buka `firmware/esp32_room_sensor/esp32_room_sensor.ino`, lalu sesuaikan:
- WIFI_SSID
- WIFI_PASSWORD
- API_URL dengan alamat IP server backend dan port FastAPI
- DEVICE_KEY
- DEVICE_ID untuk ruang tempat ESP32 dipasang

Contoh endpoint:
`http://192.168.1.10:8000/api/sensors/data`

Gunakan alamat IP komputer/server yang dapat dijangkau ESP32 pada jaringan yang sama, bukan localhost.

## Endpoint API

### Kirim pembacaan sensor

`POST /api/sensors/data`

Header:
`X-Device-Key: nilai_SENSOR_API_KEY`

Body JSON:
```json
{
  "device_id": "kelas-1",
  "temperature": 28.5,
  "light_level": 350.0
}
```

### Ambil data terbaru

`GET /api/sensors/kelas-1/latest`

### Ambil riwayat

`GET /api/sensors/kelas-1/history?hours=24&limit=500`

## Catatan pengujian

Mulai dari satu ESP32 dengan ID `kelas-1`. Pastikan POST mengembalikan HTTP 200, lalu buka endpoint latest untuk memeriksa data. Setelah berhasil, duplikasi firmware untuk ruang lain dan ganti DEVICE_ID.

Data sensor ESP32 terpisah dari pembacaan sensor Modbus. Kontrol relay yang sudah ada tetap menggunakan Modbus.
