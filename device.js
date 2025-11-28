/*
const connectBtn = document.getElementById('connect-btn');
    const statusText = document.getElementById('device-status');
    const errorMessage = document.getElementById('error-message');
    const deviceInfo = document.getElementById('device-info');
    const loading = document.getElementById('loading');

    const esp32IP = "http://192.168.100.18";
    const backendURL = "http://127.0.0.1:5000/sensor-readings";
    const userId = 1;

    const hrSpan = document.getElementById('hr-value');
    const spo2Span = document.getElementById('spo2-value');
    const irSpan = document.getElementById('ir-value');
    const redSpan = document.getElementById('red-value');

    let isConnected = false;
    let pollInterval = null;

    connectBtn.addEventListener('click', async () => {
      if (isConnected) {
        isConnected = false;
        statusText.textContent = '🔴 Device disconnected';
        connectBtn.textContent = '🔗 Connect Device';
        deviceInfo.classList.add('hidden');
        clearInterval(pollInterval);
        errorMessage.textContent = '';
        return;
      }

      statusText.textContent = '🕐 Connecting to ESP32...';
      errorMessage.textContent = '';
      loading.classList.remove('hidden');
      deviceInfo.classList.add('hidden');
      connectBtn.disabled = true;
      connectBtn.textContent = 'Connecting...';

      try {
        console.log(`🔍 Attempting to connect to ESP32 at: ${esp32IP}/connect`);
        const res = await fetch(`${esp32IP}/connect`, { method: 'GET', mode: 'cors' });
        const data = await res.json();
        console.log("✅ ESP32 response:", data);

        if (res.ok && data.status === "connected") {
          isConnected = true;
          statusText.innerHTML = '✅ <span class="connected">Device Connected Successfully!</span>';
          deviceInfo.classList.remove('hidden');
          connectBtn.textContent = '🔌 Disconnect Device';

          pollInterval = setInterval(async () => {
            try {
              console.log("📡 Fetching sensor readings from ESP32...");
              const res = await fetch(`${esp32IP}/readings`);
              const data = await res.json();
              console.log("📊 Sensor data received:", data);

              hrSpan.textContent = data.heart_rate || '--';
              spo2Span.textContent = data.spo2 || '--';
              irSpan.textContent = data.ir || '--';
              redSpan.textContent = data.red || '--';

              console.log("📤 Sending to backend:", backendURL);
              const backendRes = await fetch(backendURL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  user_id: userId,
                  heart_rate: data.heart_rate,
                  spo2: data.spo2,
                  ir: data.ir,
                  red: data.red
                })
              });

              const backendData = await backendRes.json();
              console.log("✅ Backend response:", backendData);

              if (!backendRes.ok) {
                errorMessage.textContent = `Backend error: ${backendData.error || 'Unknown'}`;
              } else {
                errorMessage.textContent = '';
              }
            } catch (err) {
              console.warn("⚠️ Polling error:", err);
              errorMessage.textContent = `Error: ${err.message}`;
            }
          }, 3000);
        } else {
          throw new Error('ESP32 responded but connection not confirmed');
          }
        } catch (err) {
          console.error("❌ Connection error:", err);
          statusText.textContent = '⚠️ ESP32 unreachable';
          errorMessage.innerHTML = `
            Could not connect to ESP32. Check:<br>
            1) ESP32 is powered on<br>
            2) ESP32 IP is correct (${esp32IP})<br>
            3) Both devices are on the same Wi-Fi<br>
            4) Check Serial Monitor for ESP32 errors
          `;
          connectBtn.textContent = 'Try Again';
        } finally {
          loading.classList.add('hidden');
          connectBtn.disabled = false;
        }
      });

      if (localStorage.getItem("esp_connected") === "true") {
    connectToESP32();
}
*/
// ----------------------------------------------------
// device.js — FINAL ERROR-FREE VERSION
// ----------------------------------------------------

