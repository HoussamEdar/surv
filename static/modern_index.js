const activeStreams = {};
let cameraCount = 0;
const roiBoxes = {}; // Store ROI per camera

// Generate or get persistent device ID
function getDeviceId() {
  const existingId = localStorage.getItem("deviceId");
  if (existingId) return existingId;
  const newId = generateUUID();
  localStorage.setItem("deviceId", newId);
  return newId;
}

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Save camera configs to localStorage and backend
function saveConfig() {
  const config = [];
  document.querySelectorAll("#camera-inputs > div").forEach((div) => {
    const label = div.querySelector("label.camera-label").textContent;
    const url = div.querySelector("input.url-input").value;
    const feature = div.querySelector("select.feature-select").value;
    const mode = div.querySelector("select.mode-select").value;
    config.push({ id: label, url, feature, mode });
    fetch("/add_camera", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ camera_id: label, url, feature, mode }),
    }).catch(() => {});
  });
  localStorage.setItem("cameraConfig", JSON.stringify(config));
}

// Add camera input HTML block with modern styling
function addCameraInput(id = null, url = "", feature = "human_tracking", mode = "full") {
  const container = document.getElementById("camera-inputs");
  if (!container) return;
  const cameraId = id || `Camera ${++cameraCount}`;
  const div = document.createElement("div");
  div.className =
    "bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-md hover:shadow-lg transition-all p-5 relative";
  div.innerHTML = `
    <div class="absolute top-3 right-3 flex space-x-2">
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        ${cameraId}
      </span>
      <button onclick="this.closest('div.relative').remove(); saveConfig();" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors" title="Remove camera">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>
    <label class="text-slate-700 dark:text-slate-300 font-medium camera-label hidden">${cameraId}</label>
    <div class="mb-4 mt-2">
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">RTSP URL</label>
      <input type="text" placeholder="rtsp://username:password@ip:port/path" value="${url}" class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 url-input" />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Detection Feature</label>
        <select class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 feature-select">
          <option value="loitering_detection" ${feature === "loitering_detection" ? "selected" : ""}>Loitering Detection</option>
          <option value="human_tracking" ${feature === "human_tracking" ? "selected" : ""}>Human Tracking</option>
          <option value="fall_detection" ${feature === "fall_detection" ? "selected" : ""}>Fall Detection</option>
          <option value="crowd_counting" ${feature === "crowd_counting" ? "selected" : ""}>Crowd Counting</option>
          <option value="face_recognition" ${feature === "face_recognition" ? "selected" : ""}>Face Recognition</option>
          <option value="behavioral_anomaly_detection" ${feature === "behavioral_anomaly_detection" ? "selected" : ""}>Behavioral Anomaly Detection</option>
          <option value="dangerous_object_detection" ${feature === "dangerous_object_detection" ? "selected" : ""}>Dangerous Object Detection</option>
          <option value="license_plate_recognition" ${feature === "license_plate_recognition" ? "selected" : ""}>License Plate Recognition</option>
          <option value="crowd_flow_analysis" ${feature === "crowd_flow_analysis" ? "selected" : ""}>Crowd Flow Analysis</option>
          <option value="suspicious_gesture_detection" ${feature === "suspicious_gesture_detection" ? "selected" : ""}>Suspicious Gesture Detection</option>
          <option value="emotion_recognition" ${feature === "emotion_recognition" ? "selected" : ""}>Emotion Recognition</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Camera Mode</label>
        <select class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 mode-select">
          <option value="full" ${mode === "full" ? "selected" : ""}>Full Camera Mode</option>
          <option value="custom" ${mode === "custom" ? "selected" : ""}>Custom Mode (ROI)</option>
        </select>
      </div>
    </div>
    <div class="flex items-center">
      <label class="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" class="sr-only peer activate-checkbox">
        <div class="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        <span class="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">Activate</span>
      </label>
    </div>
  `;
  container.appendChild(div);

  // Save config on any input/select change
  div.querySelectorAll("input, select").forEach((el) => el.addEventListener("change", saveConfig));
}

