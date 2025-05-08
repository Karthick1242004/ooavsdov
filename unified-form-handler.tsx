import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { baseURL } from "@/@logic";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import "@uppy/core/dist/style.css";
import "@uppy/drag-drop/dist/style.css";
import { FormConfigs, formConfigs, SkillFormData } from "./formtypes";
import { ModalForm } from "./components/ModalForm";
import { RegularForm } from "./components/RegularForm";

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

  useEffect(() => {
    if (item) {
      (Object.keys(config.defaultValues) as Array<keyof typeof config.defaultValues>).forEach((key) => {
        setValue(key, item[key] || config.defaultValues[key]);
      });
    }
  }, [item, setValue, config.defaultValues]);

  const onSubmit = async (data: typeof config.defaultValues) => {
    try {
      const endpoint = id ? config.apiEndpoints.update : config.apiEndpoints.create;
      
      if (type === "skill") {
        let url = `${baseURL}${endpoint}?userId=${userId}`;
        if (workspaceId) {
          url += `&workspaceId=${workspaceId}`;
        }
        
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
        if (id) {
          url = `${baseURL}/${config.apiEndpoints.update}?skillId=${id}&userId=${userId}`;
          if (workspaceId) {
            url += `&workspaceId=${workspaceId}`;
          }
        }
        
        const response = await fetch(url, {
          method: "POST",
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Failed to ${id ? "update" : "create"} ${type}`);
        }
      } else {
        const url = id ? `${baseURL}/${endpoint}?${type}Id=${id}` : `${baseURL}/${endpoint}`;
        const payload = {
          ...data,
          id: id || undefined,
          workspaceId: workspaceId || undefined,
        };
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to ${id ? "update" : "create"} ${type}`);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      if (isModal && onClose) {
        onClose();
      } else {
        navigate("/workspace/my-workspace");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : `Failed to ${id ? "update" : "create"} ${type}`);
    }
  };

  if (isModal && !isOpen) return null;
  if (!isModal && !item) return null;
  
  const generateSystemPrompt = async () => {
    try {
      if (!skillName || !skillDescription) return;
      setIsGeneratingPrompt(true);
      const response = await fetch(`${baseURL}skills/system-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: skillName,
          description: skillDescription
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate system prompt');
      }
      
      const responseData = await response.json();
      if (responseData && responseData.data) {
        setValue('systemPrompt', responseData.data);
      } else {
        console.error('Unexpected API response format:', responseData);
      }
    } catch (error) {
      console.error('Error generating system prompt:', error);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

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
    />
  );
}