"use client";
import { bookingSchema } from "../../../../../lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { info } from "autoprefixer";
import React, { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { useForm } from "react-hook-form";
import "react-day-picker/style.css";
import { Button } from "../../../../../components/ui/button";
import { format } from "date-fns";
import { Input } from "../../../../../components/ui/input";
import { Textarea } from "../../../../../components/ui/textarea";
import { useToast } from "../../../../../hooks/use-toast";
import { createBooking } from "../../../../../actions/bookings";
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
import { getEventData } from "../../../../../actions/events";
import { MapPin } from "lucide-react";
import Image from "next/image";
import ReactSelect from 'react-select';

const BookingForm = ({ event, availability }) => {
  // Along with user provided info, we need to retain the time and date the user selected while booking
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [formData, setFormData] = useState();
  const [firstLastName, setFirstLastName] = useState(false);
  const [personName, setPersonName] = useState();
  const [personEmail, setPersonEmail] = useState();
  const [personFirstName, setPersonFirstName] = useState();
  const [personLastName, setPersonLastName] = useState();
  const [location, setLocation] = useState();
  const [selectedLocation, setSelectedLocation] = useState();
  const [suggestedLocation, setSuggestedLocation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState();
  const [personTimeZone, setPersonTimeZone] = useState();
  const [allowGuest, setAllowGuest] = useState(true);
  const [guestEmails, setGuestEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resData, setResData] = useState();
   const [jsonForm, setJsonForm] = useState([]);
  const [record, setRecord] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState("light");
  const [selectedBackground, setSelectedBackground] = useState();
  const { toast } = useToast();
   let formRef = useRef();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingSchema),
  });

  // Function to format timezone name
  const formatTimezoneName = (tz) => {
    const timeZoneNames = {
      // North America
      'America/Los_Angeles': 'Pacific Time - US/Canada',
      'America/Vancouver': 'Pacific Time - Canada',
      'America/Denver': 'Mountain Time - US & Canada',
      'America/Phoenix': 'Mountain Time - Arizona',
      'America/Chicago': 'Central Time - US/Canada',
      'America/Mexico_City': 'Central Time - Mexico',
      'America/New_York': 'Eastern Time - US/Canada',
      'America/Toronto': 'Eastern Time - Canada',
      'America/Halifax': 'Atlantic Time - Canada',
      'America/St_Johns': 'Newfoundland Time - Canada',
      'America/Anchorage': 'Alaska Time',
      'Pacific/Honolulu': 'Hawaii Time',

      // South America
      'America/Sao_Paulo': 'São Paulo Time - Brazil',
      'America/Buenos_Aires': 'Buenos Aires Time - Argentina',
      'America/Santiago': 'Santiago Time - Chile',
      'America/Lima': 'Lima Time - Peru',
      'America/Bogota': 'Bogota Time - Colombia',

      // Europe
      'Europe/London': 'London Time - UK',
      'Europe/Dublin': 'Dublin Time - Ireland',
      'Europe/Paris': 'Paris Time - France',
      'Europe/Berlin': 'Berlin Time - Germany',
      'Europe/Rome': 'Rome Time - Italy',
      'Europe/Madrid': 'Madrid Time - Spain',
      'Europe/Amsterdam': 'Amsterdam Time - Netherlands',
      'Europe/Brussels': 'Brussels Time - Belgium',
      'Europe/Stockholm': 'Stockholm Time - Sweden',
      'Europe/Oslo': 'Oslo Time - Norway',
      'Europe/Copenhagen': 'Copenhagen Time - Denmark',
      'Europe/Helsinki': 'Helsinki Time - Finland',
      'Europe/Warsaw': 'Warsaw Time - Poland',
      'Europe/Prague': 'Prague Time - Czech Republic',
      'Europe/Vienna': 'Vienna Time - Austria',
      'Europe/Budapest': 'Budapest Time - Hungary',
      'Europe/Zurich': 'Zurich Time - Switzerland',

      // Asia
      'Asia/Dubai': 'Dubai Time - UAE',
      'Asia/Riyadh': 'Riyadh Time - Saudi Arabia',
      'Asia/Jerusalem': 'Jerusalem Time - Israel',
      'Asia/Istanbul': 'Istanbul Time - Turkey',
      'Asia/Moscow': 'Moscow Time - Russia',
      'Asia/Kolkata': 'India Time',
      'Asia/Calcutta': 'India Time',
      'Asia/Dhaka': 'Dhaka Time - Bangladesh',
      'Asia/Bangkok': 'Bangkok Time - Thailand',
      'Asia/Singapore': 'Singapore Time',
      'Asia/Hong_Kong': 'Hong Kong Time',
      'Asia/Shanghai': 'China Time',
      'Asia/Seoul': 'Seoul Time - Korea',
      'Asia/Tokyo': 'Tokyo Time - Japan',
      'Asia/Manila': 'Manila Time - Philippines',

      // Oceania
      'Australia/Sydney': 'Sydney Time - Australia',
      'Australia/Melbourne': 'Melbourne Time - Australia',
      'Australia/Brisbane': 'Brisbane Time - Australia',
      'Australia/Adelaide': 'Adelaide Time - Australia',
      'Australia/Perth': 'Perth Time - Australia',
      'Pacific/Auckland': 'Auckland Time - New Zealand',

      // Africa
      'Africa/Cairo': 'Cairo Time - Egypt',
      'Africa/Johannesburg': 'Johannesburg Time - South Africa',
      'Africa/Nairobi': 'Nairobi Time - Kenya',
      'Africa/Lagos': 'Lagos Time - Nigeria',
      'Africa/Casablanca': 'Casablanca Time - Morocco'
    };
    return timeZoneNames[tz] || tz.replace(/_/g, ' ').split('/').pop();
  };

  const [selectedTimezone, setSelectedTimezone] = useState(() => {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date();
    return {
      value: userTimeZone,
      label: `${formatTimezoneName(userTimeZone)}    ${new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: userTimeZone
      }).format(now).toLowerCase()}`,
    };
  });

  const timezoneOptions = Intl.supportedValuesOf('timeZone')
    .filter(tz => formatTimezoneName(tz) !== tz.replace(/_/g, ' ').split('/').pop())
    .map(tz => {
      const now = new Date();
      const timeInZone = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: tz
      }).format(now).toLowerCase();
      
      return {
        value: tz,
        label: `${formatTimezoneName(tz)}    ${timeInZone}`,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  // Update the timezone selector to refresh times periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setSelectedTimezone(prev => ({
        value: prev.value,
        label: `${formatTimezoneName(prev.value)}    ${new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
          timeZone: prev.value
        }).format(now).toLowerCase()}`,
      }));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Add the convertToSelectedTimezone function
  const convertToSelectedTimezone = (slot, date) => {
    const [hours, minutes] = slot.split(':');
    const originalDateTime = new Date(date);
    originalDateTime.setHours(parseInt(hours), parseInt(minutes));
    
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: selectedTimezone.value
    }).format(originalDateTime).toLowerCase();
  };

  // Modified timeSlots calculation
  const timeSlots = selectedDate
    ? availability
        .find((day) => day.date === format(selectedDate, 'yyyy-MM-dd'))
        ?.slots.map(slot => convertToSelectedTimezone(slot, selectedDate)) || []
    : [];

  // Since selectedDate and time comes from DatePicker, we put them in useEffect as it is needed in bookingSchema
  useEffect(() => {
    if (selectedDate) {
      setValue("date", format(selectedDate, "yyyy-MM-dd"));
    }
  }, [selectedDate, setValue]);

  useEffect(() => {
    if (selectedTime) {
      setValue("time", selectedTime);
    }
  }, [selectedTime, setValue]);

  const getEventFormData = async () => {
    if (!event) return;
    try {  
      setLoading(true);
      const eventId = event.id;
      const result = await getEventData(eventId);
      console.log("result is", result.questions);
      setFirstLastName(result.addFirstLastName);
      console.log("firstLastName is", firstLastName);
      setAllowGuest(result.allowGuest);
      setRecord(result);
      setLocation(result.location);
      setJsonForm(result.questions);
      setSelectedTheme(result.theme);
      setSelectedBackground(result.background);
    } catch (error) {
      console.log("Error from getFormData", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (event) {
      getEventFormData();
      console.log("record host call type", event?.phoneDetails?.callType);
    }
  }, [event]);

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

  const handleNameInputChange = (e) => {
    setPersonName(e.target.value);
  };

  const handleFirstNameInputChange = (e) => {
setPersonFirstName(e.target.value)
  };

  const handleLastNameInputChange = (e) => {
    setPersonLastName(e.target.value)
  };

  const handleEmailInputChange = (e) => {
    setPersonEmail(e.target.value)
  }

  // ... existing code ...
  const onFormSubmit = async (e) => {
    e.preventDefault();
    console.log("guest emails are", guestEmails);
    if (!selectedDate || !selectedTime) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Date or time not selected",
        className: "text-left",
        position: "top-right",
      });
      return;
    }

    try {
      // Parse the selected time (e.g., "3:00 pm")
      const timeMatch = selectedTime.match(/(\d+):(\d+)\s*([ap]m)/i);
      if (!timeMatch) {
        throw new Error('Invalid time format');
      }

      const [_, hours, minutes, meridiem] = timeMatch;
      let hour = parseInt(hours);
      
      // Convert to 24-hour format
      if (meridiem.toLowerCase() === 'pm' && hour !== 12) {
        hour += 12;
      } else if (meridiem.toLowerCase() === 'am' && hour === 12) {
        hour = 0;
      }

      // Create the start time by combining date and time
      const startTime = new Date(selectedDate);
      startTime.setHours(hour);
      startTime.setMinutes(parseInt(minutes));
      startTime.setSeconds(0);
      startTime.setMilliseconds(0);

      // Calculate end time
      const endTime = new Date(startTime.getTime() + event.duration * 60000);

      const bookingData = {
        eventId: event.id,
        name: personName,
        firstName: personFirstName || null,
        lastName: personLastName || null,
        email: personEmail,
        customQAnswers: formData || null,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        addGuestEmails: guestEmails,
        timezone: selectedTimezone.value || null,
        location: selectedLocation || null,
        suggestedLocation: suggestedLocation || null,
        phoneNumber: phoneNumber || null,
      };

      setLoading(true);
      const response = await createBooking(bookingData);
      setResData(response);
      console.log("response is", response);
      if (response.success) {
        toast({
          title: "Success!",
          description: "You have booked it successfully!",
          className: "text-left",
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error: ${error.message}`,
        className: "text-left",
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  // const availableDays = availability.map((day) => new Date(day.date)); // This is the original code written by the developer
  const availableDays = availability.map((day) => {
    const utcDate = new Date(day.date);
    // Convert UTC to local date, ignoring time
    return new Date(
      utcDate.getUTCFullYear(),
      utcDate.getUTCMonth(),
      utcDate.getUTCDate()
    );
  });
  //   console.log("available days,", availableDays);

  if (resData) {
    console.log("event is", event?.confirmationPageText, event?.redirecturl);
    if (event?.confPageSelection === "redirecturl") {
      window.location.href = event?.redirecturl;
    }
    return (
      <div className="text-center p-10 border bg-white">
        {event?.confirmationPageText ? (
          <h2 className="text-2xl font-bold mb-4">{event?.confirmationPageText}</h2>
        ) : (
          <h2 className="text-2xl font-bold mb-4">Thanks for scheduling. Your event has been successfully scheduled.</h2>
        )}
        {/* {resData.meetLink && (
          <p>
            Join the meeting:{" "}
            <a
              href={resData.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {resData.meetLink}
            </a>
          </p>
        )} */}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-8 p-10 border" data-theme={selectedTheme} style={{ backgroundImage: selectedBackground }}>
      <div className="md:h-96 flex flex-col md:flex-row gap-5 ">
        <div className="w-full">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date);
              setSelectedTime(null); // Since he needs to select the  time after that
            }}
            disabled={[{ before: new Date() }]} // We disable all the dates before the current date as they can't book a date in the past
            modifiers={{
              available: availableDays,
            }} // These are the available dates that we can highlight
            modifiersStyles={{
              available: {
                background: "lightgreen",
                borderRadius: 100,
              },
            }}
          />

            <div className="w-full">
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Zone
          </label>
          <ReactSelect
            instanceId="timezone-select"
            value={selectedTimezone}
            onChange={(option) => {
              setSelectedTimezone(option);
              setSelectedTime(null);
            }}
            options={timezoneOptions}
            className="basic-single"
            classNamePrefix="select"
            isSearchable={true}
            placeholder="Search timezone..."
            formatOptionLabel={({ label }) => (
              <div>
                <span>{label}</span>
              </div>
            )}
          />
        </div>
      </div>
          
        </div>

        <div className="w-full h-full md:overflow-scroll no-scrollbar">
          {/* add hide scroll bar code */}
          {selectedDate && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">
                Available Time Slots
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {timeSlots?.map((slot) => {
                  return (
                    <Button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      variant={selectedTime === slot ? "default" : "outline"}
                    >
                      {slot}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      {selectedTime && (
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
        
              <label className="text-xs text-gray-500">
                Name<span className="text-red-500 text-sm">*</span>
              </label>
            </div>
            
          </div>

          {!firstLastName ? (
            <Input
              type="text"
              className="focus:outline-slate-300"
              placeholder="Enter your full name"
              name="name"
              required
              onChange={(e) => handleNameInputChange(e)}
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
                  onChange={(e) => handleFirstNameInputChange(e)}
                />
              </div>
              <div className="flex-1">
                <Input
                  type="text"
                  className="focus:outline-slate-300"
                  placeholder="Last name"
                  name="lastName"
                  required
                  onChange={(e) => handleLastNameInputChange(e)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Email Field */}
        <div className="my-3">
          <div className="flex items-center gap-2">
            
            <label className="text-xs text-gray-500">
              Email<span className="text-red-500 text-sm">*</span>
            </label>
          </div>
          <Input
            type="email"
            className="focus:outline-slate-300"
            placeholder="Enter your email"
            name="email"
            required
            onChange={(e) => handleEmailInputChange(e)}
          />
        </div>

        {allowGuest && (
          <div className="my-3">
            <Button
              type="button"
              variant="outline"
              className="mb-2"
              onClick={() => setGuestEmails([...guestEmails, ""])}
              disabled={guestEmails.length >= 10}
            >
              Add Guest
            </Button>
            {guestEmails.map((email, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  type="email"
                  className="focus:outline-slate-300"
                  placeholder="Enter guest email"
                  value={email}
                  onChange={(e) => {
                    const newEmails = [...guestEmails];
                    newEmails[index] = e.target.value;
                    setGuestEmails(newEmails);
                  }}
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    const newEmails = guestEmails.filter((_, i) => i !== index);
                    setGuestEmails(newEmails);
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          )}
                   {location?.length > 1 && (
            <div className="my-3">
              <label className="text-xs text-gray-500">
                Location<span className="text-red-500 text-sm">*</span>
              </label>
              <RadioGroup 
                required 
                onValueChange={(value) => {
                  setSelectedLocation(value);
                  if (value !== "ask-invitee") {
                    setSuggestedLocation(""); // Clear the input when selecting other options
                  }
                }}
                className="mt-2"
              >
                {location.map((loc, index) => (
                  <div key={index}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={loc} id={loc} />
                      <Label htmlFor={loc}>
                        {loc === "in-person" ? (
                          <p className="text-sm flex items-center gap-2"><span className="text-sm"> <Image src='/location-icons/location.png' alt="venue" width={20} height={20} /> </span> {record?.inPersonDetails.venue}</p>
                        ) : loc === "zoom" ? (
                          <p className="text-sm flex items-center gap-2"><span className="text-sm"> <Image src='/location-icons/zoom.svg' alt="zoom" width={20} height={20} /> </span>Zoom</p>
                        ) : loc === "google-meet" ? (
                          <p className="text-sm flex items-center gap-2"><span className="text-sm"> <Image src='/location-icons/google-meet.svg' alt="google-meet" width={20} height={20} /> </span>Google Meet</p> ): loc === "microsoft-teams" ? (
                          <p className="text-sm flex items-center gap-2"><span className="text-sm"> <Image src='/location-icons/ms-teams.svg' alt="microsoft-teams" width={20} height={20} /> </span>Microsoft Teams</p> ):  loc === "phone" ? (
                          <p className="text-sm flex items-center gap-2"><span className="text-sm"> <Image src='/location-icons/phone.svg' alt="phone" width={20} height={20} /> </span>Phone call</p> ): loc === "ask-invitee" ? (
                          <p className="text-sm flex items-center gap-2"><span className="text-sm"> <Image src='/location-icons/ask-invitee.png' alt="ask-invitee" width={20} height={20} /> </span>Somewhere else</p> ): loc}
                      </Label>
                    </div>
                    {/* Show input box when ask-invitee is selected */}
                    {loc === "phone" && selectedLocation === "phone" && event?.phoneDetails?.callType === "host-calls" && (
                      <div className="ml-6 mt-2">
                        <Input
                          type="text"
                          className="focus:outline-slate-300"
                          placeholder="Enter your phone number"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          required
                        />
                      </div>
                    )}
                    {loc === "phone" && selectedLocation === "phone" && event?.phoneDetails?.callType === "invitee-calls" && (
                      <div className="ml-6 mt-2 text-sm text-gray-500">
                      You will call the Host. Phone number will be emailed to you upon booking completion.
                      </div>
                    )}
                    {/* Show input box when ask-invitee is selected */}
                    {loc === "ask-invitee" && selectedLocation === "ask-invitee" && (
                      <div className="ml-6 mt-2">
                        <Input
                          type="text"
                          className="focus:outline-slate-300"
                          placeholder="Enter your preferred location"
                          value={suggestedLocation}
                          onChange={(e) => setSuggestedLocation(e.target.value)}
                          required
                        />
                      </div>
                    )}
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
          
   {location?.length === 1 && (location.includes("phone") && event?.phoneDetails?.callType === "host-calls" && (
    <div className="my-3">
      <label className="text-xs text-gray-500">
        Location
              </label>
              <div className="ml-6 mt-2">
                        <Input
                          type="text"
                          className="focus:outline-slate-300"
                          placeholder="Enter your preferred location"
                          value={suggestedLocation}
                          onChange={(e) => setSuggestedLocation(e.target.value)}
                          required
                        />
                      </div>
    </div>
   ))}
   {location?.length === 1 && (location.includes("ask-invitee") && (
    <div className="my-3">
      <label className="text-xs text-gray-500">
        Location
              </label>
              <div className="ml-6 mt-2">
                        <Input
                          type="text"
                          className="focus:outline-slate-300"
                          placeholder="Enter your phone number"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          required
                        />
                      </div>
    </div>
   ))}
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
              
            </div>
           
          </div>
        ))}
         {/* We made the button like this, and gave classname as per daisyUi so when we change the theme, the button color will change */}
        <button
          type="submit"
          className="btn text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium text-sm px-5 py-2.5 text-center me-2 mb-2 w-full rounded-full md:w-[200px] "
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Schedule Event"}
        </button>
      </form>
      )}
    
    </div>
  );
};

export default BookingForm;
