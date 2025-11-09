# Contributing to MedNex

Thank you for your interest in contributing to MedNex! This document provides guidelines and information for contributors.

## 🎯 Project Vision

MedNex is an **educational AI tool** designed to demonstrate the application of modern AI technologies in healthcare education. It is **not intended for medical diagnosis** and should never be used as a substitute for professional medical advice.

## 🤝 How to Contribute

### 1. Fork and Clone
```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/mednex.git
cd mednex
```

### 2. Set Up Development Environment
```bash
# Use the automated setup script
# Windows
scripts\setup.bat

# macOS/Linux
chmod +x scripts/setup.sh && ./scripts/setup.sh
```

### 3. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 4. Make Your Changes
- Follow the coding standards outlined below
- Add tests for new functionality
- Update documentation as needed
- Ensure medical disclaimers remain prominent

### 5. Test Your Changes
```bash
# Run integration tests
python scripts/test_integration.py --verbose

# Verify project structure
python scripts/verify_structure.py

# Frontend linting
cd mednex-frontend && npm run lint

# Backend testing (if tests exist)
cd mednex-backend && python -m pytest
```

### 6. Submit a Pull Request
- Provide a clear description of changes
- Reference any related issues
- Ensure all tests pass
- Follow the PR template

## 📋 Coding Standards

### Python (Backend)
- **Style**: Follow PEP 8
- **Formatting**: Use Black (`black .`)
- **Imports**: Use isort (`isort .`)
- **Type Hints**: Use type hints for all functions
- **Documentation**: Add docstrings for all functions and classes
- **Error Handling**: Include comprehensive error handling

```python
def extract_symptoms(text: str) -> Dict[str, Any]:
    """
    Extract medical symptoms from text using BioBERT.
    
    Args:
        text: Input text containing symptom descriptions
        
    Returns:
        Dictionary containing extracted symptoms and metadata
        
    Raises:
        ValueError: If text is empty or invalid
    """
```

### TypeScript (Frontend)
- **Style**: Use ESLint configuration
- **Types**: Use strict TypeScript mode
- **Components**: Use functional components with hooks
- **Props**: Define interfaces for all component props
- **Error Handling**: Implement error boundaries

```typescript
interface ChatInterfaceProps {
  onSymptomsUpdate: (symptoms: string[]) => void;
  onPredictionsUpdate: (predictions: Prediction[]) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  onSymptomsUpdate, 
  onPredictionsUpdate 
}) => {
  // Component implementation
};
```

### Documentation
- **Comments**: Add JSDoc/docstring comments for complex functions
- **README**: Update README.md for significant changes
- **API Docs**: Update API documentation for endpoint changes
- **Medical Disclaimers**: Always include medical disclaimers in user-facing features

## 🧪 Testing Guidelines

### Required Tests
- **Integration Tests**: Ensure all API endpoints work correctly
- **Frontend Tests**: Test user interactions and API integration
- **Error Handling**: Test error scenarios and edge cases
- **Medical Disclaimer**: Verify disclaimers are displayed prominently

### Test Categories
1. **Unit Tests**: Individual function testing
2. **Integration Tests**: Full workflow testing
3. **UI Tests**: User interface interaction testing
4. **API Tests**: Backend endpoint testing

## 🚫 What NOT to Contribute

### Medical Content
- **No Medical Advice**: Do not add content that could be interpreted as medical diagnosis
- **No Treatment Recommendations**: Avoid specific treatment suggestions
- **No Professional Claims**: Do not present the tool as medically authoritative

### Inappropriate Features
- **Diagnostic Claims**: Features that claim to diagnose medical conditions
- **Treatment Prescriptions**: Functionality that suggests specific treatments
- **Medical Professional Replacement**: Tools that could replace healthcare consultations

## 🏗️ Architecture Guidelines

### Backend Structure
```
mednex-backend/
├── main.py              # FastAPI application
├── routers/            # API endpoints
├── models/             # AI/ML integrations
├── services/           # Business logic
└── database/           # Data access
```

### Frontend Structure
```
mednex-frontend/
├── app/                # Next.js pages
├── components/         # React components
├── lib/               # Utilities and API client
└── public/            # Static assets
```

## 🔧 Development Workflow

### Branch Naming
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation changes
- `refactor/code-improvement` - Code refactoring

### Commit Messages
Follow conventional commits format:
```
type(scope): description

feat(chat): add conversation history persistence
fix(api): resolve BioBERT model loading issue
docs(readme): update setup instructions
refactor(graph): optimize D3.js rendering performance
```

### Pull Request Process
1. **Description**: Provide clear description of changes
2. **Testing**: Include test results and screenshots
3. **Documentation**: Update relevant documentation
4. **Medical Disclaimer**: Confirm educational nature is maintained
5. **Review**: Address reviewer feedback promptly

## 📊 Performance Guidelines

### Backend Performance
- **Response Times**: API endpoints should respond within reasonable timeframes
- **Memory Usage**: Monitor memory usage, especially for AI models
- **Caching**: Implement appropriate caching strategies
- **Error Handling**: Graceful degradation for service failures

### Frontend Performance
- **Loading States**: Implement proper loading indicators
- **Lazy Loading**: Use lazy loading for heavy components
- **Optimization**: Optimize images and assets
- **Responsive Design**: Ensure mobile compatibility

## 🛡️ Security Guidelines

### Data Handling
- **No Personal Data**: Do not store personal health information
- **API Keys**: Use environment variables for sensitive data
- **Input Validation**: Validate all user inputs
- **Error Messages**: Do not expose sensitive information in errors

### Medical Ethics
- **Educational Focus**: Maintain educational purpose
- **Professional Referral**: Always recommend professional consultation
- **Limitation Acknowledgment**: Clearly state tool limitations
- **Privacy**: Respect user privacy and data protection

## 🎯 Review Criteria

Pull requests will be evaluated on:

### Code Quality
- [ ] Follows coding standards
- [ ] Includes appropriate tests
- [ ] Has proper documentation
- [ ] Handles errors gracefully

### Medical Responsibility
- [ ] Maintains educational focus
- [ ] Includes medical disclaimers
- [ ] Does not provide medical advice
- [ ] Encourages professional consultation

### Technical Excellence
- [ ] Meets performance requirements
- [ ] Is properly documented
- [ ] Follows security best practices
- [ ] Integrates well with existing code

## 📞 Getting Help

### Questions?
- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For general questions and ideas
- **Documentation**: Check existing documentation first

### Resources
- [Main README](README.md) - Project overview and setup
- [API Documentation](http://localhost:8000/docs) - Interactive API docs

## 🙏 Recognition

Contributors will be recognized in:
- Repository contributors list
- Release notes for significant contributions
- Documentation acknowledgments

---

## ⚠️ Medical Disclaimer

**Remember**: MedNex is an educational tool only. Contributors must ensure that all changes maintain this educational focus and do not provide medical advice, diagnosis, or treatment recommendations. Always encourage users to consult qualified healthcare professionals for medical concerns.
