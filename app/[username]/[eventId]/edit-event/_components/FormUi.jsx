"use client";
import { Input } from "../../../../../components/ui/input";
import React, { useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import { Label } from "../../../../../components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "../../../../../components/ui/radio-group";
import { Checkbox } from "../../../../../components/ui/checkbox";
import FormEdit from "./FormEdit";
// import {
//   formOwners,
//   userResponses,
// } from "@/configdb/schema";
// import moment from "moment";

import AddField from "./AddFieldModal";
import { Textarea } from "../../../../../components/ui/textarea";
import { Edit, Lock } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { useRouter } from "next/navigation";
import { Progress } from "../../../../../components/ui/progress";
import { useS3Upload } from "next-s3-upload";
import {
  MAX_FREE_SINGLE_FILE_SIZE,
  MAX_PRO_FORM_STORAGE,
  MAX_FREE_FORM_STORAGE,
  MAX_STARTER_FORM_STORAGE,
} from "../../../../../constants";

import { Switch } from "../../../../../components/ui/switch";


const FormUi = ({
  jsonForm,
  selectedTheme,
  onFieldUpdate,
  deleteField,
  handleAddField,
  firstLastName,
  addFirstLastName,
  editable = true,

}) => {
  let { uploadToS3, files } = useS3Upload();
  const [fileSizes, setFileSizes] = useState({});
  const [fileProgress, setFileProgress] = useState({});
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState();
  const [respNos, setRespNos] = useState(0);
  const [storage, setStorage] = useState(0);
  const [plan, setPlan] = useState("free");
  
  let formRef = useRef();
  const router = useRouter();


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (fieldName, itemName, value) => {
    // console.log(fieldName, itemName, value);
    const list = formData?.[fieldName] ? formData?.[fieldName] : [];

    if (value) {
      list.push({
        label: itemName,
        value: value,
      });
      setFormData({
        ...formData,
        [fieldName]: list,
      });
    } else {
      const result = list.filter((item) => item.label == itemName);
      setFormData({
        ...formData,
        [fieldName]: result,
      });
    }
  };

const onFormSubmit = async (e) => {
  e.preventDefault();
  console.log(formData);
}

  

  let handleFileChange = async (e) => {
    // Referred this for file upload: https://next-s3-upload.codingvalue.com/setup
    if (editable) {
      toast.error("File can't be uploaded in edit mode");
      return;
    }

    if (plan) {
      if (storage) {
        if (plan === "free") {
          if (storage >= MAX_FREE_FORM_STORAGE) {
            console.log(storage);
            console.log(MAX_FREE_FORM_STORAGE);
            toast.error(
              "Storage limit exceeded. Please upgrade. However, you can still submit without the file."
            );
            return;
          }
        }
        if (plan === "starter") {
          if (storage > MAX_STARTER_FORM_STORAGE) {
            console.log(storage);
            console.log(MAX_STARTER_FORM_STORAGE);
            toast.error(
              "Storage limit exceeded. Please upgrade. However, you can still submit without the file."
            );
            return;
          }
        }
        if (plan === "pro") {
          if (storage > MAX_PRO_FORM_STORAGE) {
            console.log(storage);
            console.log(MAX_PRO_FORM_STORAGE);
            toast.error(
              "Storage limit exceeded. However, you can still submit without the file."
            );
            return;
          }
        }

        if (e.target.files[0]) {
          const fileSize = (e.target.files[0].size / 1024 / 1024).toFixed(2); // in MB
          console.log(fileSize);
          // Validate file size (e.g., max 10MB)
          if (fileSize > MAX_FREE_SINGLE_FILE_SIZE) {
            toast.error("Upload failed! File size should be less than 10MB.");
            return;
          }

          const { name } = e.target;
          setUploading(true);
          let file = e.target.files[0];
          let { url, progress } = await uploadToS3(file, {
            onProgress: (percent) => {
              setFileProgress((prev) => ({
                ...prev,
                [name]: percent,
              }));
            },
          });
          setUploading(false);

          setFormData({ ...formData, [name]: url });
          setFileSizes({ ...fileSizes, [name]: fileSize });

          console.log("Successfully uploaded to S3!", url);
        }
      }
    }
  };

  return (
    <>
      {/* This data-theme is from daisyUi */}
      <form
        ref={(e) => (formRef = e)}
        onSubmit={onFormSubmit}
        className="border p-5 md:w-[600px] w-full rounded-lg"
        data-theme={selectedTheme}

      >
        {/* Name Fields */}
        <div className="my-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-gray-500" />
              <label className="text-xs text-gray-500">
                Name<span className="text-red-500 text-sm">*</span>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Add first and last name</label>
              <Switch
                checked={firstLastName}
                  onCheckedChange={() => {
    addFirstLastName(!firstLastName);  // Update the DB
  }}
              />
            </div>
          </div>

          {!firstLastName ? (
            <Input
              type="text"
              className="focus:outline-slate-300"
              placeholder="Enter your full name"
              name="name"
              required
              onChange={(e) => handleInputChange(e)}
            />
          ) : (
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="text"
                  className="focus:outline-slate-300"
                  placeholder="First name"
                  name="firstName"
                  required
                  onChange={(e) => handleInputChange(e)}
                />
              </div>
              <div className="flex-1">
                <Input
                  type="text"
                  className="focus:outline-slate-300"
                  placeholder="Last name"
                  name="lastName"
                  required
                  onChange={(e) => handleInputChange(e)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Email Field */}
        <div className="my-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-gray-500" />
            <label className="text-xs text-gray-500">
              Email<span className="text-red-500 text-sm">*</span>
            </label>
          </div>
          <Input
            type="email"
            className="focus:outline-slate-300"
            placeholder="Enter your email"
            name="email"
          />
        </div>
        <div className="flex items-center justify-center text-gray-500 text-sm cursor-pointer">
                <AddField onSubmit={(value) => handleAddField(value, 1)} />
              </div>
   
        {jsonForm?.fields?.map((field, index) => (
          <div key={index}>
            <div className="flex items-center gap-2">
              {field.fieldType == "select" ? (
                <div className="my-3 w-full">
                  <label className="text-xs text-gray-500">
                    {field.label}
                    {field?.required && (
                      <span className="text-red-500 text-sm">*</span>
                    )}
                  </label>
                  <Select
                    required={field?.required}
                    onValueChange={(value) =>
                      handleSelectChange(field.fieldName, value)
                    }
                  >
                    <SelectTrigger className="w-full bg-transparent">
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {field?.options?.map((item, index) => (
                        <SelectItem
                          key={index}
                          value={item.label ? item.label : item}
                        >
                          {item.label ? item.label : item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : field.fieldType == "radio" ? (
                <div className="my-3 w-full">
                  <label className="text-xs text-gray-500">
                    {field.label}
                    {field?.required && (
                      <span className="text-red-500 text-sm">*</span>
                    )}
                  </label>
                  <RadioGroup required={field?.required}>
                    {field.options?.map((option, index) =>
                      option.label ? (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={option.label}
                            id={option.label}
                            onClick={() =>
                              handleSelectChange(field.fieldName, option.label)
                            }
                          />
                          <Label htmlFor={option.label}>{option.label}</Label>
                        </div>
                      ) : (
                        <div
                          className="flex items-center space-x-2"
                          key={index}
                        >
                          <RadioGroupItem
                            value={option}
                            id={option}
                            onClick={() =>
                              handleSelectChange(field.fieldName, option)
                            }
                          />
                          <Label htmlFor={option}>{option}</Label>
                        </div>
                      )
                    )}
                  </RadioGroup>
                  {/* <RadioGroup required={field?.required}>
                    {field.options?.map((option, index) => (
                    {option.label &&  <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={option}
                          id={option}
                          onClick={() =>
                            handleSelectChange(field.fieldName, option)
                          }
                        />
                        <Label htmlFor={option}>{option}</Label>
                      </div>}
                    ))}
                  </RadioGroup> */}
                </div>
              ) : field.fieldType == "checkbox" ? (
                <div className="my-3 w-full">
                  <label className="text-xs text-gray-500">
                    {field.label}
                    {field?.required && (
                      <span className="text-red-500 text-sm">*</span>
                    )}
                  </label>
                  {field.options ? (
                    field.options?.map((option, index) => (
                      <div className="flex gap-2 items-center" key={index}>
                        {/* We took the onCheckedChange term from shadcn */}
                        <Checkbox
                          onCheckedChange={(value) =>
                            handleCheckboxChange(field.label, option, value)
                          }
                        />
                        <h2 className="text-sm">{option}</h2>
                      </div>
                    ))
                  ) : (
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        required={field.required}
                        onCheckedChange={(value) =>
                          handleCheckboxChange(field.label, value)
                        }
                      />

                      <h2>{field.label}</h2>
                    </div>
                  )}
                </div>
              ) : field.fieldType == "textarea" ? (
                <div className="my-3 w-full">
                  <label className="text-xs text-gray-500">
                    {field.label}
                    {field?.required && (
                      <span className="text-red-500 text-sm">*</span>
                    )}
                  </label>
                  <Textarea
                    type={field?.type}
                    className="focus:outline-slate-300"
                    placeholder={field.placeholder}
                    name={field.fieldName}
                    required={field?.required}
                    onChange={(e) => handleInputChange(e)}
                  />
                </div>
              ) : field.fieldType == "file" ? (
                <div className="my-3 w-full">
                  <label className="text-xs text-gray-500">
                    {field.label}
                    {field?.required && (
                      <span className="text-red-500 text-sm">*</span>
                    )}
                  </label>
                  <Input
                    type="file"
                    className="focus:outline-slate-300"
                    placeholder={field.placeholder}
                    name={field.fieldName}
                    required={field?.required}
                    onChange={handleFileChange}
                  />
                  <div className="pt-3">
                    {fileProgress[field.name] && (
                      <Progress value={fileProgress[field.name]} />
                    )}
                  </div>
                 
                </div>
              ) : (
                <div className="my-3 w-full">
                  <label className="text-xs text-gray-500">
                    {field.label}
                    {field?.required && (
                      <span className="text-red-500 text-sm">*</span>
                    )}
                  </label>
                  <Input
                    type={field?.type}
                    className="focus:outline-slate-300"
                    placeholder={field.placeholder}
                    name={field.fieldName}
                    required={field?.required}
                    onChange={(e) => handleInputChange(e)}
                  />
                </div>
              )}
              {editable && (
                <div>
                  <FormEdit
                    defaultValue={field}
                    onUpdate={(value) => onFieldUpdate(value, index)}
                    deleteField={() => deleteField(index)}
                  />
                </div>
              )}
            </div>
            {editable && (
              <div className="flex items-center justify-center text-gray-500 text-sm cursor-pointer">
                <AddField onSubmit={(value) => handleAddField(value, index)} />
              </div>
            )}
          </div>
        ))}
        
      </form>
    </>
  );
};

export default FormUi;
