 # SynergyAI Application User Guide on Jetson

## Introduction
This document presents the steps to launch the application, modify the source code, install the Docker image with PyTorch, and manage the MySQL database.



## Modifying the Source Code
If you want to modify the code or manually start the services inside the Docker container:  
1. Start the container:  
`sudo docker start -ai my-l4t-env-hoster`  
2. Start MySQL inside the container:  
`service mysql start`  
3. Launch Jupyter Lab:  
`jupyter lab --ip=0.0.0.0 --port=8888 --allow-root`  
4. The source code is located in the **iits/** folder, which contains:  
- Main notebook: `run.ipynb`  
- Main Python script: `synergyai.py`

## Installing the Docker Image with PyTorch
To build a Docker image compatible with Jetson and PyTorch, use the official NVIDIA **jetson-inference** project:  
[https://github.com/dusty-nv/jetson-inference](https://github.com/dusty-nv/jetson-inference)  

Clone and build the image:  
 
git clone --recursive https://github.com/dusty-nv/jetson-inference
cd jetson-inference/docker
./docker_build.sh
Managing the MySQL Database

To connect to the MySQL database inside the container:
mysql -u root -p
Password: root

#Useful commands:

SHOW DATABASES;

Conclusion

 

run.ipynb  y → main project files.

dusty-nv/jetson-inference → Docker image with PyTorch optimized for Jetson.

mysql -u root -p (password: root) → access the database.
