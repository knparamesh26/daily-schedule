import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import NewProjectModal from '../components/NewProjectModal';
import { useAppData } from '../context/AppContext';
import { LayoutContext } from '../context/LayoutContext';
import type { Project } from '../types';

export default function AppLayout() {
  const navigate = useNavigate();
  const { loading, appError, clearError, handleSaveProject } = useAppData();

  const [search, setSearch] = useState('');
  const [projectModal, setProjectModal] = useState<{ open: boolean; project?: Project }>({ open: false });

  const openProjectModal = (project?: Project) => setProjectModal({ open: true, project });
  const closeProjectModal = () => setProjectModal({ open: false, project: undefined });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-md text-on-surface-variant">
          <span className="material-symbols-outlined text-icon-6xl text-primary animate-spin">autorenew</span>
          <p className="text-body-md">Loading TaskStream…</p>
        </div>
      </div>
    );
  }

  return (
    <LayoutContext.Provider value={{ openProjectModal }}>
      <div className="text-on-surface min-h-screen flex font-sans bg-background">
        <Sidebar />

        <main className="flex-1 ml-sidebar-w flex flex-col min-h-screen">
          <TopBar
            search={search}
            onSearch={setSearch}
          />

          {appError && (
            <div className="flex items-center justify-between gap-md px-xl py-sm bg-error-container text-on-error-container text-label-sm">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-icon-base">error</span>
                {appError}
              </div>
              <button onClick={clearError} aria-label="Dismiss error" className="hover:opacity-70 transition-opacity">
                <span className="material-symbols-outlined text-icon-base">close</span>
              </button>
            </div>
          )}

          <div className="flex-1">
            <Outlet />
          </div>
        </main>

        {projectModal.open && (
          <NewProjectModal
            project={projectModal.project}
            onSave={async (data) => {
              await handleSaveProject(data, projectModal.project);
              closeProjectModal();
            }}
            onClose={closeProjectModal}
          />
        )}

        <button
          onClick={() => navigate('/tasks/new')}
          className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform duration-150"
          aria-label="Add task"
        >
          <span className="material-symbols-outlined text-icon-2xl">add</span>
        </button>
      </div>
    </LayoutContext.Provider>
  );
}
