 # Guide de Flash du Jetson Orin avec SDK Manager

## Introduction
Ce document présente les étapes essentielles pour flasher une carte **NVIDIA Jetson Orin** en utilisant l’outil officiel **NVIDIA SDK Manager**.

## Prérequis
- PC hôte sous **Ubuntu** (18.04 / 20.04 recommandé).
- SDK Manager installé : `sudo apt install sdkmanager`
- Connexion Internet stable.
- Jetson Orin, câble **USB-C** et alimentation.

## Procédure de Flashage
**Étape 1 : Mettre la carte en mode recovery**  
Connecter la Jetson Orin au PC via USB-C, puis maintenir le bouton **RECOVERY** et appuyer sur **RESET** pour démarrer en mode recovery.

**Étape 2 : Lancer SDK Manager**  
Commande : `sdkmanager`  
Se connecter avec un compte NVIDIA.

**Étape 3 : Sélection de la cible**  
Choisir **Jetson Orin**, puis sélectionner la version de **JetPack** souhaitée (ex. *JetPack 6.0*).

**Étape 4 : Choix des composants**  
Dans l’assistant (Étape 2), cocher :
- Jetson Linux
- CUDA Toolkit
- cuDNN
- Autres packages nécessaires (TensorRT, OpenCV, etc.)

**Étape 5 : Flash du système**  
SDK Manager procède automatiquement au téléchargement, au partitionnement et à l’installation de **Jetson Linux** sur la carte.

**Étape 6 : Installation des librairies supplémentaires**  
Une fois le Jetson redémarré et configuré (Wi-Fi / SSH), SDK Manager installe **CUDA, cuDNN et les dépendances** via connexion réseau.

## Conclusion
Le Jetson Orin est désormais flashé avec JetPack et prêt pour le développement (**CUDA, cuDNN, TensorRT**).

### Vérifier l’installation
- `nvcc --version`
- `dpkg -l | grep cudnn`
- `nvidia-smi`
