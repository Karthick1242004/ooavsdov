"use client";

import React, { useEffect, useState } from "react";
import {
  LineChartIcon as ChartLine,
  PencilLine,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  type Skill as StoreSkill,
  useWorkspaceStore,
} from "@/@logic/workspaceStore";
import { useNavigation } from "@/hooks/navigationHook";
import Dot from "@/shared/dot/dot";
import type { ProcessingStatus } from "../workspace-details";
import { baseURL } from "@/@logic";

type Skill = StoreSkill;

interface SkillStatusResponse {
  processing_status: string;
  is_processed_for_rag: boolean;
}

interface WorkspaceSkillCardProps {
  skill: Skill;
  workspaceName: string;
}

function WorkspaceSkillCard({
  skill: initialSkill,
  workspaceName,
}: WorkspaceSkillCardProps) {
  const { navigateTo } = useNavigation();
  const [shouldFetch, setShouldFetch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const updateSkillStatus = useWorkspaceStore(
    (state) => state.updateSkillStatus
  );
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const latestSkill = React.useMemo(() => {
    for (const workspace of workspaces) {
      const foundSkill = workspace.skills.find((s) => s.id === initialSkill.id);
      if (foundSkill) {
        return foundSkill;
      }
    }
    console.log("Using initial skill (not found in store):", initialSkill);
    return initialSkill;
  }, [workspaces, initialSkill, forceUpdate]);

  const skill = latestSkill;
  const currentSkillStatus = useWorkspaceStore((state) => {
    for (const workspace of state.workspaces) {
      const skill = workspace.skills.find((s) => s.id === initialSkill.id);
      if (skill) {
        return skill.processing_status;
      }
    }
    return initialSkill.processing_status;
  });

  useEffect(() => {
    console.log("Detected skill status change in store:", currentSkillStatus);
    setForceUpdate((prev) => prev + 1);
  }, [currentSkillStatus]);

  const isProcessSuccessful = currentSkillStatus === "Completed";
  const isProcessFailed = currentSkillStatus === "Failed";
  const isProcessing =
    currentSkillStatus === "Pending" || currentSkillStatus === "Inprogress";
  const handleEditClick = (e: React.MouseEvent, skill: Skill) => {
    e.preventDefault();
    const workspaceId = skill.workspace?.toString() || "";
    navigateTo({
      path: `/workspace/skill/edit/${skill.id}`,
      state: { skill, type: "skill", workspaceId },
    });
  };

  const handleCheckStatus = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    fetch(`${baseURL}/skills/${skill.id}/rag-status`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data && typeof data.processing_status === "string") {
          updateSkillStatus(
            skill.id,
            data.processing_status as ProcessingStatus,
            !!data.is_processed_for_rag
          );
          setForceUpdate((prev) => prev + 1);
        }
      })
      .catch((err) => console.error("Error fetching status:", err))
      .finally(() => {
        setIsLoading(false);
        setShouldFetch(false);
      });
  };

  const CardContent = () => (
    <div className="relative h-full flex flex-col">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 rounded-lg border border-blue-200">
          <span className="text-xs font-semibold text-[var(--workspace-color-highlight)] px-4 py-1 rounded-lg border border-[var(--workspace-color-highlight)] bg-white shadow">
            Checking skill status...
          </span>
        </div>
      )}
      <div
        className={`relative h-full ${
          isLoading ? "blur-xs opacity-100 pointer-events-none select-none" : ""
        }`}
      >
        <div
          className={`group relative h-full flex flex-col transition-all duration-300 border ${
            isProcessFailed
              ? "bg-red-50 border-red-200"
              : "bg-[#F4F8FF] border-[#CBE0FF]"
          } rounded-lg p-4`}
        >
          <div className="flex flex-row-reverse items-center justify-between h-full">
            <div className="flex items-center justify-center">
              <img
                src="https://img.freepik.com/free-vector/butterfly-colorful-logo-template_361591-1587.jpg?ga=GA1.1.1951523002.1738084030&semt=ais_hybrid&w=740"
                className="w-20 h-20 rounded-md"
                alt="logo"
              />
            </div>
            
            <div className="flex flex-col justify-between h-full flex-1">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3
                    className={`font-semibold text-xs font-unilever-medium ${
                      isProcessFailed
                        ? "text-black"
                        : "text-[var(--workspace-color-highlight)]"
                    }`}
                  >
                    {skill.name && skill.name.length > 22
                      ? `${skill.name.substring(0, 20)}...`
                      : skill.name}
                  </h3>
                </div>
                
                {isProcessSuccessful ? (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] bg-[var(--workspace-color-bg-light)] text-[var(--workspace-color-highlight)]">
                      <UserRound size={14} />
                      Clara
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] bg-[var(--workspace-color-bg-light)] text-[var(--workspace-color-highlight)]">
                      <Dot bgcolor="bg-[var(--workspace-color-highlight)]" />
                      15 Chats
                    </div>
                  </div>
                ) : null}
                
                <p className="text-[11px] text-gray-500">
                  {skill.description && skill.description.length > 100
                    ? `${skill.description.substring(0, 76)}...`
                    : skill.description}
                </p>
              </div>
              
              <div className="mt-2">
                {isProcessSuccessful ? (
                  <p className="text-xs absolute bottom-0 right-0">
                    <span className="inline-block py-[1px] opacity-0 px-2 text-[10px] rounded-tl-xl rounded-br-lg bg-[var(--workspace-color-highlight)] text-white translate-x-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0">
                      Start a chat with this skill
                    </span>
                  </p>
                ) : (
                  <div>
                    {isProcessFailed ? (
                      <button className="text-xs cursor-pointer">
                        <span className="inline-block py-[2px] pb-[3px] px-2 text-[10px] rounded-sm bg-red-400 text-white">
                          Delete Skill
                        </span>
                      </button>
                    ) : (
                      <button
                        className="text-xs mt-1 cursor-pointer"
                        onClick={handleCheckStatus}
                      >
                        <span className="inline-block py-[4px] px-2 text-[10px] rounded-sm bg-[var(--workspace-color-highlight)] text-white">
                          Check skill status
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {isProcessSuccessful && (
            <>
              <button
                onClick={(e) => handleEditClick(e, skill)}
                className="absolute top-1 right-8 p-1 text-xs text-[var(--workspace-color-highlight)]"
              >
                <span className="inline-block opacity-0 border-l border-t border-b border-gray-200 rounded-l-sm bg-white p-1 translate-x-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0">
                  <PencilLine size={16} />
                </span>
              </button>
              <button className="absolute top-1 right-2 p-1 text-xs text-[var(--workspace-color-highlight)]">
                <span className="inline-block opacity-0 border-r border-t border-b border-gray-200 rounded-r-sm bg-white p-1 translate-x-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0">
                  <ChartLine size={16} />
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const cardWrapper = isProcessSuccessful ? (
    <Link
      key={skill.id}
      to={`/chat?workspace-name=${workspaceName}&skill-name=${skill.name}&skill-id=${skill.id}`}
      className="block h-full"
    >
      <CardContent />
    </Link>
  ) : (
    <div className="h-full">
      <CardContent />
    </div>
  );

  return <div className="h-full">{cardWrapper}</div>;
}

export default WorkspaceSkillCard;
