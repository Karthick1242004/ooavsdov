import React from 'react';
import { ChartLine, PencilLine } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

type SkillStatus = "success" | "inProgress" | "failed";

interface WorkspaceSkillCardProps {
  skill: any;
  skillStatus: SkillStatus;
  workspaceName: string;
}

function WorkspaceSkillCard({ skill, skillStatus, workspaceName }: WorkspaceSkillCardProps) {
  const navigate = useNavigate();
  const handleEditClick = (e: React.MouseEvent, skill: any) => {
    e.preventDefault();
    navigate(`/workspace/skill/edit/${skill.id}`, {
      state: { skill, type: "skill", workspaceId: skill.workspaceId },
    });
  };

  return (
    <Link key={skill.id} to={`/chat?workspaceName=${workspaceName}&skillName=${skill.name}`}>
      <div
        className={`group relative transition-all min-h-[120px] duration-300 border ${
          skillStatus === "failed"
            ? "bg-red-50 border-red-200"
            : "bg-[#F4F8FF] border-[#CBE0FF]"
        } rounded-lg p-4`}
      >
        <div className="flex flex-row gap-2 items-center justify-between">
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3
                  className={`font-semibold text-sm font-unilever-medium ${
                    skillStatus === "failed"
                      ? "text-black"
                      : "text-[var(--workspace-color-highlight)]"
                  }`}
                >
                  {skill.name}
                </h3>
              </div>
            </div>
            <p className="text-[12px] text-gray-500">{skill.description}</p>
            
            {/* UI for Success state */}
            {skillStatus === "success" && (
              <>
                <button
                  onClick={(e) => handleEditClick(e, skill)}
                  className="absolute top-1 right-8 p-1 text-xs text-[var(--workspace-color-highlight)]"
                >
                  <span className="inline-block opacity-0 border-l border-t border-b border-gray-200 rounded-l-sm bg-white p-1 translate-x-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0">
                    <PencilLine size={16} />
                  </span>
                </button>
                <p className="absolute bottom-0 right-0 text-xs">
                  <span className="inline-block py-[1px] opacity-0 px-2 text-[10px] rounded-tl-xl rounded-br-lg bg-[var(--workspace-color-highlight)] text-white translate-x-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0">
                    Start a chat with this skill
                  </span>
                </p>
                <button className="absolute top-1 right-2 p-1 text-xs text-[var(--workspace-color-highlight)]">
                  <span className="inline-block opacity-0 border-r border-t border-b border-gray-200 rounded-r-sm bg-white p-1 translate-x-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0">
                    <ChartLine size={16} />
                  </span>
                </button>
              </>
            )}
            
            {/* UI for Failed or InProgress state */}
            {skillStatus !== "success" && (
              <div className="mt-5 mr-10">
                {skillStatus === "failed" ? (
                  <button className="text-xs cursor-pointer">
                    <span className="inline-block py-[2px] pb-[3px] px-2 text-[10px] rounded-sm bg-red-400 text-white">
                      Delete Skill
                    </span>
                  </button>
                ) : (
                  <button className="text-xs cursor-pointer">
                    <span className="inline-block py-[2px] pb-[3px] px-2 text-[10px] rounded-sm bg-[var(--workspace-color-highlight)] text-white">
                      Check skill status
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
          <img
            src="https://img.freepik.com/premium-vector/lorem-ipsum-logo-design-colorful-gradient_779267-18.jpg?w=1380"
            className="w-1/4 h-1/4 rounded-md"
            alt="logo"
          />
        </div>
      </div>
    </Link>
  );
}

export default WorkspaceSkillCard;




















import React, { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Workspace } from "@/@logic/workspaceStore";
import { UnifiedForm } from "./unified-form-handler";
import WorkspaceSkillCard from "./workspace-skill-card";

type SkillStatus = "success" | "inProgress" | "failed";

export default function WorkspaceDetails({
  workspace,
}: {
  workspace: Workspace;
}) {
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [skillStatus] = useState<SkillStatus>("failed");

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
            skillStatus={skillStatus}
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
