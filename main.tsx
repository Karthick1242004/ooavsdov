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
