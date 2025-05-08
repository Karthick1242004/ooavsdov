import React from "react";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomUploader from "@/shared/Uploader";
import { FormField } from "../formtypes";

interface FormFieldRendererProps {
  field: FormField;
  control: Control<any>;
  errors: FieldErrors;
  isModal?: boolean;
  type: string;
  id?: string;
  skillName?: string;
  skillDescription?: string;
  isGeneratingPrompt?: boolean;
  generateSystemPrompt?: () => Promise<void>;
}

export const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({
  field,
  control,
  errors,
  isModal = false,
  type,
  id,
  skillName,
  skillDescription,
  isGeneratingPrompt = false,
  generateSystemPrompt
}) => {
  switch (field.type) {
    case "input":
      return (
        <Controller
          name={field.name}
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
                  if (generateSystemPrompt) generateSystemPrompt();
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
              name={field.name}
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
          name={field.name}
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
          name={field.name}
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

export const FormFieldWithLabel: React.FC<FormFieldRendererProps & { className?: string }> = ({
  field,
  control,
  errors,
  className = "",
  ...props
}) => {
  return (
    <div className={className}>
      <Label
        htmlFor={field.name}
        className="block text-xs font-unilever text-gray-600 mb-1"
      >
        {field.label}
      </Label>
      <FormFieldRenderer field={field} control={control} errors={errors} {...props} />
      {errors[field.name] && (
        <p className="text-red-500 text-xs mt-1">
          {errors[field.name]?.message as string}
        </p>
      )}
    </div>
  );
}; 