// Load saved cameras from localStorage on page load
function loadConfig() {
  const saved = localStorage.getItem("cameraConfig");
  if (saved) {
    const config = JSON.parse(saved);
    config.forEach(({ id, url, feature, mode }) => addCameraInput(id, url, feature, mode));
  }
}

// Sync UI checkboxes and streams with backend running streams on page load
async function syncActiveStreamsWithUI() {
  const res = await fetch("/running_streams");
  const activeCameras = res.ok ? await res.json() : [];
  document.querySelectorAll("#camera-inputs > div").forEach((div) => {
    const cameraId = div.querySelector("label.camera-label").textContent;
    const checkbox = div.querySelector("input.activate-checkbox");
    if (!checkbox) return;
    if (activeCameras.includes(cameraId)) {
      checkbox.checked = true;
      restoreStreamUI(cameraId, div);
    } else {
      checkbox.checked = false;
      removeVideoUI(cameraId);
    }
  });
}

// Restore video stream UI and set img src for active streams
function restoreStreamUI(cameraId, containerDiv) {
  const feature = containerDiv.querySelector("select.feature-select").value;
  if (document.getElementById(`video-wrapper-${cameraId}`)) return;

  addVideoCard(cameraId, feature);

  const videoImg = document.getElementById(`video-${cameraId}`);
  if (videoImg) {
    videoImg.src = `/video?camera=${encodeURIComponent(cameraId)}`;
  }

  setupEventSource(cameraId, feature);
  initCanvasDrawing(cameraId);
  activeStreams[cameraId] = true;
}

// Remove video card UI
function removeVideoUI(cameraId) {
  const wrapper = document.getElementById(`video-wrapper-${cameraId}`);
  if (wrapper) wrapper.remove();
  delete activeStreams[cameraId];
}

// Start all streams for checked cameras
async function startStreams() {
  const container = document.getElementById("camera-inputs");
  if (!container) return;
  const cameraDivs = Array.from(container.children);
  for (const div of cameraDivs) {
    const cameraId = div.querySelector("label.camera-label").textContent;
    const checkbox = div.querySelector("input.activate-checkbox");
    if (checkbox && checkbox.checked) {
      // eslint-disable-next-line no-await-in-loop
      await startSingleStream(cameraId);
    }
  }
  showToast("Streams started successfully!");
}

// Stop all streams
async function stopStreams() {
  const container = document.getElementById("camera-inputs");
  if (!container) return;
  const cameraDivs = Array.from(container.children);
  for (const div of cameraDivs) {
    const cameraId = div.querySelector("label.camera-label").textContent;
    // eslint-disable-next-line no-await-in-loop
    await stopSingleStream(cameraId);
    const checkbox = div.querySelector("input.activate-checkbox");
    if (checkbox) checkbox.checked = false;
  }
  showToast("All streams stopped!");
}

// Start a single stream
async function startSingleStream(cameraId) {
  const containerDiv = [...document.querySelectorAll("#camera-inputs > div")].find(
    (div) => div.querySelector("label.camera-label").textContent === cameraId
  );
  if (!containerDiv) return;

  const url = containerDiv.querySelector("input.url-input").value.trim();
  const feature = containerDiv.querySelector("select.feature-select").value;
  const mode = containerDiv.querySelector("select.mode-select").value;

  if (!url.startsWith("rtsp://")) {
    showToast(`Invalid RTSP URL for ${cameraId}`, "error");
    return;
  }

  const roi = mode === "custom" ? (roiBoxes[cameraId] || null) : null;

  const startResp = await fetch("/start_stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ camera: cameraId, url, feature, mode, roi }),
  });
  const startData = await startResp.json();
  if (startData.status !== "success") {
    showToast(`Failed to start stream for ${cameraId}: ${startData.message}`, "error");
    return;
  }

  if (!document.getElementById(`video-wrapper-${cameraId}`)) {
    addVideoCard(cameraId, feature);
    setupEventSource(cameraId, feature);
    initCanvasDrawing(cameraId);
  }

  const img = document.getElementById(`video-${cameraId}`);
  if (img) img.src = `/video?camera=${encodeURIComponent(cameraId)}`;
  activeStreams[cameraId] = url;

  showToast(`Stream started for ${cameraId}`);
}

