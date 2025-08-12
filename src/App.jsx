import { createContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from "react-toastify";
import { store } from '@/store/store';
import AuthApp from '@/components/AuthApp';

// Create auth context
export const AuthContext = createContext(null);

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthApp />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ zIndex: 9999 }}
        />
      </BrowserRouter>
    </Provider>
  );
}

export default App;