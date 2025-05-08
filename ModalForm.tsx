import React from "react";
import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Controller, UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormField as FormFieldType, FormConfig } from "../formtypes";
import { FormFieldWithLabel } from "./FormField";
import CustomUploader from "@/shared/Uploader";

interface ModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  type: string;
  id?: string;
  config: FormConfig<any>;
  formMethods: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  shouldShowFileUploader: boolean;
  shouldShowSharePointInput: boolean;
  shouldShowPublicURLInput: boolean;
  isGeneratingPrompt: boolean;
  generateSystemPrompt: () => Promise<void>;
  skillName?: string;
  skillDescription?: string;
}

export const ModalForm: React.FC<ModalFormProps> = ({
  isOpen,
  onClose,
  type,
  id,
  config,
  formMethods,
  onSubmit,
  shouldShowFileUploader,
  shouldShowSharePointInput,
  shouldShowPublicURLInput,
  isGeneratingPrompt,
  generateSystemPrompt,
  skillName,
  skillDescription,
}) => {
  if (!isOpen) return null;
  
  const { control, handleSubmit, formState: { errors } } = formMethods;
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
          <form onSubmit={handleSubmit(onSubmit)}>
            {type === 'skill' ? (
              <div className="border-b border-gray-200 pb-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-6">
                    {config.fields
                      .filter(field => field.column === 'left')
                      .map((field) => (
                        <FormFieldWithLabel
                          key={field.name}
                          field={field}
                          control={control}
                          errors={errors}
                          isModal={true}
                          type={type}
                          id={id}
                          skillName={skillName}
                          skillDescription={skillDescription}
                          isGeneratingPrompt={isGeneratingPrompt}
                          generateSystemPrompt={generateSystemPrompt}
                          className="block"
                        />
                      ))}
                  </div>
                  <div className="space-y-6 border-l border-gray-200 pl-6">
                    {config.fields
                      .filter(field => field.column === 'right' && field.name === 'category')
                      .map((field) => (
                        <FormFieldWithLabel
                          key={field.name}
                          field={field}
                          control={control}
                          errors={errors}
                          isModal={true}
                          type={type}
                          id={id}
                          className="block"
                        />
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
                {config.fields.map((field) => (
                  <FormFieldWithLabel
                    key={field.name}
                    field={field}
                    control={control}
                    errors={errors}
                    isModal={true}
                    type={type}
                    id={id}
                    className="block"
                  />
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-end mt-3 space-x-2">
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 
