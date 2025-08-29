@echo off
echo Starting React app for local development...
echo Backend will be accessible at: http://localhost:8080/BrokerHub
echo Frontend will be accessible at: http://localhost:3000
set REACT_APP_API_URL=http://localhost:8080/BrokerHub
npm start