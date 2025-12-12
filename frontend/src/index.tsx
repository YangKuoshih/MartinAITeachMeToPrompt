import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';


// Use real App with AWS Cognito authentication
const AppComponent = App;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AppComponent />
  </React.StrictMode>
);