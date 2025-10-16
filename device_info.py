import platform
import socket
import psutil
import torch
import GPUtil
import time
import datetime

def get_device_relevant_info(cameras_dict):
    hostname = socket.gethostname()

    ip_addresses = []
    for iface, addrs in psutil.net_if_addrs().items():
        for addr in addrs:
            if addr.family == socket.AF_INET and not addr.address.startswith("127."):
                ip_addresses.append(addr.address)

    gpus = GPUtil.getGPUs()
    gpu_info = []
    for gpu in gpus:
        gpu_info.append({
            "id": gpu.id,
            "name": gpu.name,
            "load": f"{gpu.load * 100:.1f}%",
            "memory_total": f"{gpu.memoryTotal} MB",
            "memory_used": f"{gpu.memoryUsed} MB",
            "temperature": f"{gpu.temperature} °C",
        })

    cpu_info = {
        "model": platform.processor(),
        "cores_physical": psutil.cpu_count(logical=False),
        "cores_logical": psutil.cpu_count(logical=True),
        "frequency_max_mhz": f"{psutil.cpu_freq().max:.2f} MHz" if psutil.cpu_freq() else "N/A",
    }

    memory = psutil.virtual_memory()
    ram_total_gb = round(memory.total / (1024 ** 3), 2)

    disk = psutil.disk_usage('/')
    disk_free_gb = round(disk.free / (1024 ** 3), 2)

    os_info = platform.platform()

    uptime_seconds = time.time() - psutil.boot_time()
    uptime_str = str(datetime.timedelta(seconds=int(uptime_seconds)))

    python_version = platform.python_version()
    torch_version = torch.__version__

    camera_count = len(cameras_dict)

    return {
        "hostname": hostname,
        "ip_addresses": ip_addresses,
        "gpu_info": gpu_info,
        "cpu_info": cpu_info,
        "ram_total_gb": ram_total_gb,
        "disk_free_gb": disk_free_gb,
        "os_info": os_info,
        "uptime": uptime_str,
        "python_version": python_version,
        "torch_version": torch_version,
        "camera_count": camera_count,
    }
