// components/AddFieldModal.js
import React, { useState } from "react";
import { Input } from "../../../../../components/ui/input";
import { Button } from "../../../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../../components/ui/popover";
import { Trash2 } from "lucide-react";

const AddField = ({ onSubmit }) => {
  const [fieldType, setFieldType] = useState("text");
  const [fieldRequired, setFieldRequired] = useState(false);
  const [label, setLabel] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [options, setOptions] = useState([""]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ fieldType, label, placeholder, options, fieldRequired });
    setFieldRequired(false);
    setFieldType("text");
    setLabel("");
    setPlaceholder("");
    setOptions([""]);
    setIsPopoverOpen(false); // Close the popover
  };

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    console.log(options);
  };

  const handleDeleteOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger onClick={() => setIsPopoverOpen(true)}>
        + Add a new field here
      </PopoverTrigger>
      <PopoverContent className="w-96 max-h-96 overflow-y-auto p-4">
        {/* Only if we make it as form, we can use the required='true' option */}
        <form onSubmit={handleSubmit}>
          <h2>Add Field</h2>
          <div className="mb-3">
            <label className="text-xs">Field Type</label>
            <Select onValueChange={(value) => setFieldType(value)}>
              <SelectTrigger className="w-full bg-transparent">
                <SelectValue placeholder="Text" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="textarea">Textarea</SelectItem>
                <SelectItem value="select">Select</SelectItem>
                <SelectItem value="radio">Radio</SelectItem>
                <SelectItem value="checkbox">Checkbox</SelectItem>
                <SelectItem value="file">File Upload</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(fieldType === "select" ||
            fieldType === "radio" ||
            fieldType === "checkbox") && (
            <div className="my-2">
              <label className="text-xs">Options</label>
              {options?.map((option, index) => (
                <div key={index} className="my-2 flex gap-2 items-center">
                  <Input
                    type="text"
                    className="focus:outline-slate-300"
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    value={option}
                    required={true}
                  />
                  <Trash2
                    className="h-4 w-4 text-gray-500 cursor-pointer"
                    onClick={() => handleDeleteOption(index)}
                  />
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                className="mt-2 text-xs text-blue-500 flex border border-none"
                onClick={handleAddOption}
              >
                + Add Another
              </Button>
            </div>
          )}
          <div className="mb-3">
            <label className="text-xs">Label Name</label>
            <Input
              type="text"
              className="focus:outline-slate-300"
              onChange={(e) => setLabel(e.target.value)}
              value={label}
               required={true}
            />
          </div>
          {fieldType !== "file" && (
            <div className="mb-3">
              <label className="text-xs">Placeholder Name</label>
              <Input
                type="text"
                className="focus:outline-slate-300"
                onChange={(e) => setPlaceholder(e.target.value)}
                value={placeholder}
                required={true}
              />
            </div>
          )}
          <div className="mb-3">
            <label className="text-xs">Required Field?</label>
            <Select onValueChange={(value) => setFieldRequired(value)}>
              <SelectTrigger className="w-full bg-transparent">
                <SelectValue placeholder="No" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={true}>Yes</SelectItem>
                <SelectItem value={false}>No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button size="sm" className="mt-3" type="submit">
              Add Field
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={(e) => {
                e.preventDefault(); // This is to prevent triggering of handleSubmit functionality
                setIsPopoverOpen(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
};

export default AddField;
