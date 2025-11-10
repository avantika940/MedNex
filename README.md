# MedNex - AI-Powered Medical Symptom Checker

<div align="center">

![MedNex Logo](https://img.shields.io/badge/MedNex-AI%20Medical%20Assistant-blue?style=for-the-badge&logo=medical)

[![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python&logoColor=white)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb&logoColor=white)](https://mongodb.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**🩺 Educational AI-powered medical symptom checker with conversational AI and knowledge graph visualization**

[🚀 Quick Start](#-quick-start) • [📖 Features](#-features) • [🏗️ Architecture](#️-architecture) • [🤝 Contributing](#-contributing)

</div>

---

## ⚠️ Important Medical Disclaimer

**MedNex is an educational tool only and should never be used for medical diagnosis or as a substitute for professional medical advice. Always consult qualified healthcare professionals for proper medical evaluation, diagnosis, and treatment.**

---

## 🎯 Features

### 🤖 AI-Powered Analysis
- **Conversational AI**: Natural language symptom collection using Groq LLaMA 3.2
- **Medical Entity Extraction**: BioBERT-powered NER for accurate symptom identification from text
- **Disease Prediction**: Advanced matching algorithms with confidence scoring (256+ diseases)
- **Intelligent Explanations**: Context-aware medical term explanations

### 📊 Visualization & UI
- **Interactive Knowledge Graph**: D3.js visualization of symptom-disease-treatment relationships
- **Modern UI**: Responsive design with TailwindCSS and Next.js 14+
- **Real-time Updates**: Live symptom analysis and disease predictions
- **Accessible Design**: WCAG compliant with keyboard navigation

### 🔐 User Management
- **Role-Based Access Control**: Admin and customer user roles
- **JWT Authentication**: Secure token-based authentication
- **User Profiles**: Personal health history tracking
- **Diagnosis History**: Save and review past diagnoses

### 🗄️ Database
- **MongoDB Atlas**: Cloud-native NoSQL database for scalability
- **Full CRUD Operations**: Complete user and diagnosis management
- **Indexed Collections**: Optimized queries for fast performance

---

## ✅ Status

**FULLY OPERATIONAL** ✅
- ✅ Backend API: Running on http://localhost:8000
- ✅ Frontend App: Running on http://localhost:3000
- ✅ BioBERT Model: Successfully loaded and functioning
- ✅ MongoDB Atlas: Connected and operational
- ✅ Authentication System: JWT-based auth working
- ✅ All CRUD Operations: Tested and validated

---

## 🏗️ Architecture

### Frontend Stack
- **Framework**: Next.js 14+ with App Router & TypeScript
- **Styling**: TailwindCSS with custom components
- **Visualization**: D3.js for interactive knowledge graphs
- **HTTP Client**: Axios with interceptors and error handling
- **Icons**: Lucide React
- **State Management**: React hooks

### Backend Stack
- **Framework**: FastAPI with Python 3.12+
- **AI/ML Models**: 
  - Hugging Face Transformers (BioBERT for NER)
  - Groq LLaMA 3.2 (Conversational AI)
- **Database**: MongoDB Atlas (Cloud)
- **Authentication**: JWT with bcrypt password hashing
- **Graph Processing**: NetworkX for knowledge graphs
- **Data Processing**: Pandas, NumPy, scikit-learn

### Database Schema (MongoDB)
```
Collections:
├── users              # User accounts (admin, customer)
├── diseases           # Disease information
├── symptoms           # Symptom data
└── diagnosis_history  # User diagnosis records
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **Python 3.10+** with pip
- **Groq API key** - Get free tier at [console.groq.com](https://console.groq.com)
- **MongoDB Atlas** - Free tier available at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)

### 1️⃣ Backend Setup

```bash
# Navigate to backend directory
cd mednex-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2️⃣ Configure Environment Variables

Create `.env` file in `mednex-backend/`:

```properties
# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here

# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=mednex
MONGODB_DB_NAME=mednex

# JWT Configuration
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# API Configuration
DATASET_PATH=./data/disease_symptom_dataset.csv
CORS_ORIGINS=http://localhost:3000,https://your-production-url.com
```

**Important:** If your MongoDB password contains special characters, URL-encode them:
- `!` → `%21`
- `@` → `%40`
- `#` → `%23`

### 3️⃣ Create Admin User

```bash
# Make sure you're in mednex-backend directory
python create_admin.py
```

Default credentials:
- **Email**: admin@mednex.com
- **Password**: Admin123!

### 4️⃣ Start Backend Server

```bash
# From mednex-backend directory
uvicorn main:app --reload
```

🌐 Backend available at: http://localhost:8000  
📚 API Docs: http://localhost:8000/docs  
📖 ReDoc: http://localhost:8000/redoc

### 5️⃣ Frontend Setup

```bash
# Navigate to frontend directory
cd mednex-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

🌐 Frontend available at: http://localhost:3000

---

## 📁 Project Structure

```
mednex/
├── mednex-backend/                 # FastAPI Backend
│   ├── main.py                    # Application entry point
│   ├── routers/                   # API route handlers
│   │   ├── auth.py               # Authentication endpoints
│   │   ├── admin.py              # Admin management
│   │   ├── customer.py           # Customer endpoints
│   │   ├── symptoms.py           # Symptom extraction
│   │   ├── prediction.py         # Disease prediction
│   │   ├── graph.py              # Knowledge graph generation
│   │   ├── explanation.py        # Medical explanations
│   │   └── chat.py               # Conversational AI
│   ├── models/                    # AI/ML model integrations
│   │   ├── biobert_ner.py        # BioBERT entity extraction
│   │   ├── llama_reasoning.py    # Groq LLaMA integration
│   │   └── user.py               # User data models
│   ├── services/                  # Business logic
│   │   ├── disease_matcher.py    # Disease matching algorithms
│   │   └── graph_builder.py      # NetworkX graph construction
│   ├── database/                  # Database layer
│   │   └── mongodb_client.py     # MongoDB Atlas client
│   ├── utils/                     # Utilities
│   │   └── auth.py               # JWT & password utilities
│   ├── data/                      # Datasets
│   │   └── disease_symptom_dataset.csv
│   ├── requirements.txt           # Python dependencies
│   ├── create_admin.py           # Admin user creation script
│   └── .env                       # Environment variables
│
├── mednex-frontend/               # Next.js Frontend
│   ├── app/                       # Next.js App Router
│   │   ├── page.tsx              # Homepage
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles
│   │   ├── login/                # Login page
│   │   ├── diagnosis/            # Diagnosis interface
│   │   ├── history/              # Diagnosis history
│   │   ├── admin/                # Admin dashboard
│   │   └── settings/             # User settings
│   ├── components/                # React components
│   │   ├── ChatInterface.tsx     # Conversational UI
│   │   ├── KnowledgeGraph.tsx    # D3.js visualization
│   │   ├── ResultsDisplay.tsx    # Results display
│   │   ├── ExplanationPanel.tsx  # Explanations
│   │   └── Navigation.tsx        # Navigation component
│   ├── lib/                       # Utilities
│   │   ├── api.ts                # API client
│   │   ├── auth.ts               # Auth utilities
│   │   ├── admin-api.ts          # Admin API calls
│   │   ├── customer-api.ts       # Customer API calls
│   │   └── types.ts              # TypeScript types
│   ├── package.json              # Node.js dependencies
│   └── next.config.ts            # Next.js configuration
│
├── scripts/                       # Utility scripts
│   ├── setup.bat                 # Windows setup script
│   └── setup.sh                  # Unix setup script
│
├── LICENSE                        # MIT License
└── README.md                      # This file
```

---

## 🔧 API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/login` - User login (returns JWT token)
- `POST /api/auth/register` - Register new user

### Admin Management (`/api/admin`)
- `GET /api/admin/profile` - Get admin profile
- `PUT /api/admin/profile` - Update admin profile
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/{user_id}` - Update user
- `DELETE /api/admin/users/{user_id}` - Delete user

### Customer (`/api/customer`)
- `GET /api/customer/profile` - Get customer profile
- `PUT /api/customer/profile` - Update customer profile
- `GET /api/customer/diagnosis-history` - Get diagnosis history
- `POST /api/customer/diagnosis-history` - Save diagnosis

### Symptom Analysis
- `POST /api/extract-symptoms` - Extract symptoms from text using BioBERT
- `POST /api/predict` - Predict diseases from symptoms
- `POST /api/generate-graph` - Generate knowledge graph
- `POST /api/explain` - Get medical term explanations
- `POST /api/chat` - Conversational AI interface

### Utility
- `GET /` - API information
- `GET /health` - Health check endpoint

---

## 🧪 Testing

### Backend Testing

```bash
# From mednex-backend directory

# Test MongoDB connection
python test_mongodb_connection.py

# Create test users
python create_test_users.py

# Run backend tests
python test_backend.py
```

### Frontend Testing

```bash
# From mednex-frontend directory
npm run build
npm run test
```

### Integration Testing

```bash
# Test full stack integration
python scripts/test_integration.py
```

---

## 📊 Default Credentials

### Admin Account
- **Email**: admin@mednex.com
- **Password**: Admin123!
- **Access**: http://localhost:3000/admin/login

### Customer Account
- **Email**: customer@mednex.com
- **Password**: Customer123!
- **Access**: http://localhost:3000/login

⚠️ **Change these passwords in production!**

---

## 🚢 Deployment

### Frontend (Vercel)

```bash
# Deploy to Vercel
cd mednex-frontend
vercel deploy --prod
```

Update `CORS_ORIGINS` in backend `.env` with your Vercel URL.

### Backend (Render/Railway)

1. Connect your GitHub repository
2. Set environment variables in platform dashboard
3. Deploy using `requirements.txt`
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## 🛠️ Technology Stack

### Frontend Technologies
- Next.js 14+
- TypeScript
- TailwindCSS
- D3.js
- Axios
- Lucide React Icons

### Backend Technologies
- FastAPI
- Python 3.12+
- PyTorch
- Transformers (Hugging Face)
- Groq API (LLaMA 3.2)
- MongoDB Atlas
- PyMongo
- NetworkX
- Pandas & NumPy
- JWT Authentication
- Bcrypt

### Development Tools
- ESLint & Prettier
- Python Black
- Git & GitHub
- VS Code
- Postman (API testing)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Follow PEP 8 for Python
- Use ESLint rules for TypeScript
- Write meaningful commit messages
- Add comments for complex logic
- Include tests for new features

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Hugging Face** for BioBERT and transformers library
- **Groq** for LLaMA API access
- **MongoDB Atlas** for cloud database hosting
- **FastAPI** for the excellent API framework
- **Next.js** team for the amazing React framework
- **D3.js** for powerful data visualization

---

## 📧 Contact

For questions, suggestions, or issues, please open an issue on GitHub.

---

## 🔒 Security

- Never commit `.env` files or API keys
- Change default passwords immediately
- Use strong passwords for MongoDB users
- Enable IP whitelisting in MongoDB Atlas
- Keep dependencies updated
- Use HTTPS in production
- Implement rate limiting for production APIs

---

## 🗺️ Roadmap

- [ ] Multi-language support
- [ ] Voice input for symptoms
- [ ] Mobile app (React Native)
- [ ] Integration with wearable devices
- [ ] Telemedicine booking integration
- [ ] Advanced analytics dashboard
- [ ] PDF report generation
- [ ] Email notifications

---

<div align="center">

**Made with ❤️ for educational purposes**

⭐ Star this repository if you find it helpful!

</div>
