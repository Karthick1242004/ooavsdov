/**
 * Project: Multi Skilled Bot (MSB
 * Description: MSB is an enterprise web application that streamlines workspace and skill management. It integrates with external AI endpoints (RAG) for query processing and supports robust file uploads to Azure Data Lake Storage (ADLS) for large files in any format. The system also utilizes Azure MS SQL for database management.
 *
 * Logic Name: Store Provider Using - Zustand
 * Logic Description: Implementing Zustand store's according to the API response structure. Using which we can power up the UI and update the store object as needed. Store should have proper set() functions to update each value.
 */

import { create } from "zustand";
import { ProcessingStatus } from '../modules/workspace/workspace-details';

// Define the Workspace interface reflecting a single workspace entity
interface Audit {
  createdAt?:string;
  updatedAt?:string;
}

export interface Skill extends Audit{
  logo: string | undefined;
  id: string;
  name: string;
  domain: string;
  description : string;
  processing_status: ProcessingStatus;
  is_processed_for_rag: boolean;
  workspace?: string | number;
}
export interface Workspace extends Audit {
  id: string;
  name: string;
  description?: string;
  category?: string;
  icc?: string;
  costCenter?: string;
  responsible?: string;
  skills:Skill[]
}

// Define the Zustand store interface for workspaces
interface WorkspaceStore {
  workspaces: Workspace[];
  setWorkspaces: (workspaces: Workspace[]) => void;
  addWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (workspace: Workspace) => void;
  clearWorkspaces: () => void;
  updateSkillStatus: (skillId: string, processing_status: ProcessingStatus, is_processed_for_rag: boolean) => void;
}

// Create the Zustand store with initial state and setters
export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  workspaces: [],
  // Set the entire workspaces array
  setWorkspaces: (workspaces: Workspace[]) => set({ workspaces }),
  // Add a new workspace to the array
  addWorkspace: (workspace: Workspace) => set((state: WorkspaceStore) => ({ workspaces: [...state.workspaces, workspace] })),
  // Update an existing workspace by matching workspaceId
  updateWorkspace: (workspace: Workspace) => set((state: WorkspaceStore) => ({
    workspaces: state.workspaces.map((w) => w.id === workspace.id ? { ...w, ...workspace } : w)
  })),
  // Clear all workspaces
  clearWorkspaces: () => set({ workspaces: [] }),
  // Update a specific skill's processing status
  updateSkillStatus: (skillId: string, processing_status: ProcessingStatus, is_processed_for_rag: boolean) => 
    set((state: WorkspaceStore) => ({
      workspaces: state.workspaces.map(workspace => ({
        ...workspace,
        skills: workspace.skills.map(skill => 
          skill.id === skillId 
            ? { ...skill, processing_status, is_processed_for_rag } 
            : skill
        )
      }))
    })),
}));

