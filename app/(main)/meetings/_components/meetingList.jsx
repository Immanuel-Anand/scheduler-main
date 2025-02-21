"use client";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CancelMeetingButton from "./cancelMeeting";
import { Button } from "../../../../components/ui/button";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import ReactSelect from "react-select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { DatePicker } from "@/components/ui/date-picker";
import { addDays } from "date-fns";

// Format timezone names
const formatTimezoneName = (tz) => {
  const timeZoneNames = {
    // North America
    "America/Los_Angeles": "Pacific Time - US/Canada",
    "America/Vancouver": "Pacific Time - Canada",
    "America/Denver": "Mountain Time - US & Canada",
    "America/Phoenix": "Mountain Time - Arizona",
    "America/Chicago": "Central Time - US/Canada",
    "America/Mexico_City": "Central Time - Mexico",
    "America/New_York": "Eastern Time - US/Canada",
    "America/Toronto": "Eastern Time - Canada",
    "America/Halifax": "Atlantic Time - Canada",
    "America/St_Johns": "Newfoundland Time - Canada",
    "America/Anchorage": "Alaska Time",
    "Pacific/Honolulu": "Hawaii Time",

    // South America
    "America/Sao_Paulo": "São Paulo Time - Brazil",
    "America/Buenos_Aires": "Buenos Aires Time - Argentina",
    "America/Santiago": "Santiago Time - Chile",
    "America/Lima": "Lima Time - Peru",
    "America/Bogota": "Bogota Time - Colombia",

    // Europe
    "Europe/London": "London Time - UK",
    "Europe/Dublin": "Dublin Time - Ireland",
    "Europe/Paris": "Paris Time - France",
    "Europe/Berlin": "Berlin Time - Germany",
    "Europe/Rome": "Rome Time - Italy",
    "Europe/Madrid": "Madrid Time - Spain",
    "Europe/Amsterdam": "Amsterdam Time - Netherlands",
    "Europe/Brussels": "Brussels Time - Belgium",
    "Europe/Stockholm": "Stockholm Time - Sweden",
    "Europe/Oslo": "Oslo Time - Norway",
    "Europe/Copenhagen": "Copenhagen Time - Denmark",
    "Europe/Helsinki": "Helsinki Time - Finland",
    "Europe/Warsaw": "Warsaw Time - Poland",
    "Europe/Prague": "Prague Time - Czech Republic",
    "Europe/Vienna": "Vienna Time - Austria",
    "Europe/Budapest": "Budapest Time - Hungary",
    "Europe/Zurich": "Zurich Time - Switzerland",

    // Asia
    "Asia/Dubai": "Dubai Time - UAE",
    "Asia/Riyadh": "Riyadh Time - Saudi Arabia",
    "Asia/Jerusalem": "Jerusalem Time - Israel",
    "Asia/Istanbul": "Istanbul Time - Turkey",
    "Asia/Moscow": "Moscow Time - Russia",
    "Asia/Kolkata": "India Time",
    "Asia/Calcutta": "India Time",
    "Asia/Dhaka": "Dhaka Time - Bangladesh",
    "Asia/Bangkok": "Bangkok Time - Thailand",
    "Asia/Singapore": "Singapore Time",
    "Asia/Hong_Kong": "Hong Kong Time",
    "Asia/Shanghai": "China Time",
    "Asia/Seoul": "Seoul Time - Korea",
    "Asia/Tokyo": "Tokyo Time - Japan",
    "Asia/Manila": "Manila Time - Philippines",

    // Oceania
    "Australia/Sydney": "Sydney Time - Australia",
    "Australia/Melbourne": "Melbourne Time - Australia",
    "Australia/Brisbane": "Brisbane Time - Australia",
    "Australia/Adelaide": "Adelaide Time - Australia",
    "Australia/Perth": "Perth Time - Australia",
    "Pacific/Auckland": "Auckland Time - New Zealand",

    // Africa
    "Africa/Cairo": "Cairo Time - Egypt",
    "Africa/Johannesburg": "Johannesburg Time - South Africa",
    "Africa/Nairobi": "Nairobi Time - Kenya",
    "Africa/Lagos": "Lagos Time - Nigeria",
    "Africa/Casablanca": "Casablanca Time - Morocco",
  };
  return timeZoneNames[tz] || tz.replace(/_/g, " ").split("/").pop();
};

