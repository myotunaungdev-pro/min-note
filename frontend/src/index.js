import React from "react";
import { BrowserRouter } from "react-router-dom";
import ReactDom from "react-dom/client";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Provider } from "react-redux";
import store from "./store/store";
import App from "./App";
import { SubscriptionProvider } from './context/SubscriptionContext';
import './i18n';
import './theme.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// The main entry point for the React application, bootstrapping the Redux store, custom contexts, and router

const root = ReactDom.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <SubscriptionProvider>
                <BrowserRouter>
                    <React.Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#00d4aa', fontSize: '1.2rem' }}>Loading workspace...</div>}>
                        <App />
                    </React.Suspense>
                </BrowserRouter>
            </SubscriptionProvider>
        </Provider>
    </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();