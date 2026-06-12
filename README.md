# Hospital Treatment Cost Predictor (AI-Powered Clinical Billing Analytics)

<p align="center">
  <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80" alt="Hospital Cost Predictor Dashboard Banner" width="100%" style="border-radius: 8px;" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-B736FF?style=for-the-badge&logo=vite&logoColor=FFD62F" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express" />
  <img src="https://img.shields.io/badge/Google_Gemini-8E75C2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
</p>

An interactive, production-ready full-stack web application designed to model, audit, and predict patient-specific hospital treatment costs using real-time clinical parameters. It combines standard statistical machine learning algorithms with LLM explainability to produce compliant clinical invoice forecasts, business insights, and medical auditing memos.

---

## 🚀 Key Features

* **Data Science Infrastructure Lifecycle**: Guided stage-by-stage workflow modeling standard machine learning pipelines from Exploratory Data Analysis (EDA) up to model deployment.
* **Dynamic Residual Diagnostic Graphing**: Live auto-scaling residual variance chart monitoring uniform error scatter and out-of-distribution cases to meet compliance standards.
* **Dual-Layer Analytics (ML & GenAI)**: Calculates highly accurate cost baseline predictors coupled with an integrated Google Gemini-powered explanatory layer for medical invoice audits and corporate insights.
* **Server-Side Security**: All sensitive model evaluation and LLM API parameters operate securely server-side proxying transactions safely.

---

## 🛠️ Technological Architecture

* **Frontend Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/) (Client SPA Single-view interactive dashboard)
* **Design & Animations**: [Tailwind CSS v4](https://tailwindcss.com/) for fluid, responsive typography, coupled with [Lucide React](https://lucide.dev/) icons and motion enhancements
* **Backend Server**: [Express](http://expressjs.com/) configured with unified static asset resolution and server-side API proxy routes
* **Platform Compilation**: Native bundler pipeline employing `esbuild` for ultra-fast Node production distributions
* **AI & Interpretability**: [@google/genai](https://www.npmjs.com/package/@google/genai) SDK integrating Gemini model explanations with dynamic timeout boundaries

---

## 📂 Project Directory Layout

```text
├── server.ts                 # Full-stack backend launcher (Express + Vite Development Middleware)
├── server/
│   └── ml.ts                 # Statistical ML cost prediction and modeling algorithms
├── src/
│   ├── main.tsx              # React bootstrap entry point
│   ├── App.tsx               # Primary reactive dashboard orchestration 
│   ├── components/           # Modularized multi-phase workspace interfaces
│   │   ├── StageEDA.tsx      # Exploratory Data Analysis metrics and visual components
│   │   ├── StageModeling.tsx # Parameter controls and pipeline training
│   │   ├── StageValidation.tsx # Dynamic Diagnostic scatterplots & residual audits
│   │   └── StageDeployment.tsx # Live predictive invoices & Gemini explanation generators
│   └── index.css             # Tailwind imports and customized fonts/themes
└── package.json              # Managed scripts and modern workspace dependencies
```

---

## ⚡ Getting Started Locally

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18.0.0 or higher) and `npm` installed.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/hospital-treatment-cost-predictor.git
cd hospital-treatment-cost-predictor
```

### 2. Install Workspace Dependencies
```bash
npm install
```

### 3. Configure the Environment
Create a `.env` file in the root directory relative to the repository path:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Boot Up the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) using your web browser.

### 5. Build and Run in Production
Compress, compile and bundle TypeScript assets for secure, lightweight deployments:
```bash
npm run build
npm start
```

---

## 📜 License

This project is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute for educational or commercial purposes.
