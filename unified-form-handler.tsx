/*
  Project: Multi Skilled Bot (MSB
  Description: MSB is an enterprise web application that streamlines workspace and skill management. It integrates with external AI endpoints (RAG) for query processing and supports robust file uploads to Azure Data Lake Storage (ADLS) for large files in any format. It also utilizes Azure MS SQL for database management.

  Logic: Zustand Store Provider - Skills
  Description: Implementing Zustand store's according to the API response structure. This store powers the UI by managing skills data retrieved from the endpoints:
             - GET /workspaces/{workspaceId}/skills
             - GET /workspaces/{workspaceId}/skills/{skillId}/files
             The store includes functions to set, update, add, and delete skills and associated files.
*/

import {create} from 'zustand';

// Define the file model returned from the API for a skill
export interface SkillFile {
  fileId: string;
  fileName: string;
  fileType: string;
  uploadedAt: string; // ISO date string
}

// Define the skill model returned from the API
export interface Skill {
  skillId: string;
  name: string;
  description: string;
  files?: SkillFile[];
}

// Define the Zustand store interface for skills
export interface SkillsStore {
  skills: Skill[];
  // Set the entire skills array
  setSkills: (skills: Skill[]) => void;
  // Add a new skill
  addSkill: (skill: Skill) => void;
  // Update an existing skill
  updateSkill: (skillId: string, updates: Partial<Skill>) => void;
  // Delete a skill
  deleteSkill: (skillId: string) => void;
  // Functions to manage files within a skill
  setSkillFiles: (skillId: string, files: SkillFile[]) => void;
  addSkillFile: (skillId: string, file: SkillFile) => void;
  updateSkillFile: (skillId: string, fileId: string, updates: Partial<SkillFile>) => void;
  deleteSkillFile: (skillId: string, fileId: string) => void;
}

// Create the Zustand store for skills
export const useSkillsStore = create<SkillsStore>((set) => ({
  skills: [],

  // Synchronously set the skills array
  setSkills: (skills: Skill[]) => set({ skills }),

  // Add new skill to the store
  addSkill: (skill: Skill) => set((state) => ({ skills: [...state.skills, skill] })),

  // Update an existing skill based on skillId
  updateSkill: (skillId: string, updates: Partial<Skill>) => set((state) => ({
    skills: state.skills.map((skill) => (skill.skillId === skillId ? { ...skill, ...updates } : skill))
  })),

  // Remove a skill from the store
  deleteSkill: (skillId: string) => set((state) => ({
    skills: state.skills.filter((skill) => skill.skillId !== skillId)
  })),

  // Set the files for a specific skill
  setSkillFiles: (skillId: string, files: SkillFile[]) => set((state) => ({
    skills: state.skills.map((skill) =>
      skill.skillId === skillId ? { ...skill, files } : skill
    )
  })),

  // Add a file to a specific skill
  addSkillFile: (skillId: string, file: SkillFile) => set((state) => ({
    skills: state.skills.map((skill) => {
      if (skill.skillId === skillId) {
        const updatedFiles = skill.files ? [...skill.files, file] : [file];
        return { ...skill, files: updatedFiles };
      }
      return skill;
    })
  })),

  // Update a file within a specific skill
  updateSkillFile: (skillId: string, fileId: string, updates: Partial<SkillFile>) => set((state) => ({
    skills: state.skills.map((skill) => {
      if (skill.skillId === skillId && skill.files) {
        return {
          ...skill,
          files: skill.files.map((file) => file.fileId === fileId ? { ...file, ...updates } : file)
        };
      }
      return skill;
    })
  })),

  // Delete a file from a specific skill
  deleteSkillFile: (skillId: string, fileId: string) => set((state) => ({
    skills: state.skills.map((skill) => {
      if (skill.skillId === skillId && skill.files) {
        return {
          ...skill,
          files: skill.files.filter((file) => file.fileId !== fileId)
        };
      }
      return skill;
    })
  })),
}));
