import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// Sends web vitals data to the console. Web Vitals is a set of metrics that
// measure the performance of a web page. This is useful for debugging performance
// issues, but is not necessary for the app to run. See
// https://bit.ly/CRA-vitals for more information.
reportWebVitals();
