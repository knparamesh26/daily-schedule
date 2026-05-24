import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../layouts/ProtectedRoute';
import AppLayout from '../layouts/AppLayout';
import Auth from '../pages/Auth';
import Dashboard from '../pages/Dashboard';
import Tasks from '../pages/Tasks';
import TaskDetail from '../pages/TaskDetail';
import TaskForm from '../pages/TaskForm';
import Calendar from '../pages/Calendar';
import Projects from '../pages/Projects';
import ProjectDetail from '../pages/ProjectDetail';
import History from '../pages/History';
import Settings from '../pages/Settings';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="tasks/new" element={<TaskForm />} />
            <Route path="tasks/:taskId" element={<TaskDetail />} />
            <Route path="tasks/:taskId/edit" element={<TaskForm />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:projectId" element={<ProjectDetail />} />
            <Route path="history" element={<History />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
