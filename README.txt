Chess Project - Setup Guide

Overview

A full-stack chess application with: - Local play - Play vs Computer -
Online multiplayer (WebSockets) - User authentication - Game history and
statistics

Tech Stack

Frontend

-   React
-   Vite
-   React Router
-   react-chessboard
-   Axios
-   Framer Motion

Backend

-   Python 3.14
-   Django 5.1
-   Django REST Framework
-   Django Channels
-   Daphne (ASGI)
-   SQLite (development)

Communication

-   REST API (HTTP)
-   WebSockets (Django Channels)

Clone

    git clone <repository-url>
    cd Chess

Backend Setup

    cd backend
    python -m venv venv

Activate:

Windows:

    venv\Scripts\activate

Install packages:

    pip install -r requirements.txt

If requirements.txt is unavailable:

    pip install django djangorestframework channels daphne

Create and apply migrations:

    python manage.py makemigrations
    python manage.py migrate


Run backend:

    python manage.py runserver

Frontend Setup

    cd frontend
    npm install
    npm run dev

Default URLs

Frontend: http://localhost:5173

Backend: http://127.0.0.1:8000

Common Commands

Backend:

    python manage.py makemigrations
    python manage.py migrate
    python manage.py runserver

Frontend:

    npm install
    npm run dev
    npm run build

Git

    git pull
    git add .
    git commit -m "message"
    git push

Troubleshooting

Port already in use

    netstat -ano | findstr :8000
    taskkill /PID <PID> /F

Migration conflicts

    python manage.py makemigrations --merge
    python manage.py migrate

Missing packages

    pip install channels daphne

Features

-   User authentication
-   Player profiles
-   Local chess
-   Computer opponent
-   Online multiplayer
-   WebSocket communication
-   Chess timers
-   Move validation
-   Game history
-   Player statistics
