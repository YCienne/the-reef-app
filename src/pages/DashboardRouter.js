import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../admin/AdminDashboard';
import Dashboard from './Dashboard';

const DashboardRouter = () => {
    const { isAdmin } = useAuth();
    return isAdmin ? <AdminDashboard /> : <Dashboard />;
};

export default DashboardRouter;
