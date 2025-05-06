import React, { useState } from 'react';
import { ChartLine, PencilLine } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ProcessingStatus } from './workspace-details';
import { Skill as StoreSkill } from '@/@logic/workspaceStore';
import { useMutation } from '@tanstack/react-query';

type Skill = StoreSkill;

interface WorkspaceSkillCardProps {
  skill: Skill;
  workspaceName: string;
}

function WorkspaceSkillCard({ skill, workspaceName }: WorkspaceSkillCardProps) {
  const navigate = useNavigate();
  const [localSkill, setLocalSkill] = useState<Skill>(skill);

  const isProcessSuccessful = localSkill.processing_status === "Completed" && localSkill.is_processed_for_rag;
  const isProcessFailed = localSkill.processing_status === "Failed";
  const isProcessing = localSkill.processing_status === "Pending" || localSkill.processing_status === "Inprogress";
  
  const handleEditClick = (e: React.MouseEvent, skill: Skill) => {
    e.preventDefault();
    const workspaceId = skill.workspace?.toString() || "";
    navigate(`/workspace/skill/edit/${skill.id}`, {
      state: { skill, type: "skill", workspaceId },
    });
  };

  const fetchSkillStatus = async () => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    const response = await fetch(`${apiBaseUrl}skills/${localSkill.id}/rag-status`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch skill status');
    }
    
    return response.json();
  };

  const { mutate: checkStatus, isPending } = useMutation({
    mutationFn: fetchSkillStatus,
    onSuccess: (data) => {
      setLocalSkill({
        ...localSkill,
        processing_status: data.processing_status,
        is_processed_for_rag: data.is_processed_for_rag
      });
    },
    onError: (error) => {
      console.error('Error fetching skill status:', error);
    }
  });

  const handleCheckStatus = (e: React.MouseEvent) => {
    e.preventDefault();
    checkStatus();
  };

  const CardContent = () => (
    <div
      className={`group relative transition-all min-h-[120px] duration-300 border ${
        isProcessFailed
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
                  isProcessFailed
                    ? "text-black"
                    : "text-[var(--workspace-color-highlight)]"
                }`}
              >
                {localSkill.name}
              </h3>
            </div>
          </div>
          <p className="text-[12px] text-gray-500">{localSkill.description}</p>
          
          {isProcessSuccessful && (
            <>
              <button
                onClick={(e) => handleEditClick(e, localSkill)}
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
          
          {!isProcessSuccessful && (
            <div className="mt-5 mr-10">
              {isProcessFailed ? (
                <>
                  <button className="text-xs cursor-pointer">
                    <span className="inline-block py-[2px] pb-[3px] px-2 text-[10px] rounded-sm bg-red-400 text-white">
                      Delete Skill
                    </span>
                  </button>
                  <p className="absolute bottom-0 right-0 text-xs">
                    <span className="inline-block py-[1px] opacity-0 px-2 text-[10px] rounded-tl-xl rounded-br-lg bg-red-400 text-white translate-x-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0">
                      Skill creation failed
                    </span>
                  </p>
                </>
              ) : isProcessing ? (
                <button className="text-xs cursor-pointer" onClick={handleCheckStatus}>
                  <span className="inline-block py-[2px] pb-[3px] px-2 text-[10px] rounded-sm bg-[var(--workspace-color-highlight)] text-white">
                    {isPending ? "Checking..." : "Check skill status"}
                  </span>
                </button>
              ) : (
                <button className="text-xs cursor-pointer">
                  <span className="inline-block py-[2px] pb-[3px] px-2 text-[10px] rounded-sm bg-yellow-400 text-white">
                    Processed but not RAG ready
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
        <img
          src={localSkill.logo || "https://img.freepik.com/premium-vector/lorem-ipsum-logo-design-colorful-gradient_779267-18.jpg?w=1380"}
          className="w-1/4 h-1/4 rounded-md"
          alt="logo"
        />
      </div>
    </div>
  );

  return isProcessSuccessful ? (
    <Link key={localSkill.id} to={`/chat?workspaceName=${workspaceName}&skillName=${localSkill.name}`}>
      <CardContent />
    </Link>
  ) : (
    <CardContent />
  );
}

export default WorkspaceSkillCard;
