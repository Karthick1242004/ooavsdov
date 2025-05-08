import React, { useState } from 'react';
import { ChartLine, PencilLine, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Skill as StoreSkill } from '@/@logic/workspaceStore';
import { useFetchHandler } from '@/@logic/getHandlers';
import { useNavigation } from '@/hooks/navigationHook';
import Dot from '@/shared/dot/dot';

type Skill = StoreSkill;

interface WorkspaceSkillCardProps {
  skill: Skill;
  workspaceName: string;
}

function WorkspaceSkillCard({ skill, workspaceName }: WorkspaceSkillCardProps) {
  const { navigateTo } = useNavigation();
  const [localSkill, setLocalSkill] = useState<Skill>(skill);
  const [shouldFetch, setShouldFetch] = useState(false);
  const isProcessSuccessful = localSkill.processing_status === "Completed" && localSkill.is_processed_for_rag;
  const isProcessFailed = localSkill.processing_status === "Failed";
  const isProcessing = localSkill.processing_status === "Pending" || localSkill.processing_status === "Inprogress";

  const handleEditClick = (e: React.MouseEvent, skill: Skill) => {
    e.preventDefault();
    const workspaceId = skill.workspace?.toString() || "";
    navigateTo({
      path: `/workspace/skill/edit/${skill.id}`,
      state: { skill, type: "skill", workspaceId }
    });
  };

  const { data, isFetching: isPending, refetch } = useFetchHandler(
    shouldFetch ? `skills/${localSkill.id}/rag-status` : '',
    `skill-status-${localSkill.id}`
  );

  React.useEffect(() => {
    if (data) {
      setLocalSkill({
        ...localSkill,
        processing_status: data.processing_status,
        is_processed_for_rag: data.is_processed_for_rag
      });
      setShouldFetch(false);
    }
  }, [data]);

  const handleCheckStatus = (e: React.MouseEvent) => {
    e.preventDefault();
    setShouldFetch(true);
    refetch();
  };

  const CardContent = () => (
    <div className="relative">
      {isPending && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 rounded-lg border border-blue-200">
          <span className="text-xs font-semibold text-[var(--workspace-color-highlight)] px-4 py-1 rounded-lg border border-[var(--workspace-color-highlight)] bg-white shadow">
            Checking skill status...
          </span>
        </div>
      )}
      <div className={isPending ? "blur-xs opacity-100 pointer-events-none select-none" : ""}>
        <div
          className={`group relative transition-all min-h-[120px] duration-300 border ${isProcessFailed
              ? "bg-red-50 border-red-200"
              : "bg-[#F4F8FF] border-[#CBE0FF]"
            } rounded-lg p-4`}
        >
          <div className="flex flex-row gap-2 items-center justify-between">
            <div className="flex flex-col w-full">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3
                    className={`font-semibold text-sm font-unilever-medium ${isProcessFailed
                        ? "text-black"
                        : "text-[var(--workspace-color-highlight)]"
                      }`}
                  >
                    {localSkill.name}
                  </h3>
                </div>
              </div>
              {isProcessSuccessful ?
                <>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-[var(--workspace-color-bg-light)] text-[var(--workspace-color-highlight)]">
                    <UserRound size={14} />
                    Clara
                  </div>
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-[var(--workspace-color-bg-light)] text-[var(--workspace-color-highlight)]">
                    <Dot bgcolor='bg-[var(--workspace-color-highlight)]' />
                    15 Skills
                  </div>
                </div></>:null }
              <p className="text-[12px] text-gray-500">
                {localSkill.description && localSkill.description.length > 120
                  ? `${localSkill.description.substring(0, 120)}...`
                  : localSkill.description}
              </p>

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
                <div className="mt-2 mr-10">
                  {isProcessFailed ? (
                    <>
                      <button className="text-xs cursor-pointer">
                        <span className="inline-block py-1 px-2 text-[10px] rounded-sm bg-red-400 text-white">
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
                      <span className="inline-block py-1 px-2 text-[10px] rounded-sm bg-[var(--workspace-color-highlight)] text-white">
                        Check skill status
                      </span>
                    </button>
                  ) : (
                    <button className="text-xs cursor-pointer">
                      <span className="inline-block py-1 px-2 text-[10px] rounded-sm bg-[var(--workspace-color-highlight)] text-white">
                        Check skill status
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
      </div>
    </div>
  );

  return isProcessSuccessful ? (
    <Link key={localSkill.id} to={`/chat?workspace-name=${workspaceName}&skill-name=${localSkill.name}&skill-id=${localSkill.id}`}>
      <CardContent />
    </Link>
  ) : (
    <CardContent />
  );
}

export default WorkspaceSkillCard;