// Stop a single stream
async function stopSingleStream(cameraId) {
  await fetch("/stop_stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ camera: cameraId }),
  });

  removeVideoUI(cameraId);

  const containerDiv = [...document.querySelectorAll("#camera-inputs > div")].find(
    (div) => div.querySelector("label.camera-label").textContent === cameraId
  );
  if (containerDiv) {
    const checkbox = containerDiv.querySelector("input.activate-checkbox");
    if (checkbox) checkbox.checked = false;
  }

  showToast(`Stream stopped for ${cameraId}`);
}

// Add video card UI with modern styling
function addVideoCard(cameraId, feature) {
  const videoContainer = document.getElementById("video-container");
  if (!videoContainer) return;
  const wrapper = document.createElement("div");
  wrapper.id = `video-wrapper-${cameraId}`;
  wrapper.className =
    "bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6 w-full mb-6 transition-all hover:shadow-xl";

  wrapper.innerHTML = `
    <div class="flex flex-col md:flex-row gap-6">
      <div class="flex-1 max-w-full md:max-w-[75%] relative">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
              <i class="fas fa-video text-white"></i>
            </div>
            <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
              ${cameraId} <span class="text-sm font-normal text-slate-500 dark:text-slate-400">- ${feature.replace(/_/g, " ")}</span>
            </h3>
          </div>
          <div class="flex items-center space-x-2">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <span class="w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
              Live
            </span>
          </div>
        </div>
        <div class="w-full h-[500px] bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden relative shadow-inner">
          <img id="video-${cameraId}" src="/placeholder.svg" class="w-full h-full object-cover" alt="Video stream for ${cameraId}">
          <canvas id="canvas-${cameraId}" class="absolute top-0 left-0 w-full h-full"></canvas>
        </div>
      </div>
      <div class="w-full md:w-[25%]">
        <div class="flex items-center space-x-2 mb-4">
          <div class="w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center shadow-sm">
            <i class="fas fa-bell text-white text-xs"></i>
          </div>
          <h4 class="font-medium text-slate-700 dark:text-slate-300">Real-Time Events</h4>
        </div>
        <ul id="events-${cameraId}" class="text-sm text-slate-600 dark:text-slate-400 space-y-1 max-h-[500px] overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-900/50"></ul>
      </div>
    </div>
  `;
  videoContainer.appendChild(wrapper);
}

