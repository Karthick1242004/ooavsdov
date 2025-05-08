import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { baseURL, HTTPMethod } from "@/@logic";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import "@uppy/core/dist/style.css";
import "@uppy/drag-drop/dist/style.css";
import { FormConfigs, formConfigs, SkillFormData } from "./formtypes";
import { ModalForm } from "./components/ModalForm";
import { RegularForm } from "./components/RegularForm";
import RegularFormSkeleton from "./components/RegularFormSkeleton";
import { useFetchHandler } from "@/@logic/getHandlers";
import { useMutateHandler, Payload } from "@/@logic/mutateHandlers";

interface SkillAttachment {
  id: number;
  name: string;
  source_type: string;
  path_url: string;
  source_info: string;
  uploaded_by_id: number;
  uploaded_at: string;
}

interface SkillResponse {
  data: {
    id: number;
    name: string;
    description: string;
    workspace_id: number;
    system_prompt: string;
    is_processed_for_rag: boolean;
    processing_status: string;
    logo_path: string;
    created_by_id: number;
    created_at: string;
    updated_at: string;
    attachments: SkillAttachment[];
  };
  message: string;
}

interface FormProps {
  type: keyof FormConfigs;
  isModal?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  workspaceId?: string;
  userId?: string;
}

export function UnifiedForm({ type, isModal = false, isOpen, onClose, workspaceId, userId = "1" }: FormProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [item, setItem] = useState<any>(location.state?.[type] || null);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [skillData, setSkillData] = useState<SkillResponse["data"] | null>(null);

  const config = formConfigs[type];
  const formMethods = useForm({
    defaultValues: { 
      ...config.defaultValues, 
      ...(type === 'skill' ? {
        systemPrompt: "",
        publicURL: "",
        sharePointURL: "",
      } : {}),
    },
  });

  const { setValue, watch } = formMethods;
  const skillName = watch("name");
  const skillDescription = watch("description");
  const dataSourceType = watch("category");
  const shouldShowFileUploader = type === 'skill' && dataSourceType === 'File upload';
  const shouldShowSharePointInput = type === 'skill' && dataSourceType === 'Sharepoint URL';
  const shouldShowPublicURLInput = type === 'skill' && dataSourceType === 'Public URL';

  const { data: fetchedSkillData, isLoading: isFetchingSkill } = useFetchHandler(
    type === 'skill' && id && !isModal ? `skills/${id}` : '',
    'skillData'
  );

  useEffect(() => {
    if (fetchedSkillData) {
      setSkillData(fetchedSkillData);
      setValue('name', fetchedSkillData.name);
      setValue('description', fetchedSkillData.description);
      setValue('systemPrompt', fetchedSkillData.system_prompt);
      if (fetchedSkillData.attachments && fetchedSkillData.attachments.length > 0) {
        if (fetchedSkillData.attachments[0].source_type === 'ADLS') {
          setValue('category', 'File upload');
        } else if (fetchedSkillData.attachments[0].source_type === 'sharePoint') {
          setValue('category', 'Sharepoint URL');
        } else if (fetchedSkillData.attachments[0].source_type === 'URL') {
          setValue('category', 'Public URL');
        }
      }
    }
  }, [fetchedSkillData, setValue]);

  useEffect(() => {
    setIsLoading(isFetchingSkill);
  }, [isFetchingSkill]);

  useEffect(() => {
    if (item) {
      (Object.keys(config.defaultValues) as Array<keyof typeof config.defaultValues>).forEach((key) => {
        setValue(key, item[key] || config.defaultValues[key]);
      });
    }
  }, [item, setValue, config.defaultValues]);

  const systemPromptMutation = useMutateHandler({
    endUrl: 'skills/system-prompt',
    method: HTTPMethod.POST,
    onSuccess: (data) => {
      if (data && data.data) {
        setValue('systemPrompt', data.data);
      }
    }
  });

  const submitFormMutation = useMutateHandler({
    endUrl: id 
      ? `${config.apiEndpoints.update}?${type}Id=${id}${workspaceId ? `&workspaceId=${workspaceId}` : ''}&userId=${userId}`
      : `${config.apiEndpoints.create}${workspaceId ? `?workspaceId=${workspaceId}` : ''}`,
    method: HTTPMethod.POST,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      if (isModal && onClose) {
        onClose();
      } else {
        navigate("/workspace/my-workspace");
      }
    }
  });

  const onSubmit = async (data: typeof config.defaultValues) => {
    try {
      if (type === "skill") {
        const formData = new FormData();
        const skillData = data as SkillFormData;
        formData.append("skillName", skillData.name);
        formData.append("description", skillData.description);
        formData.append("systemPrompt", skillData.systemPrompt || "");
      
        if (workspaceId) {
          formData.append("workspaceId", workspaceId);
        }

        let dataSource = "";
        if (dataSourceType === "File upload") {
          dataSource = "ADLS";
          const fileInputs = document.querySelectorAll('input[name="fileInput"]');
          if (fileInputs && fileInputs.length > 0) {
            const fileInput = fileInputs[0] as HTMLInputElement;
            if (fileInput.files && fileInput.files.length > 0) {
              for (let i = 0; i < fileInput.files.length; i++) {
                formData.append("fileInput", fileInput.files[i]);
              }
            }
          }
        } else if (dataSourceType === "Sharepoint URL") {
          dataSource = "sharePoint";
          formData.append("sharePointURL", skillData.sharePointURL || "");
        } else if (dataSourceType === "Public URL") {
          dataSource = "URL";
          formData.append("publicURL", skillData.publicURL || "");
        }
        
        formData.append("dataSource", dataSource);
        const logoInputs = document.querySelectorAll('input[name="logoFile"]');
        if (logoInputs && logoInputs.length > 0) {
          const logoInput = logoInputs[0] as HTMLInputElement;
          if (logoInput.files && logoInput.files.length > 0) {
            formData.append("logoFile", logoInput.files[0]);
          }
        }
        const url = id 
          ? `${baseURL}/skills/update?skillId=${id}&userId=${userId}${workspaceId ? `&workspaceId=${workspaceId}` : ''}`
          : `${baseURL}/skills/create?userId=${userId}${workspaceId ? `&workspaceId=${workspaceId}` : ''}`;
        
        const response = await fetch(url, {
          method: "POST",
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Failed to ${id ? "update" : "create"} ${type}`);
        }
        
        queryClient.invalidateQueries({ queryKey: ["workspace"] });
        if (isModal && onClose) {
          onClose();
        } else {
          navigate("/workspace/my-workspace");
        }
      } else {
        const payload = {
          ...data,
          id: id || undefined,
          workspaceId: workspaceId || undefined,
        };
        
        submitFormMutation.mutate(payload as Payload);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : `Failed to ${id ? "update" : "create"} ${type}`);
    }
  };

  const generateSystemPrompt = async () => {
    if (!skillName || !skillDescription) return;
    setIsGeneratingPrompt(true);
    
    try {
      systemPromptMutation.mutate({
        name: skillName,
        description: skillDescription
      });
    } catch (error) {
      console.error('Error generating system prompt:', error);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  if (isLoading) {
    return (
      <RegularFormSkeleton />
    );
  }
  if (isModal && !isOpen) return null;
  if (!isModal && !item && !skillData && type !== 'skill') return null;
  
  if (isModal) {
    return (
      <ModalForm
        isOpen={!!isOpen}
        onClose={onClose || (() => {})}
        type={type}
        id={id}
        config={config}
        formMethods={formMethods}
        onSubmit={onSubmit}
        shouldShowFileUploader={shouldShowFileUploader}
        shouldShowSharePointInput={shouldShowSharePointInput}
        shouldShowPublicURLInput={shouldShowPublicURLInput}
        isGeneratingPrompt={isGeneratingPrompt}
        generateSystemPrompt={generateSystemPrompt}
        skillName={skillName}
        skillDescription={skillDescription}
      />
    );
  }

  return (
    <RegularForm
      type={type}
      id={id}
      config={config}
      formMethods={formMethods}
      onSubmit={onSubmit}
      isGeneratingPrompt={isGeneratingPrompt}
      generateSystemPrompt={generateSystemPrompt}
      skillName={skillName}
      skillDescription={skillDescription}
      skillData={skillData}
    />
  );
}
