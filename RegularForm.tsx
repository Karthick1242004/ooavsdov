import React, { useState } from "react";
import { Pencil, Trash2, Save, CircleArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormConfig } from "../formtypes";
import { FormFieldWithLabel } from "./FormField";
import { UseFormReturn } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";

interface SkillAttachment {
  id: number;
  name: string;
  source_type: string;
  path_url: string;
  source_info: string;
  uploaded_by_id: number;
  uploaded_at: string;
}

interface SkillData {
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
}

interface RegularFormProps {
  type: string;
  id?: string;
  config: FormConfig<any>;
  formMethods: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  isGeneratingPrompt: boolean;
  generateSystemPrompt: () => Promise<void>;
  skillName?: string;
  skillDescription?: string;
  skillData?: SkillData | null;
}

export const RegularForm: React.FC<RegularFormProps> = ({
  type,
  id,
  config,
  formMethods,
  onSubmit: originalOnSubmit,
  isGeneratingPrompt,
  generateSystemPrompt,
  skillName,
  skillDescription,
  skillData,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { control, handleSubmit, formState: { errors }, getValues } = formMethods;
  const showUploadedFiles = type === "skill" && id;
  const [localSkillData, setLocalSkillData] = useState<SkillData | null>(skillData || null);
  
  React.useEffect(() => {
    if (skillData) {
      setLocalSkillData(skillData);
    }
  }, [skillData]);

  const handleDeleteFile = async (fileId: number) => {
    if (!id || !localSkillData) return;
    const updatedAttachments = localSkillData.attachments.filter(
      attachment => attachment.id !== fileId
    );
    
    const formData = new FormData();
    formData.append('payload', JSON.stringify({
      files_to_delete: [fileId.toString()]
    }));
    try {
      const response = await axiosInstance({
        url: `skills/edit-skill/${id}?user_id=1`,
        method: 'POST',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data && response.data.data) {
        setLocalSkillData(response.data.data);
      }
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
    } catch (error) {
      console.error('Error deleting file:', error);
    }
    setLocalSkillData({
      ...localSkillData,
      attachments: updatedAttachments
    });
  };
  
  const handleFormSubmit = async (data: any) => {
    if (type === 'skill' && id) {
      const formData = new FormData();
      const skillDetails = {
        skillName: data.name,
        description: data.description,
        systemPrompt: data.systemPrompt || "",
        files_to_delete: []
      };
      formData.append('payload', JSON.stringify(skillDetails));

      const fileInputs = document.querySelectorAll('input[name="fileInput"]');
      if (fileInputs && fileInputs.length > 0) {
        const fileInput = fileInputs[0] as HTMLInputElement;
        if (fileInput.files && fileInput.files.length > 0) {
          for (let i = 0; i < fileInput.files.length; i++) {
            formData.append("files", fileInput.files[i]);
          }
        }
      }
      
      const logoInputs = document.querySelectorAll('input[name="logoFile"]');
      if (logoInputs && logoInputs.length > 0) {
        const logoInput = logoInputs[0] as HTMLInputElement;
        if (logoInput.files && logoInput.files.length > 0) {
          formData.append("logoFile", logoInput.files[0]);
        }
      }
      
      try {
        const response = await axiosInstance({
          url: `skills/edit-skill/${id}?user_id=1`,  
          method: 'POST',
          data: formData,
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data && response.data.data) {
          setLocalSkillData(response.data.data);
        }
        queryClient.invalidateQueries({ queryKey: ["workspace"] });
      } catch (error) {
        console.error('Error updating skill:', error);
      }
    } else {
      originalOnSubmit(data);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };
  
  const getFileType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch(extension) {
      case 'pdf':
        return 'PDF';
      case 'doc':
      case 'docx':
        return 'Word';
      case 'xls':
      case 'xlsx':
        return 'Excel';
      case 'ppt':
      case 'pptx':
        return 'PowerPoint';
      case 'txt':
        return 'Text';
      default:
        return extension?.toUpperCase() || 'Unknown';
    }
  };
  
  const hasAttachments = localSkillData?.attachments && localSkillData.attachments.length > 0;
  
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
        
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-4">
              <h1 className="text-md font-unilever-medium flex items-center">
                <Pencil className="h-5 w-5 mr-2" /> {id ? "Edit" : "New"} {config.title}
              </h1>
            </div>
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
            </div>
          </div>
          <div className="space-y-4">
            {type === 'skill' ? (
              <>
                {config.fields
                  .filter(field => 
                    field.type !== 'uploader' && 
                    !(id && field.name === 'category')
                  )
                  .map((field) => (
                    <FormFieldWithLabel
                      key={field.name}
                      field={field}
                      control={control}
                      errors={errors}
                      isModal={false}
                      type={type}
                      id={id}
                      skillName={skillName}
                      skillDescription={skillDescription}
                      isGeneratingPrompt={isGeneratingPrompt}
                      generateSystemPrompt={generateSystemPrompt}
                    />
                  ))
                }
                
                <div className="flex flex-row gap-4 mt-4">
                  {config.fields.filter(field => field.type === 'uploader').map((field) => (
                    <FormFieldWithLabel
                      key={field.name}
                      field={field}
                      control={control}
                      errors={errors}
                      isModal={false}
                      type={type}
                      id={id}
                      className="flex-1"
                    />
                  ))}
                </div>
                
                {showUploadedFiles && (
                  <div className="mt-6">
                    <h2 className="text-xs font-unilever-medium text-gray-600 mb-2">Uploaded Files</h2>
                    <div className="bg-white rounded-md shadow-sm overflow-hidden">
                      {hasAttachments ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-[#c9d0fe]">
                              <tr>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                  Date
                                </th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                  Type
                                </th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                  Attachment
                                </th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {localSkillData?.attachments.map((file) => (
                                <tr key={file.id} className="group bg-[#f6f8ff]">
                                  <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-600">
                                    {formatDate(file.uploaded_at)}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-600">
                                    {getFileType(file.name)}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap text-xs">
                                    <a href={file.path_url} className="text-blue-600 hover:underline">
                                      {file.name}
                                    </a>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    <button 
                                      type="button"
                                      onClick={() => handleDeleteFile(file.id)}
                                      className="disabled:opacity-50"
                                    >
                                      <Trash2 className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-red-500" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-6 text-center">
                          <p className="text-sm text-gray-500">No files available</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              config.fields.map((field) => (
                <FormFieldWithLabel
                  key={field.name}
                  field={field}
                  control={control}
                  errors={errors}
                  isModal={false}
                  type={type}
                  id={id}
                />
              ))
            )}
          </div>
        </form>
      </div>
    </div>
  );
}; 
