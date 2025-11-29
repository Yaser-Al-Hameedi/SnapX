SnapX

AI-Powered Document Management for Multi-Location Gas Station Operations
Automates document processing for receipts, bills, and invoices using OCR and AI. Eliminates manual data entry across multiple business locations.
Status: 🚧 Active Development

Features

📸 Upload documents via desktop or mobile camera
🤖 Automatic extraction of vendor, date, amount, and type using AI
🔍 Search and filter by vendor, date range, amount, or text
✏️ Edit and correct extracted information
📱 Mobile-optimized for field use

Tech Stack

Frontend: Next.js, TypeScript, Tailwind CSS
Backend: FastAPI (Python), OpenCV, Tesseract OCR
AI: OpenAI GPT-4o-mini
Database: Supabase (PostgreSQL + Storage)

How It Works

Upload → Image Preprocessing → OCR Text Extraction → AI Field Extraction → Store & Search
Performance: 70-80% OCR accuracy on phone photos, 7-10 second processing time

Roadmap

User authentication and role-based access
Batch upload for multiple documents
Location-based organization


Setup
bash# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend  
cd frontend
npm install
npm run dev

Requires: Python 3.12+, Node.js 18+, Tesseract OCR, Supabase account, OpenAI API key

Built to solve real operational challenges for a family business with multiple gas station locations.