export default function MeetingList({ meetings, type }) {
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState(() => {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return {
      value: userTimeZone,
      label: `${formatTimezoneName(userTimeZone)}    ${new Intl.DateTimeFormat(
        "en-US",
        {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
          timeZone: userTimeZone,
        }
      )
        .format(new Date())
        .toLowerCase()}`,
    };
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const meetingsPerPage = 20;

  // Add these state variables in the MeetingList component
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [filteredMeetings, setFilteredMeetings] = useState(meetings);

  // Get current meetings
  const indexOfLastMeeting = currentPage * meetingsPerPage;
  const indexOfFirstMeeting = indexOfLastMeeting - meetingsPerPage;
  const currentMeetings = filteredMeetings.slice(
    indexOfFirstMeeting,
    indexOfLastMeeting
  );
  const totalPages = Math.ceil(filteredMeetings.length / meetingsPerPage);

  // Change page
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); // Scroll to top when page changes
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Show max 5 page numbers at a time

    if (totalPages <= maxPagesToShow) {
      // If total pages are less than max, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show pages around current page
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

      // Adjust if we're near the end
      if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }

      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) pageNumbers.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  // Generate timezone options
  const timezoneOptions = Intl.supportedValuesOf("timeZone")
    .filter(
      (tz) => formatTimezoneName(tz) !== tz.replace(/_/g, " ").split("/").pop()
    )
    .map((tz) => {
      const now = new Date();
      const timeInZone = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        timeZone: tz,
      })
        .format(now)
        .toLowerCase();

      return {
        value: tz,
        label: `${formatTimezoneName(tz)}    ${timeInZone}`,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  // Convert time to selected timezone
  const convertToTimezone = (date, timezone) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      timeZone: timezone,
    })
      .format(new Date(date))
      .toLowerCase();
  };

  const formatTime = (startTime, endTime) => {
    const start = convertToTimezone(startTime, selectedTimezone.value);
    const end = convertToTimezone(endTime, selectedTimezone.value);
    return `${start} - ${end}`;
  };

  // Update timezone labels periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setSelectedTimezone((prev) => ({
        value: prev.value,
        label: `${formatTimezoneName(prev.value)}    ${new Intl.DateTimeFormat(
          "en-US",
          {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
            timeZone: prev.value,
          }
        )
          .format(now)
          .toLowerCase()}`,
      }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Add this function in the MeetingList component
  const handleDateFilter = () => {
    if (!dateRange.start || !dateRange.end) return;

    const filtered = meetings.filter((meeting) => {
      const meetingDate = new Date(meeting.startTime);
      return (
        meetingDate >= dateRange.start &&
        meetingDate <= addDays(dateRange.end, 1)
      );
    });

    setFilteredMeetings(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  if (meetings.length === 0) {
    return <p>No {type} meetings found.</p>;
  }

  const formatDate = (date) => {
    return format(new Date(date), "EEEE, MMMM d, yyyy");
  };

  return (
    <div className="space-y-6">
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Time Zone{" "}
          <p className="text-xs text-gray-500">
            This will be used to display the time of the meeting in your
            timezone
          </p>
        </label>
        <div className="xl:flex items-center xl:justify-between lg:my-2 gap-2">
          <ReactSelect
            instanceId="timezone-select"
            value={selectedTimezone}
            onChange={setSelectedTimezone}
            options={timezoneOptions}
            className="basic-single"
            classNamePrefix="select"
            isSearchable={true}
            placeholder="Search timezone..."
          />
         
          <div className="text-sm text-muted-foreground">
            {dateRange.start && dateRange.end ? (
              <>Filtered meetings: {filteredMeetings.length} / {meetings.length} total</>
            ) : (
              <>Total {type} meetings: {meetings.length}</>
            )}
          </div>
        </div>
         <div className="flex flex-col lg:flex-row gap-2 items-end">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Start Date
              </label>
              <DatePicker
                selected={dateRange.start}
                onSelect={(date) =>
                  setDateRange((prev) => ({ ...prev, start: date }))
                }
                maxDate={dateRange.end || undefined}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">End Date</label>
              <DatePicker
                selected={dateRange.end}
                onSelect={(date) =>
                  setDateRange((prev) => ({ ...prev, end: date }))
                }
                minDate={dateRange.start || undefined}
              />
            </div>
            <Button
              onClick={handleDateFilter}
              disabled={!dateRange.start || !dateRange.end}
            >
              Apply Filter
            </Button>
            {dateRange.start && dateRange.end && (
              <Button
                variant="ghost"
                onClick={() => {
                  setDateRange({ start: null, end: null });
                  setFilteredMeetings(meetings);
                }}
              >
                Clear
              </Button>
            )}
          </div>
      </div>
      <div className="flex flex-col gap-4 w-full">
        {currentMeetings.map((meeting) => (
          <Card key={meeting.id} className="w-full">
            <div className="flex justify-between items-center p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {meeting.event.title[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">
                    {meeting.name} with you on {formatDate(meeting.startTime)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {meeting.event.title}, Event type {meeting.event.duration}
                    -minute meeting
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatTime(meeting.startTime, meeting.endTime)}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedMeeting(meeting);
                  setShowDetails(true);
                }}
              >
                Details
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="my-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />
            </PaginationItem>

            {getPageNumbers().map((pageNum, index) => (
              <PaginationItem key={index}>
                {pageNum === "..." ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    onClick={() => handlePageChange(pageNum)}
                    isActive={currentPage === pageNum}
                  >
                    {pageNum}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Meeting Details</DialogTitle>
          </DialogHeader>
          {selectedMeeting && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Invitee</h3>
                <p>{selectedMeeting.name}</p>
                <p>{selectedMeeting.email}</p>
              </div>

              <div>
                <h3 className="font-medium">Date & Time</h3>
                <p>{formatDate(selectedMeeting.startTime)}</p>
                <p>
                  {formatTime(
                    selectedMeeting.startTime,
                    selectedMeeting.endTime
                  )}
                </p>
              </div>

              {selectedMeeting.location && (
                <div>
                  <h3 className="font-medium">Location</h3>
                  <p>{selectedMeeting.location}</p>
                </div>
              )}

              {selectedMeeting.customQAnswers && (
                <div>
                  <h3 className="font-medium">Additional Information</h3>
                  <p>{selectedMeeting.customQAnswers}</p>
                </div>
              )}

              {type === "upcoming" && (
                <div className="pt-4">
                  <CancelMeetingButton meetingId={selectedMeeting.id} />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