// If NOT on device.html → skip script
if (!document.getElementById("connect-btn")) {
    console.warn("device.js loaded on non-device page. Script skipped.");
} 
else 
{

// ----------------------------------------------------
// DOM ELEMENTS
// ----------------------------------------------------
const connectBtn = document.getElementById("connect-btn");
const statusText = document.getElementById("device-status");
const errorMessage = document.getElementById("error-message");
const deviceInfo = document.getElementById("device-info");
const loading = document.getElementById("loading");

// ----------------------------------------------------
// SETTINGS
// ----------------------------------------------------
const esp32IP = "http://192.168.100.18";
const backendURL = "https://semimaterialistic-hyperbolic-laverne.ngrok-free.dev";

let isConnected = false;
let pollInterval = null;

// ----------------------------------------------------
// HELPERS
// ----------------------------------------------------
function getUserId() {
    return localStorage.getItem("user_id");
}

function getToken() {
    return localStorage.getItem("access_token");
}

function updateDeviceInfoUI(data) {
    document.getElementById("hr-value").textContent = data.heart_rate ?? "--";
    document.getElementById("spo2-value").textContent = data.spo2 ?? "--";
    document.getElementById("ir-value").textContent = data.ir ?? "--";
    document.getElementById("red-value").textContent = data.red ?? "--";

    deviceInfo.classList.remove("hidden");
}

// ----------------------------------------------------
// SEND READING TO BACKEND
// ----------------------------------------------------
async function sendReadingToBackend(payload) {
    try {
        const headers = { "Content-Type": "application/json" };
        const token = getToken();
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(backendURL, {
            method: "POST",
            headers,
            body: JSON.stringify(payload)
        });

        const json = await res.json();

        if (!res.ok) {
            errorMessage.textContent = `Backend error: ${json.error || res.statusText}`;
        } else {
            errorMessage.textContent = "";
            console.log("Backend stored reading:", json);
        }
    } catch (err) {
        errorMessage.textContent = `Error sending data: ${err.message}`;
    }
}

// ----------------------------------------------------
// POLL ESP32 FOR READINGS
// ----------------------------------------------------
async function pollReadings() {
    try {
        const res = await fetch(`${esp32IP}/readings`, { method: "GET", mode: "cors" });
        if (!res.ok) throw new Error(`ESP32 readings failed: ${res.status}`);

        const data = await res.json();

        updateDeviceInfoUI(data);

        const payload = {
            user_id: Number(getUserId()) || 1,
            heart_rate: data.heart_rate ?? null,
            spo2: data.spo2 ?? null,
            ir: data.ir ?? null,
            red: data.red ?? null
        };

        await sendReadingToBackend(payload);
    } catch (err) {
        errorMessage.textContent = `Polling error: ${err.message}`;
    }
}

// ----------------------------------------------------
// RESTORE CONNECTION ON PAGE LOAD
// ----------------------------------------------------
window.addEventListener("load", () => {
    const savedStatus = localStorage.getItem("esp_connected");
    const savedIP = localStorage.getItem("esp32_ip");

    if (savedStatus === "true" && savedIP === esp32IP) {
        isConnected = true;

        statusText.textContent = "🟢 Connected";
        connectBtn.textContent = "Disconnect Device";
        deviceInfo.classList.remove("hidden");

        pollReadings();
        pollInterval = setInterval(pollReadings, 3000);
    }
});

// ----------------------------------------------------
// CONNECT BUTTON HANDLER
// ----------------------------------------------------
connectBtn.addEventListener("click", async () => {

    if (isConnected) {
        if (pollInterval) clearInterval(pollInterval);

        localStorage.removeItem("esp_connected");
        localStorage.removeItem("esp32_ip");

        isConnected = false;
        statusText.textContent = "🔴 Device disconnected";
        deviceInfo.classList.add("hidden");
        errorMessage.textContent = "";
        connectBtn.textContent = "Connect Device";

        return;
    }

    if (!getToken()) {
        alert("⚠️ You must log in first.");
        window.location.href = "signin.html";
        return;
    }

    if (!getUserId()) {
        alert("⚠️ Missing user ID. Please log in again.");
        window.location.href = "signin.html";
        return;
    }

    statusText.textContent = "🕐 Connecting to ESP32...";
    loading.classList.remove("hidden");
    errorMessage.textContent = "";
    connectBtn.disabled = true;
    connectBtn.textContent = "Connecting...";

    try {
        const res = await fetch(`${esp32IP}/connect`, { method: "GET", mode: "cors" });
        if (!res.ok) throw new Error(`ESP32 connect failed: ${res.status}`);

        const data = await res.json();

        if (data?.status === "connected") {
            isConnected = true;

            localStorage.setItem("esp_connected", "true");
            localStorage.setItem("esp32_ip", esp32IP);

            statusText.innerHTML = '🟢 Device Connected Successfully!';
            connectBtn.textContent = "Disconnect Device";
            deviceInfo.classList.remove("hidden");

            pollReadings();
            pollInterval = setInterval(pollReadings, 3000);

            return;
        }

        throw new Error("ESP32 did not confirm connection");

    } catch (err) {
        statusText.textContent = "⚠️ ESP32 unreachable";
        errorMessage.textContent = err.message;
        connectBtn.textContent = "Try Again";

    } finally {
        loading.classList.add("hidden");
        connectBtn.disabled = false;
    }
});

} // END OF "else" WRAPPER