// Setup SSE for real-time logs and webhook forwarding
function setupEventSource(cameraId, feature) {
  const eventSource = new EventSource(`/video_logs/${cameraId}`);
  const eventList = document.getElementById(`events-${cameraId}`);
  eventSource.onmessage = (event) => {
    const logEntry = event.data;
    if (!eventList) return;

    const li = document.createElement("li");
    li.className =
      "py-2 px-3 border-b border-slate-200 dark:border-slate-700 last:border-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors";

    // Format timestamp if present
    const timestampMatch = logEntry.match(/^\[(.*?)\]/);
    const timestamp = timestampMatch ? timestampMatch[1] : "";
    const message = logEntry.replace(/^\[(.*?)\]/, "").trim();
    li.innerHTML = `<span class="text-xs font-medium text-slate-500 dark:text-slate-400">[${timestamp}]</span> ${message}`;

    eventList.appendChild(li);
    eventList.scrollTop = eventList.scrollHeight;

    // Match coordinates at end of line: "..., 123, 456"
    const coordinatesMatch = logEntry.match(/(\d+),\s*(\d+)$/);

    const payload = {
      device_id: getDeviceId(),
      camera_name: cameraId,
      feature,
      timestamp,
      log_message: logEntry,
      coordinates: coordinatesMatch ? `${coordinatesMatch[1]},${coordinatesMatch[2]}` : "",
    };

    fetch("/log_activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  };
  eventSource.onerror = () => eventSource.close();
}

// ROI drawing on canvas overlay
function initCanvasDrawing(cameraId) {
  const canvas = document.getElementById(`canvas-${cameraId}`);
  if (!canvas) return;

  // Set canvas dimensions to match the container
  const resizeCanvas = () => {
    const container = canvas.parentElement;
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    // Redraw ROI if exists
    if (roiBoxes[cameraId]) {
      const roi = roiBoxes[cameraId];
      const ctx = canvas.getContext("2d");
      const x = roi.x * canvas.width;
      const y = roi.y * canvas.height;
      const w = roi.w * canvas.width;
      const h = roi.h * canvas.height;
      drawCurrentRect(canvas, ctx, x, y, x + w, y + h, true);
    }
  };

  // Initial resize and add listener
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const ctx = canvas.getContext("2d");
  let isDrawing = false;
  let startX, startY, currentX, currentY;

  canvas.onmousedown = (e) => {
    const containerDiv = [...document.querySelectorAll("#camera-inputs > div")].find(
      (div) => div.querySelector("label.camera-label").textContent === cameraId
    );
    if (!containerDiv) return;
    const mode = containerDiv.querySelector("select.mode-select").value;
    if (mode !== "custom") return;

    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    isDrawing = true;
  };

  canvas.onmousemove = (e) => {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    currentX = e.clientX - rect.left;
    currentY = e.clientY - rect.top;
    drawCurrentRect(canvas, ctx, startX, startY, currentX, currentY);
  };

  canvas.onmouseup = () => {
    if (!isDrawing) return;
    isDrawing = false;

    const x = Math.min(startX, currentX);
    const y = Math.min(startY, currentY);
    const w = Math.abs(currentX - startX);
    const h = Math.abs(currentY - startY);

    roiBoxes[cameraId] = {
      x: x / canvas.width,
      y: y / canvas.height,
      w: w / canvas.width,
      h: h / canvas.height,
    };

    drawCurrentRect(canvas, ctx, x, y, x + w, y + h, true);

    // Restart streams to apply new ROI on backend
    startStreams();
  };
}

function drawCurrentRect(canvas, ctx, x1, y1, x2, y2, permanent = false) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (permanent) {
    ctx.strokeStyle = "rgba(59, 130, 246, 0.8)";
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

    ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
    ctx.fillRect(x1, y1, x2 - x1, y2 - y1);

    const cornerSize = 6;
    ctx.fillStyle = "rgba(59, 130, 246, 1)";
    ctx.fillRect(x1 - cornerSize / 2, y1 - cornerSize / 2, cornerSize, cornerSize);
    ctx.fillRect(x2 - cornerSize / 2, y1 - cornerSize / 2, cornerSize, cornerSize);
    ctx.fillRect(x1 - cornerSize / 2, y2 - cornerSize / 2, cornerSize, cornerSize);
    ctx.fillRect(x2 - cornerSize / 2, y2 - cornerSize / 2, cornerSize, cornerSize);

    ctx.font = "12px Inter, sans-serif";
    ctx.fillStyle = "white";
    ctx.fillRect(x1, y1 - 20, 40, 20);
    ctx.fillStyle = "rgba(59, 130, 246, 1)";
    ctx.fillText("ROI", x1 + 10, y1 - 6);
  } else {
    ctx.strokeStyle = "rgba(59, 130, 246, 0.6)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
    ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
  }
}

// Save webhook URL (guard element)
const webhookForm = document.getElementById("webhook-form");
if (webhookForm) {
  webhookForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const webhookUrl = document.getElementById("webhook-url").value;
    fetch("/save_webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ webhook_url: webhookUrl }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          showToast("Webhook URL saved successfully!");
        } else {
          showToast("Error: " + data.message, "error");
        }
      })
      .catch(() => showToast("Error saving webhook URL.", "error"));
  });
}

