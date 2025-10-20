@echo off
echo ========================================
echo BrokerHub Mobile Testing Setup
echo ========================================
echo.

echo Step 1: Finding your IP address...
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    set IP=!IP:~1!
    echo Found IP: !IP!
)

echo.
echo Step 2: Your IP address is needed to test from phone
echo.
echo Please manually update package.json:
echo.
echo Find this line:
echo   "start:mobile": "echo Update YOUR_IP in this script first! && cross-env REACT_APP_API_URL=http://YOUR_IP:8080/BrokerHub HOST=0.0.0.0 react-scripts start"
echo.
echo Replace YOUR_IP with your actual IP address
echo.
echo ========================================
echo Quick Commands:
echo ========================================
echo.
echo For PC testing:
echo   npm start
echo   Access: http://localhost:3000
echo.
echo For phone testing (after updating package.json):
echo   npm run start:mobile
echo   Access from phone: http://YOUR_IP:3000
echo.
echo For production:
echo   npm run build
echo   Copy build/* to Spring Boot static folder
echo   Access: http://YOUR_IP:8080
echo.
echo ========================================
echo.
pause
