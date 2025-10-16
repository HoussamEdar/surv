import json
import cv2
import socket
import time
from datetime import datetime
from urllib.parse import urlparse

CONFIG_PATH = 'camera_config.json'

def extract_ip_from_rtsp(rtsp_url):
    try:
        parsed = urlparse(rtsp_url)
        return parsed.hostname or 'Unknown'
    except:
        return 'Unknown'

def ping_host(ip, timeout=1):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(timeout)
        start = time.time()
        s.connect((ip, 554))  # RTSP usually uses port 554
        latency = (time.time() - start) * 1000  # ms
        s.close()
        return round(latency, 2)
    except:
        return None

def load_camera_config():
    try:
        with open(CONFIG_PATH, 'r') as file:
            return json.load(file)
    except Exception as e:
        print("Error loading camera config:", e)
        return {}

def get_all_camera_health():
    camera_configs = load_camera_config()
    health_data = []

    for camera_name, cam in camera_configs.items():
        url = cam.get('url', '')
        status = 'offline'
        last_seen = 'Never'
        latency = None
        fps = None
        ip = extract_ip_from_rtsp(url)

        if not url or not url.startswith('rtsp'):
            status = 'misconfigured'
        else:
            cap = cv2.VideoCapture(url)
            start_time = time.time()
            if cap.isOpened():
                status = 'online'
                last_seen = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

                # Try reading a frame to estimate FPS
                frames_read = 0
                start = time.time()
                while frames_read < 5 and time.time() - start < 2:
                    ret, _ = cap.read()
                    if ret:
                        frames_read += 1
                duration = time.time() - start
                if frames_read > 0 and duration > 0:
                    fps = round(frames_read / duration, 2)

                cap.release()

                # Measure latency
                latency = ping_host(ip)

        health_data.append({
            'name': camera_name,
            'status': status,
            'last_seen': last_seen,
            'url': url,
            'ip': ip,
            'latency_ms': latency,
            'stream_fps': fps
        })

    return health_data