// Show system info on button click
function showSystemInfo() {
  const systemInfoDiv = document.getElementById("system-info");
  if (!systemInfoDiv) return;

  fetch("/system_info")
    .then((res) => res.json())
    .then((data) => {
      const systemStatsList = document.getElementById("system-stats");
      systemStatsList.innerHTML = "";

      const infoGroups = {
        System: ["os", "browser", "screen_resolution"],
        Network: ["network_type", "ip_address"],
        Resources: ["cpu_usage", "memory_usage", "disk_usage"],
      };

      for (const [groupName, keys] of Object.entries(infoGroups)) {
        const groupDiv = document.createElement("div");
        groupDiv.className = "mb-4";

        const groupTitle = document.createElement("h5");
        groupTitle.className = "text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2";
        groupTitle.textContent = groupName;
        groupDiv.appendChild(groupTitle);

        const groupList = document.createElement("ul");
        groupList.className = "space-y-2";

        keys.forEach((key) => {
          if (data[key]) {
            const li = document.createElement("li");
            li.className = "flex items-center justify-between";

            const label = document.createElement("span");
            label.className = "text-slate-600 dark:text-slate-400";
            label.textContent = key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

            const value = document.createElement("span");
            value.className = "font-medium text-slate-800 dark:text-slate-200";
            value.textContent = data[key];

            li.appendChild(label);
            li.appendChild(value);
            groupList.appendChild(li);
          }
        });

        groupDiv.appendChild(groupList);
        systemStatsList.appendChild(groupDiv);
      }

      systemInfoDiv.classList.remove("hidden");
    })
    .catch((error) => {
      console.error(error);
      showToast("Error fetching system information", "error");
    });
}

// Toast notification
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");
  if (!toast || !toastMessage) return;

  if (type === "success") {
    toast.className =
      "fixed top-4 right-4 z-50 transform transition-transform duration-300 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center";
    toast.querySelector("i").className = "fas fa-check-circle mr-2";
  } else if (type === "error") {
    toast.className =
      "fixed top-4 right-4 z-50 transform transition-transform duration-300 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center";
    toast.querySelector("i").className = "fas fa-exclamation-circle mr-2";
  } else if (type === "info") {
    toast.className =
      "fixed top-4 right-4 z-50 transform transition-transform duration-300 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center";
    toast.querySelector("i").className = "fas fa-info-circle mr-2";
  }

  toastMessage.textContent = message;
  toast.classList.remove("translate-x-full");
  setTimeout(() => {
    toast.classList.add("translate-x-full");
  }, 3000);
}

// DOM Ready bootstrap
document.addEventListener("DOMContentLoaded", () => {
  // Sidebar toggles (guarded)
  const menuBtn = document.getElementById("menu-button");
  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      const sidebar = document.querySelector(".sidebar");
      if (sidebar) sidebar.classList.add("active");
    });
  }
  const closeBtn = document.getElementById("close-sidebar");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      const sidebar = document.querySelector(".sidebar");
      if (sidebar) sidebar.classList.remove("active");
    });
  }

  // Add camera button
  const addCameraBtn = document.getElementById("add-camera-button");
  if (addCameraBtn) addCameraBtn.addEventListener("click", () => addCameraInput());

  // Load saved
  loadConfig();
  // If nothing loaded, show one empty block to avoid a blank page
  if (!document.querySelector("#camera-inputs > div")) addCameraInput();

  // Wire Start/End buttons (guard)
  const startBtn = document.getElementById("start-stream-button");
  if (startBtn) startBtn.addEventListener("click", startStreams);
  const endBtn = document.getElementById("end-stream-button");
  if (endBtn) endBtn.addEventListener("click", stopStreams);

  // Sync running streams with UI
  syncActiveStreamsWithUI().catch(() => {});

  // GPU polling (only on device details page)
  const gpuLoad = document.getElementById("gpu-load");
  const gpuMemory = document.getElementById("gpu-memory");
  const gpuTemp = document.getElementById("gpu-temp");
  if (gpuLoad && gpuMemory && gpuTemp) {
    function updateGPUStats() {
      fetch("/gpu_info")
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error ${res.status}`);
          return res.json();
        })
        .then((data) => {
          gpuLoad.textContent = data.gpu_usage || "N/A";
          gpuMemory.textContent = data.ram_usage || "N/A";
          gpuTemp.textContent = data.temperature || "N/A";
        })
        .catch((err) => {
          console.error("❌ Error fetching GPU stats:", err);
          gpuLoad.textContent = "N/A";
          gpuMemory.textContent = "N/A";
          gpuTemp.textContent = "N/A";
        });
    }
    updateGPUStats();
    setInterval(updateGPUStats, 3000);
  }
});
