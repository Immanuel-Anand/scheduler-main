"use client";
import { eventSchema } from "../lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Button } from "./ui/button";
import useFetch from "../hooks/use-fetch";
import { updateEvent, getEventData } from "../actions/events";
import { useRouter } from "next/navigation";
import { Checkbox } from "./ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { useToast } from "../hooks/use-toast";
const EditEventForm = ({ eventId, onSubmitForm, onClose }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventSchema),
  });



  // Fetch existing event data
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setIsLoading(true);
        const event = await getEventData(eventId);
        if (event) {
          // Set form default values with existing data
          reset({
            title: event.title,
            description: event.description,
            duration: event.duration,
            isPrivate: event.isPrivate,
            location: event.location || [],
          });

          // Set location specific details if they exist
          if (event.inPersonDetails) {
            setInPersonLocation(event.inPersonDetails);
          }
          if (event.phoneDetails) {
            setPhoneDetails(event.phoneDetails);
          }
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchEventData();
    }
  }, [eventId, reset]);

  const locationOptions = [
    { id: "in-person", label: "In-person meeting" },
    { id: "phone", label: "Phone" },
    { id: "zoom", label: "Zoom" },
    { id: "google-meet", label: "Google Meet" },
    { id: "microsoft-teams", label: "Microsoft Teams" },
    { id: "ask-invitee", label: "Ask invitee" },
  ];

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [inPersonLocation, setInPersonLocation] = useState({ venue: "", address: "" });
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneDetails, setPhoneDetails] = useState({
    callType: "host-calls", // "host-calls" or "invitee-calls"
    phoneNumber: ""
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const formData = {
        ...data,
        inPersonDetails: data.location.includes("in-person") ? inPersonLocation : null,
        phoneDetails: data.location.includes("phone") ? phoneDetails : null,
      };
      
      const result = await updateEvent(eventId, formData);
      console.log("result", result);
      if (!result) {
        throw new Error("No response from update operation");
      }

      if (result.success) {
        toast({
          title: "Event updated",
          description: "Event updated successfully",
                className: "text-left",
          position: "top-right",
        });
        router.refresh();
        onClose?.();
        router.push("/events");
      } else {
        // Handle the error case
        toast({
          title: "Error",
          description: result.error || "Failed to update event",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error updating event:", err);
      toast({
        title: "Error updating event",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      onClose?.();
    }
  };

  const handleInPersonChange = (checked, field) => {
    const currentValue = field.value || []; // Ensure we have an array
    const updatedLocations = checked
      ? [...currentValue, "in-person"]
      : currentValue.filter((loc) => loc !== "in-person");
    
    field.onChange(updatedLocations);
    if (checked) {
      setShowLocationModal(true);
    } else {
      setInPersonLocation({ venue: "", address: "" });
    }
  };

  const handlePhoneChange = (checked, field) => {
    const currentValue = field.value || []; // Ensure we have an array
    const updatedLocations = checked
      ? [...currentValue, "phone"]
      : currentValue.filter((loc) => loc !== "phone");
    
    field.onChange(updatedLocations);
    if (checked) {
      setShowPhoneModal(true);
    } else {
      setPhoneDetails({ callType: "host-calls", phoneNumber: "" });
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <>
      <form
        className="px-6 flex flex-col gap-4 max-h-[calc(100vh-10rem)] overflow-y-auto"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Event Title
            </label>
            <Input id="title" {...register("title")} className="mt-1" />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Event description
            </label>
            <Input id="description" {...register("description")} className="mt-1" />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-medium text-gray-700"
            >
              Duration in minutes
            </label>
            <Input
              id="duration"
              {...register("duration", {
                valueAsNumber: true,
              })}
              type="number"
              className="mt-1"
            />
            {errors.duration && (
              <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="isPrivate"
              className="block text-sm font-medium text-gray-700"
            >
              Event Privacy
            </label>
            <Controller
              name="isPrivate"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ? "true" : "false"}
                  onValueChange={(value) => field.onChange(value === "true")}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Privacy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Private</SelectItem>
                    <SelectItem value="false">Public</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />

            {errors.isPrivate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.isPrivate.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Location
            </label>
            <div className="space-y-2">
              {locationOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Controller
                    name="location"
                    control={control}
                    defaultValue={[]}
                    render={({ field }) => (
                      <Checkbox
                        id={option.id}
                        checked={field.value?.includes(option.id)}
                        onCheckedChange={(checked) => {
                          if (option.id === "in-person") {
                            handleInPersonChange(checked, field);
                          } else if (option.id === "phone") {
                            handlePhoneChange(checked, field);
                          } else {
                            const updatedLocations = checked
                              ? [...(field.value || []), option.id]
                              : field.value?.filter((loc) => loc !== option.id) || [];
                            field.onChange(updatedLocations);
                          }
                        }}
                      />
                    )}
                  />
                  <label
                    htmlFor={option.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
            )}
            {errors.inPersonDetails?.venue && (
              <p className="text-red-500 text-sm mt-1">{errors.inPersonDetails.venue.message}</p>
            
            )}
            {errors.phoneDetails?.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.phoneDetails.phoneNumber.message}</p>
            )}
          </div>
  
          <Button type="submit" disabled={isLoading} className="w-full mt-4">
            {isLoading ? "Updating..." : "Update Event"}
          </Button>
        </div>
      </form>

      <Dialog 
        open={showLocationModal} 
        onOpenChange={(open) => {
          setShowLocationModal(open);
          if (!open) {
            document.body.focus();
          }
        }}
      >
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>In-person Meeting Details</DialogTitle>
            <DialogDescription>
              Enter the venue details for your in-person meeting.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Venue Name
                <p className="text-xs text-gray-500">Your invitee can see this information on the booking page</p>
              </label>
              <Input
                placeholder="Enter venue name"
                value={inPersonLocation.venue}
                onChange={(e) =>
                  setInPersonLocation((prev) => ({
                    ...prev,
                    venue: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Address (Optional)
                <p className="text-xs text-gray-500">Your invitee can see this information only after scheduling</p>
              </label>
              <Textarea
                placeholder="Enter complete address (optional)"
                value={inPersonLocation.address}
                onChange={(e) =>
                  setInPersonLocation((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
              />
            </div>
            <Button
              className="w-full"
              onClick={() => setShowLocationModal(false)}
              disabled={!inPersonLocation.venue}
            >
              Save Location
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={showPhoneModal} 
        onOpenChange={(open) => {
          setShowPhoneModal(open);
          if (!open) {
            document.body.focus();
          }
        }}
      >
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Phone Call Details</DialogTitle>
            <DialogDescription>
              Choose how you want to handle phone calls with your invitee.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <RadioGroup
              value={phoneDetails.callType}
              onValueChange={(value) => 
                setPhoneDetails(prev => ({
                  ...prev,
                  callType: value,
                  phoneNumber: value === "host-calls" ? "" : prev.phoneNumber
                }))
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="host-calls" id="host-calls" />
                <label htmlFor="host-calls" className="text-sm font-medium">
                  I will call my invitee
                  <p className="text-xs text-gray-500">
                    Your invitee will be asked to enter his/her phone number while scheduling
                  </p>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="invitee-calls" id="invitee-calls" />
                <label htmlFor="invitee-calls" className="text-sm font-medium">
                  My invitee should call me
                  <p className="text-xs text-gray-500">
                   Your phone number will be provided to your invitee after scheduling
                  </p>
                </label>
              </div>
            </RadioGroup>

            {phoneDetails.callType === "invitee-calls" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phoneDetails.phoneNumber}
                  onChange={(e) =>
                    setPhoneDetails(prev => ({
                      ...prev,
                      phoneNumber: e.target.value
                    }))
                  }
                />
              </div>
            )}

            <Button
              className="w-full"
              onClick={() => setShowPhoneModal(false)}
              disabled={phoneDetails.callType === "invitee-calls" && !phoneDetails.phoneNumber}
            >
              Save Phone Details
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditEventForm;
