@echo off
echo Starting React app for mobile access...
echo Backend will be accessible at: http://192.168.0.104:8080/BrokerHub
echo Frontend will be accessible at: http://192.168.0.104:3000
set REACT_APP_API_URL=http://192.168.0.104:8080/BrokerHub
set HOST=0.0.0.0
npm start