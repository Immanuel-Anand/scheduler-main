import { Edit, Trash, Trash2 } from "lucide-react";
import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../../components/ui/popover";
import { Input } from "../../../../../components/ui/input";
import { Button } from "../../../../../components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../../../components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";

const FormEdit = ({ defaultValue, onUpdate, deleteField }) => {
  const [label, setLabel] = useState(defaultValue?.label);
  const [placeholder, setPlaceholder] = useState(defaultValue?.placeholder);
  const [options, setOptions] = useState(defaultValue?.options);
  const [fieldRequired, setFieldRequired] = useState(defaultValue?.required);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      label: label,
      placeholder: placeholder,
      required: fieldRequired,
      options: options,
    });
    setIsPopoverOpen(false); // Close the popover
  };
  return (
    <div className="flex gap-2">
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger onClick={() => setIsPopoverOpen(true)}>
          <Edit className="h-4 w-4 text-gray-500" />
        </PopoverTrigger>

        <PopoverContent>
          <h2>Edit Fields</h2>
          <form onSubmit={handleSubmit}>
            <div className="">
              <label className="text-xs">Label Name</label>
              <Input
                type="text"
                className="focus:outline-slate-300"
                defaultValue={defaultValue.label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
            <div className="">
              <label className="text-xs">Placeholder Name</label>
              <Input
                type="text"
                className="focus:outline-slate-300"
                defaultValue={defaultValue.placeholder}
                onChange={(e) => setPlaceholder(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="text-xs">Required Field?</label>
              <Select onValueChange={(value) => setFieldRequired(value)}>
                <SelectTrigger className="w-full bg-transparent">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={true}>Yes</SelectItem>
                  <SelectItem value={false}>No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(defaultValue.fieldType === "select" ||
              defaultValue.fieldType === "radio" ||
              defaultValue.fieldType === "checkbox") && (
              <div className="my-2">
                <label className="text-xs">Edit Options</label>
                {options?.map((option, index) => (
                  <div key={index} className="my-2 flex gap-2 items-center">
                    <Input
                      type="text"
                      className="focus:outline-slate-300"
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      value={option}
                      required={true}
                    />
                    <Trash2
                      className="h-4 w-4 text-gray-500"
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
            <div className="flex gap-3">
              <Button size="sm" className="mt-3" type="submit">
                Update
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

      <AlertDialog>
        <AlertDialogTrigger>
          <Trash2 className="h-4 w-4 text-gray-500" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              field.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteField()}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FormEdit;
