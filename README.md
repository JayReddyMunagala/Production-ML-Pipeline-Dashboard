# 🧠 Production ML Pipeline Dashboard

An interactive web dashboard for managing and monitoring machine learning pipelines in production. Built with React, TypeScript, and Tailwind CSS, this tool helps both technical and non-technical users track model performance, manage data, and interact with ML systems in a more user-friendly way.

---

## 🚀 Overview

This dashboard brings together all the essential features needed to keep ML systems running smoothly:

- View and manage ML pipelines
- Upload and sync datasets
- Monitor key performance metrics
- Track logs, alerts, and system events
- Use a built-in assistant to ask questions about model behavior, pipeline status, and general ML topics

The goal was to make machine learning systems more transparent, manageable, and easy to work with — even after deployment.

---

## 🔑 Key Features

- **Pipeline Overview** – Browse existing pipelines, check status, and re-run when needed
- **Model Metrics** – Visualize accuracy, precision, recall, F1 score, and more
- **Data Uploads** – Add new datasets for training or inference directly from the browser
- **Log Viewer** – Access logs and alerts for models and systems
- **AI Assistant** – Ask questions in natural language about metrics, pipeline activity, or ML concepts
- **Frontend-ready for New Pipeline Creation** – The UI already supports defining a new pipeline (model type, data, target, etc.). Once connected to a backend, users can create and trigger new pipelines without writing code.

---

## ⚙️ Tech Stack

- **React** + **TypeScript** for frontend logic
- **Tailwind CSS** for UI design
- **Vite** for fast development builds
- **React Context** for global state
- **OpenAI API** for assistant responses

---

## 🧑‍💻 How It Works

- The dashboard fetches ML pipeline data from APIs (or mock data, for now)
- It shows real-time model performance and system alerts
- Users can upload data, trigger pipeline re-runs, or ask questions through the assistant
- New pipeline creation is supported on the frontend — a backend integration will activate this functionality fully

---

## 📈 Who It’s For

- MLOps teams who want a better way to track and manage production pipelines
- Data scientists who need visibility into model performance
- Product managers or analysts who want insights from machine learning systems — without touching code.
