import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ChevronDown,
  Pencil,
  Trash2,
  Save,
  CircleArrowLeft,
  X,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { baseURL } from "@/@logic";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import "@uppy/core/dist/style.css";
import "@uppy/drag-drop/dist/style.css";
import CustomUploader from "@/shared/Uploader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormConfigs, FormField, formConfigs, SkillFormData } from "./formtypes";

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
  const { control, handleSubmit, setValue, formState: { errors }, watch } = useForm({
    defaultValues: { 
      ...config.defaultValues, 
      ...(type === 'skill' ? {
        systemPrompt: "",
        publicURL: "",
        sharePointURL: "",
      } : {}),
    },
  });


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

  const renderField = (field: FormField) => {
    switch (field.type) {
      case "input":
        return (
          <Controller
            name={field.name as keyof typeof config.defaultValues}
            control={control}
            rules={{ required: field.required ? `${field.label} is required` : false }}
            render={({ field: { ...fieldProps } }) => (
              <Input
                {...fieldProps}
                placeholder={field.placeholder}
                className="w-full bg-white border-gray-200 !text-xs"
              />
            )}
          />
        );
      case "textarea":
        if (field.name === 'systemPrompt' && isModal) {
          const isGenerateDisabled = !skillName || !skillDescription;
          
          return (
            <div>
              
              <div className="flex justify-end mt-[-6%] items-center mb-1">
                <Button 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    generateSystemPrompt();
                  }}
                  disabled={isGenerateDisabled || isGeneratingPrompt}
                  className="text-xs shadow-none text-blue-600 py-1 px-2 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {isGeneratingPrompt ? (
                    <>
                      <Loader2 size={12} className="mr-1 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} className="mr-1" /> Auto Generate
                    </>
                  )}
                </Button>
              </div>
              <Controller
                name={field.name as keyof typeof config.defaultValues}
                control={control}
                rules={{ required: field.required ? `${field.label} is required` : false }}
                render={({ field: { ...fieldProps } }) => (
                  <Textarea
                    {...fieldProps}
                    rows={field.rows}
                    placeholder={field.placeholder}
                    className="w-full h-24 bg-white border-gray-200 !text-xs"
                  />
                )}
              />
            </div>
          );
        }
        
        return (
          <Controller
            name={field.name as keyof typeof config.defaultValues}
            control={control}
            rules={{ required: field.required ? `${field.label} is required` : false }}
            render={({ field: { ...fieldProps } }) => (
              <Textarea
                {...fieldProps}
                rows={field.rows}
                placeholder={field.placeholder}
                className="w-full bg-white border-gray-200 !text-xs"
              />
            )}
          />
        );
      case "select":
        return (
          <Controller
            name={field.name as keyof typeof config.defaultValues}
            control={control}
            render={({ field: { value, onChange } }) => (
              <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-full bg-white border-gray-200 !text-xs">
                  <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {field.options?.map((option: string) => (
                    <SelectItem key={option} value={option} className="!text-xs">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        );
      case "uploader":
        const uploaderId = `${type}-${field.uploaderType || field.name}-${id || 'new'}`;
        const isLogo = field.uploaderType === 'logo';
        const uploaderLabel = isLogo 
          ? "Choose a logo or drag & drop it here"
          : "Choose files or drag & drop them here";
        const uploaderAccept = isLogo
          ? ".jpg,.jpeg,.png,.svg"
          : ".pdf,.docx,.doc,.txt,.xlsx,.xls";
        
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <CustomUploader 
              id={uploaderId} 
              label={uploaderLabel} 
              accept={uploaderAccept}
              multiple={!isLogo}
              fieldName={isLogo ? 'logoFile' : 'fileInput'}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-4">
          {!isModal?
          <h1 className="text-md font-unilever-medium flex items-center">
            <Pencil className="h-5 w-5 mr-2" /> {id ? "Edit" : "New"} {config.title}
          </h1>: null
          }
        </div>
        {!isModal?
      <div className="flex items-center space-x-2">
          {id && (
            <Button
              variant="outline"
              className="border-red-500 text-xs text-red-500 !px-2 hover:bg-red-50"
              type="button"
            >
              Delete {config.title}
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            className="bg-blue-600 text-xs text-white hover:bg-blue-700"
            type="submit"
          >
            {id ? "Save Changes" : `Create ${config.title}`}
            <Save className="h-4 w-4 ml-2" />
          </Button>
        </div>: null
        }
      </div>

      {type === 'skill' && isModal ? (
        <div className="border-b border-gray-200 pb-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-6">
              {config.fields
                .filter(field => field.column === 'left')
                .map((field) => (
                  <div key={field.name}>
                    <Label
                      htmlFor={field.name}
                      className="block text-sm font-unilever-medium text-gray-700 mb-1"
                    >
                      {field.label}
                    </Label>
                    {renderField(field)}
                    {errors[field.name as keyof typeof errors] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[field.name as keyof typeof errors]?.message as string}
                      </p>
                    )}
                  </div>
                ))}
            </div>
            <div className="space-y-6 border-l border-gray-200 pl-6">
              {config.fields
                .filter(field => field.column === 'right' && field.name === 'category')
                .map((field) => (
                  <div key={field.name}>
                    <Label
                      htmlFor={field.name}
                      className="block text-sm font-unilever-medium text-gray-700 mb-1"
                    >
                      {field.label}
                    </Label>
                    {renderField(field)}
                    {errors[field.name as keyof typeof errors] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[field.name as keyof typeof errors]?.message as string}
                      </p>
                    )}
                  </div>
                ))}
              
              <div>
                <Label
                  htmlFor={shouldShowFileUploader ? "files" : (shouldShowSharePointInput ? "sharePointURL" : "publicURL")}
                  className="block text-sm font-unilever-medium text-gray-700 mb-1"
                >
                  {shouldShowFileUploader ? "Upload Files" : 
                   (shouldShowSharePointInput ? "SharePoint URL" : "Public URL")}
                </Label>
                
                {shouldShowFileUploader ? (
                  <div onClick={(e) => e.stopPropagation()}>
                    <CustomUploader 
                      id={`${type}-files-${id || 'new'}`}
                      label="Choose files or drag & drop them here"
                      accept=".pdf,.docx,.doc,.txt,.xlsx,.xls"
                      multiple={true}
                      fieldName="fileInput"
                    />
                  </div>
                ) : shouldShowSharePointInput ? (
                  <Controller
                    name="sharePointURL"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter SharePoint URL"
                        className="w-full bg-white border-gray-200 !text-xs"
                      />
                    )}
                  />
                ) : shouldShowPublicURLInput ? (
                  <Controller
                    name="publicURL"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter public URL"
                        className="w-full bg-white border-gray-200 !text-xs"
                      />
                    )}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {type === 'skill' && !isModal ? (
            <>
              {config.fields.filter(field => field.type !== 'uploader').map((field) => (
                <div key={field.name}>
                  <Label
                    htmlFor={field.name}
                    className="block text-xs font-unilever text-gray-600 mb-1"
                  >
                    {field.label}
                  </Label>
                  {renderField(field)}
                  {errors[field.name as keyof typeof errors] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[field.name as keyof typeof errors]?.message as string}
                    </p>
                  )}
                </div>
              ))}
            
              <div className="flex flex-row gap-4 mt-4">
                {config.fields.filter(field => field.type === 'uploader').map((field) => (
                  <div key={field.name} className="flex-1">
                    <Label
                      htmlFor={field.name}
                      className="block text-xs font-unilever text-gray-600 mb-1"
                    >
                      {field.label}
                    </Label>
                    {renderField(field)}
                    {errors[field.name as keyof typeof errors] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[field.name as keyof typeof errors]?.message as string}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            config.fields.map((field) => (
              <div key={field.name}>
                <Label
                  htmlFor={field.name}
                  className="block text-xs font-unilever text-gray-600 mb-1"
                >
                  {field.label}
                </Label>
                {renderField(field)}
                {errors[field.name as keyof typeof errors] && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors[field.name as keyof typeof errors]?.message as string}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
      {isModal?
      <div className="flex  items-center justify-end mt-3 space-x-2">

            <Button
              variant="outline"
              className="border-red-500 text-xs text-red-500 !px-2 hover:bg-red-50"
              type="button"
              onClick={onClose}
            >
              Cancel
             
            </Button>

          <Button
            className="bg-blue-600 text-xs text-white hover:bg-blue-700"
            type="submit"
          >
            {id ? "Save Changes" : `Create ${config.title}`}
            <Save className="h-4 w-4 ml-2" />
          </Button>
        </div>: null
        }
    </form>
  );

  if (isModal) {
    const hasColumns = config.fields.some(field => field.column);
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
         <div className={`bg-white rounded-lg min-h-fit max-h-[300px] my-auto w-full ${hasColumns ? 'max-w-6xl' : 'max-w-xl'} px-2 overflow-y-auto`}>
          <div className="flex justify-between items-center p-4">
            <div>
              <h2 className="text-md font-unilever-medium">New {config.title}</h2>
              <p className="text-gray-500 font-thin text-xs">
                Fill out the details below to create a new {config.title.toLowerCase()} seamlessly.
              </p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          <div className="px-4">
            <div className="h-[1px] w-[100%] bg-black"></div>
          </div>
          <div className="p-4 overflow-y-auto">
            {formContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-unilever h-[var(--edit-content-height)] bg-[#F4FAFC] shadow-lg overflow-y-auto mt-2 rounded-xl w-full">
      <div className="max-w-full mx-auto px-5 py-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 ml-[-1%] text-[12px]"
          onClick={() => navigate("/workspace/my-workspace")}
        >
          <CircleArrowLeft size={12} className="mt-1" />
          Back
        </Button>
        {formContent}
      </div>
    </div>
  );
}
