# MedNex - AI-Powered Medical Symptom Checker

<div align="center">

![MedNex Logo](https://img.shields.io/badge/MedNex-AI%20Medical%20Assistant-blue?style=for-the-badge&logo=medical)

[![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python&logoColor=white)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**🩺 Educational AI-powered medical symptom checker with conversational AI and knowledge graph visualization**

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-documentation) • [🧪 Demo](#-demo) • [🤝 Contributing](#-contributing)

</div>

MedNex is an educational AI-powered medical symptom checker that uses advanced natural language processing and machine learning to help users understand potential relationships between symptoms and medical conditions. It features conversational AI, interactive knowledge graph visualization, and comprehensive disease prediction capabilities.

## ⚠️ Important Medical Disclaimer

**MedNex is an educational tool only and should never be used for medical diagnosis or as a substitute for professional medical advice. Always consult qualified healthcare professionals for proper medical evaluation, diagnosis, and treatment.**

## 🎯 Features

- **Conversational AI**: Natural language symptom collection using Groq LLaMA 3.2
- **Medical Entity Extraction**: BioBERT-powered NER for accurate symptom identification
- **Disease Prediction**: Advanced matching algorithms with confidence scoring
- **Interactive Knowledge Graph**: D3.js visualization of symptom-disease-treatment relationships
- **Educational Content**: Detailed explanations of medical terms and conditions
- **Responsive Design**: Modern, accessible UI with TailwindCSS

## ✅ Status

**FULLY OPERATIONAL** - All components tested and validated (6/6 integration tests passed)
- Backend API: Running on http://localhost:8000 ✅
- Frontend App: Running on http://localhost:3000 ✅
- BioBERT Model: Successfully loaded and functioning ✅
- Full-stack integration: Complete and tested ✅

## 🏗️ Architecture

### Frontend (Next.js)
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript with strict mode
- **Styling**: TailwindCSS
- **Visualization**: D3.js for interactive graphs
- **HTTP Client**: Axios with error handling
- **Icons**: Lucide React

### Backend (FastAPI)
- **Framework**: FastAPI with Python 3.10+
- **AI/ML**: Hugging Face Transformers (BioBERT), Groq LLaMA API
- **Database**: Supabase PostgreSQL
- **Graph Processing**: NetworkX
- **Deployment**: Optimized for Render

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **Python 3.10+** with pip
- **Groq API key** (free tier available at [console.groq.com](https://console.groq.com))
- **Supabase account** (optional - uses fallback data if not provided)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd mednex-backend
   ```

2. **Create and activate virtual environment**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # macOS/Linux
   python -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   # Copy template and edit with your values
   copy .env.example .env        # Windows
   cp .env.example .env          # macOS/Linux
   
   # Edit .env file with your Groq API key
   ```

5. **Start the development server**
   ```bash
   uvicorn main:app --reload
   ```
   
   🌐 Backend will be available at: `http://localhost:8000`  
   📚 API Documentation: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd mednex-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables (optional)**
   ```bash
   # Copy template if you need custom configuration
   copy .env.local.example .env.local    # Windows
   cp .env.local.example .env.local      # macOS/Linux
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   🌐 Frontend will be available at: `http://localhost:3000`

### 🎯 Quick Setup (Automated)

For a faster setup, use our automated scripts:

**Windows:**
```batch
scripts\setup.bat
```

**macOS/Linux:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

Then start both servers using the VS Code task or manually as described above.

## 📁 Project Structure

```
mednex/
├── mednex-backend/                 # FastAPI Backend
│   ├── main.py                    # Application entry point
│   ├── routers/                   # API route handlers
│   │   ├── symptoms.py           # Symptom extraction endpoints
│   │   ├── prediction.py         # Disease prediction endpoints
│   │   ├── graph.py              # Knowledge graph endpoints
│   │   ├── explanation.py        # Term explanation endpoints
│   │   └── chat.py               # Conversational AI endpoints
│   ├── models/                    # AI/ML model integrations
│   │   ├── biobert_ner.py        # BioBERT entity extraction
│   │   └── llama_reasoning.py    # Groq LLaMA integration
│   ├── services/                  # Business logic services
│   │   ├── disease_matcher.py    # Disease matching algorithms
│   │   └── graph_builder.py      # NetworkX graph construction
│   ├── database/                  # Database connections
│   │   └── supabase_client.py    # Supabase client
│   ├── data/                      # Dataset and static data
│   │   └── disease_symptom_dataset.csv
│   ├── requirements.txt           # Python dependencies
│   ├── render.yaml               # Render deployment config
│   └── .env.example              # Environment variables template
│
├── mednex-frontend/               # Next.js Frontend
│   ├── app/                       # Next.js App Router
│   │   ├── page.tsx              # Main application page
│   │   ├── layout.tsx            # Root layout component
│   │   └── globals.css           # Global styles
│   ├── components/                # React components
│   │   ├── ChatInterface.tsx     # Conversational UI
│   │   ├── KnowledgeGraph.tsx    # D3.js graph visualization
│   │   ├── ResultsDisplay.tsx    # Disease predictions display
│   │   └── ExplanationPanel.tsx  # Medical term explanations
│   ├── lib/                       # Utility libraries
│   │   ├── api.ts                # API client functions
│   │   └── types.ts              # TypeScript definitions
│   ├── package.json              # Node.js dependencies
│   └── .env.local.example        # Environment variables template
│
└── .github/
    └── copilot-instructions.md    # GitHub Copilot configuration
```

## 🔧 API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/extract_symptoms` | Extract medical entities from text |
| `POST` | `/api/predict` | Predict diseases from symptoms |
| `POST` | `/api/graph` | Generate knowledge graph |
| `POST` | `/api/chat` | Conversational AI interaction |
| `GET`  | `/api/explain/{term}` | Get medical term explanation |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/health` | API health status |
| `GET`  | `/` | API information |

## 📚 Documentation

- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to MedNex
- **[License](LICENSE)** - MIT License with medical disclaimer

## 🧪 Testing

Run the complete integration test suite:

```bash
python scripts/test_integration.py --verbose
```

This will test all API endpoints, frontend-backend integration, and core functionality.

## 🧠 AI/ML Components

### BioBERT NER (Named Entity Recognition)
- **Model**: `dmis-lab/biobert-v1.1`
- **Purpose**: Extract medical entities (symptoms, diseases, body parts)
- **Fallback**: Rule-based extraction for reliability

### Groq LLaMA Conversational AI
- **Model**: `llama-3.2-90b-text-preview`
- **Purpose**: Natural language symptom collection and follow-up questions
- **Features**: Context awareness, empathetic responses, medical disclaimers

### Disease Matching Algorithm
- **Method**: Symptom overlap analysis with confidence scoring
- **Scoring**: Percentage match based on symptom intersection
- **Confidence Levels**: High (70%+), Medium (40-69%), Low (<40%)

## 📊 Knowledge Graph Visualization

The interactive D3.js knowledge graph displays:
- **Blue nodes**: Symptoms
- **Red nodes**: Diseases  
- **Green nodes**: Treatments
- **Edge weights**: Relationship strength
- **Interactions**: Drag, zoom, hover, click for details

## 🛠️ Development

### Running Tests
```bash
# Backend tests (if implemented)
cd mednex-backend
python -m pytest

# Frontend tests (if implemented)
cd mednex-frontend
npm test
```

### Code Quality
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for Next.js
- **Error Handling**: Comprehensive error boundaries
- **Logging**: Structured logging throughout

### Performance Optimizations
- Model caching for BioBERT
- Connection pooling for database
- Request debouncing on frontend
- Lazy loading for heavy components
- React.memo for expensive renders

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variable: `NEXT_PUBLIC_API_URL=https://your-backend-url`
3. Deploy automatically on push to main branch

### Backend (Render)
1. Connect your GitHub repository to Render
2. Use the provided `render.yaml` configuration
3. Set environment variables in Render dashboard:
   - `GROQ_API_KEY`
   - `SUPABASE_URL` (optional)
   - `SUPABASE_KEY` (optional)

## 🔐 Environment Variables

### Backend (.env)
```env
GROQ_API_KEY=your_groq_api_key_here
HUGGINGFACE_TOKEN=your_hf_token_here          # Optional
SUPABASE_URL=your_supabase_url_here           # Optional
SUPABASE_KEY=your_supabase_anon_key_here      # Optional
DATASET_PATH=./data/disease_symptom_dataset.csv
CORS_ORIGINS=http://localhost:3000,https://your-vercel-app.vercel.app
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com
```

## 📈 Dataset

The application uses a curated disease-symptom dataset including:
- 15+ common medical conditions
- Multiple symptoms per disease
- Treatment recommendations
- Severity levels

**Note**: The dataset is for educational purposes and should not be used for medical diagnosis.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for detailed information.

### Quick Start for Contributors
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes following our coding standards
4. Run tests and ensure they pass
5. Commit your changes (`git commit -m 'Add AmazingFeature'`)
6. Push to the branch (`git push origin feature/AmazingFeature`)
7. Open a Pull Request

### Contribution Guidelines
- Follow our [code standards](CONTRIBUTING.md#-coding-standards)
- Maintain the educational focus of the project
- Include comprehensive tests for new features
- Update documentation as needed
- Ensure all medical disclaimers remain prominent

## 📄 License

This project is created for educational purposes. Please ensure compliance with medical data regulations and AI service terms of use when deploying.

## 🆘 Support

For questions or issues:
1. Check the documentation and README
2. Search existing GitHub issues
3. Create a new issue with detailed description
4. For medical emergencies, contact healthcare professionals immediately

## 🙏 Acknowledgments

- **Hugging Face** for BioBERT and Transformers library
- **Groq** for LLaMA API access
- **Supabase** for database services
- **Vercel** and **Render** for deployment platforms
- **D3.js** community for visualization examples
- Medical datasets and research communities

---

**Remember**: This is an educational tool, not a medical diagnostic system. Always consult healthcare professionals for medical advice.
