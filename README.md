# Immagic - Intelligent Image Management

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)

> ⚠️ **DISCLAIMER: EXPERIMENTAL / UNDER DEVELOPMENT**
>
> This project is currently in a **very early stage of development**. It is intended for educational purposes, prototyping, or local experimentation only. **It is NOT ready for production use.** Features may be incomplete, unstable, or subject to breaking changes. Use at your own risk.

**Immagic** is a self-hosted web application for intelligent image management. Inspired by Immich & Nextcloud, it features powerful OCR text extraction, lightning-fast full-text search, and a masonry grid interface.

---

## 🚀 Key Features

### 🧠 Intelligent Analysis
- **Real-time OCR**: Automatically extracts text from images using Tesseract, making screenshots and documents searchable.
- **Reference-Based Library**: Scans your existing folder structures without moving or duplicating files.
- **Sequential Processing Pipeline**: Efficiently crawls directories first, then processes OCR in background batches to ensure UI responsiveness.

### 🔍 Powerful Search
- **Full-Text Search**: Find images instantly by searching for text *inside* the image or by filename.
- **Instant Results**: Optimized database queries deliver search results in milliseconds.

### 🎨 Modern UI/UX
- **Masonry Grid**: Responsive, gap-free image layout that adapts to any screen size.
- **Lightbox Viewer**: Immersive full-screen viewer with zoom capabilities and metadata inspection (OCR text, file path).
- **System Console**: A dedicated "Job Queue" dashboard with real-time logs, status indicators, and split-view console for monitoring background tasks.

### 🛡️ Enterprise-Grade
- **Secure Authentication**: JWT-based stateless authentication with secure password hashing (Argon2).
- **Scalable Architecture**: Built on FastAPI and Tortoise ORM (Async), capable of handling massive libraries.
- **Background Workers**: Heavy lifting is offloaded to Celery workers backed by Redis.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.11+, FastAPI, Tortoise ORM (Async), Celery, Redis, PostgreSQL (Production) / SQLite (Dev).
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Shadcn/ui, Lucide Icons.
- **DevOps**: Docker, Docker Compose.

---

## ⚡ Quick Start (Docker)

The easiest way to run Immagic is with Docker Compose.

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/immagic.git
    cd immagic
    ```

2.  **Start the stack**
    ```bash
    docker-compose up --build -d
    ```

3.  **Access the application**
    -   Frontend: `http://localhost:3000`
    -   Backend API: `http://localhost:8000/docs`

4.  **Initial Setup**
    -   The system will auto-create the database schemas on first run.
    -   You may need to create an initial admin user (see below).

---

## 💻 Local Development Setup

If you prefer running locally without Docker (e.g., on Windows), follow these steps.

### Prerequisites
- Python 3.11+
- Node.js 18+
- Redis (Required for background tasks)
- Tesseract OCR (Installed on system path)

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate

pip install -r requirements.txt

# Create .env file (See backend/.env.example if available, or use defaults)
# Ensure Redis is running locally on port 6379

# Create Admin User
python create_user.py

# Start API Server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Worker Setup (Terminal 2)

```bash
cd backend
# Windows
celery -A app.worker.celery_app worker --pool=solo --loglevel=info

# Linux/Mac
celery -A app.worker.celery_app worker --loglevel=info
```

### 3. Frontend Setup (Terminal 3)

```bash
cd frontend
npm install
npm run dev
```

---

## 📖 User Guide

### Adding Images
1.  Navigate to **Settings** in the sidebar.
2.  Enter the **Absolute Path** to a folder on your server/computer containing images.
3.  Click **Add Path**. The system will begin scanning immediately.

### Monitoring Progress
1.  Go to **Job Queue**.
2.  Select the active "Scan Directory" job to see real-time logs in the console view.
3.  Once scanning is complete, go back to **Settings** and click **Start OCR Processing** to extract text from the newly found images.

### Searching
1.  Use the search bar in the top header.
2.  Type any text (e.g., "receipt", "error", or text visible in a screenshot).
3.  Press Enter to filter the gallery.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
