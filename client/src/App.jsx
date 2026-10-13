import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Suppliers from './pages/Suppliers';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import Alerts from './pages/Alerts';
import Staff from './pages/Staff';

function App() {
  return (
    <AuthProvider>
      <InventoryProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Application Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="sales" element={<Sales />} />
              <Route path="purchases" element={<Purchases />} />
              <Route path="alerts" element={<Alerts />} />
              <Route
                path="staff"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <Staff />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </InventoryProvider>
    </AuthProvider>
  );
}

export default App;
