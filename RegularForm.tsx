import React from "react";
import { Pencil, Trash2, Save, CircleArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormConfig } from "../formtypes";
import { FormFieldWithLabel } from "./FormField";
import { UseFormReturn } from "react-hook-form";
import { useNavigate } from "react-router-dom";

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
}

export const RegularForm: React.FC<RegularFormProps> = ({
  type,
  id,
  config,
  formMethods,
  onSubmit,
  isGeneratingPrompt,
  generateSystemPrompt,
  skillName,
  skillDescription,
}) => {
  const navigate = useNavigate();
  const { control, handleSubmit, formState: { errors } } = formMethods;
  
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
        
        <form onSubmit={handleSubmit(onSubmit)}>
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

          <div className="space-y-2">
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
