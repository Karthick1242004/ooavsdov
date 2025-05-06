import React, { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Workspace } from "@/@logic/workspaceStore";
import { UnifiedForm } from "./unified-form-handler";
import WorkspaceSkillCard from "./workspace-skill-card";


export type ProcessingStatus = "Pending" | "Inprogress" | "Completed" | "Failed";

export default function WorkspaceDetails({
  workspace,
}: {
  workspace: Workspace;
}) {
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);

  return (
    <div className="w-full border-2 border-[var(--workspace-color-highlight)] rounded-xl p-3 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-md font-unilever-medium text-black pb-2">
            {workspace.name}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search skills..."
              className="pl-8 pr-4 py-2 border border-[#CBE0FF] rounded-lg text-sm focus:outline-none focus:border-[var(--workspace-color-highlight)] w-[200px]"
            />
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <Button
            className="bg-[var(--workspace-color-highlight)] text-white"
            onClick={() => {
              setIsSkillModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Skill
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 overflow-y-scroll min-h-[10vh] max-h-[30vh] lg:grid-cols-3 gap-3 overflow-x-hidden scrollbar-hide">
        {workspace.skills?.map((skill) => (
          <WorkspaceSkillCard 
            key={skill.id}
            skill={skill}
            workspaceName={workspace.name}
          />
        ))}
      </div>
      <UnifiedForm
        type="skill"
        isModal={true}
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        workspaceId={workspace.id}
      />
    </div>
  );
}
