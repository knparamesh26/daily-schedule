import { createContext, useContext } from 'react';
import type { Project } from '../types';

interface LayoutCtx {
  openProjectModal: (project?: Project) => void;
}

export const LayoutContext = createContext<LayoutCtx>({ openProjectModal: () => {} });

export const useLayout = () => useContext(LayoutContext);
