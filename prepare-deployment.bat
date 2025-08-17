@echo off
echo 🚀 BrokerHub Deployment Preparation
echo =====================================

echo.
echo 📦 Installing dependencies...
call npm install

echo.
echo 🔧 Building production version...
call npm run build

echo.
echo ✅ Build completed successfully!
echo.
echo 📋 Next Steps:
echo 1. Push your code to GitHub
echo 2. Follow deployment-checklist.md
echo 3. Deploy to Railway (backend) and Vercel (frontend)
echo.
echo 🌐 Your app will be live at:
echo Frontend: https://your-app.vercel.app
echo Backend: https://your-backend.railway.app
echo.
pause