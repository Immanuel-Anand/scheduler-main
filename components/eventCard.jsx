"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "./ui/button";
import {
  CalendarCog,
  Copy,
  LinkIcon,
  Mail,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteEvent } from "../actions/events";
import { useToast } from "../hooks/use-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
// isPublic is true, we will show it on our profile, else we won't
const EventCard = ({ event, username, isPublic = false }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${process.env.NEXT_PUBLIC_APP_URL}/book/${username}/${event.id}`
      );
      setIsCopied(true);
      toast({
        title: "Copied!",
        description: "Event is copied successfully!.",
        className: "text-left",
        position: "top-right",
      });
      setTimeout(() => setIsCopied(false), 2000); // After 2 secs, it will set it to false
    } catch (error) {
      console.log("Failed to copy: ", error);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const delEvent = await deleteEvent(event.id);
      if (delEvent.success) {
        toast({
          title: "Deleted",
          description: "Event is deleted successfully!.",
          className: "text-left",
          position: "top-right",
        });
      }
      setLoading(false);
      router.refresh();
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
    setLoading(false);
  };

  const handleCardClick = (e) => {
    if (e.target.tagName !== "BUTTON" && e.target.tagName !== "SVG") {
      window?.open(
        `${process.env.NEXT_PUBLIC_APP_URL}book/${username}/${event.id}`,
        "_blank"
      );
    }
  };

  return (
    <Dialog>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Event</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this event?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-start flex">
          <Button onClick={handleDelete}>Yes</Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>

      <Card
        className="flex flex-col justify-between cursor-pointer"
        onClick={handleCardClick}
      >
        <CardHeader>
          <CardTitle className="text-2xl">{event.title}</CardTitle>
          <CardDescription className="flex justify-between">
            <span>
              {event.duration} mins | {event.isPrivate ? "Private" : "Public"}
            </span>
            <span>{event._count.bookings} Bookings</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* This will show the description until the first . */}
          {event.description.length > 100
            ? `${event.description.substring(0, 100)}...`
            : event.description}
          {/* <p>{event.description.substring(0, event.description.indexOf("."))}</p> */}
        </CardContent>
        {!isPublic && (
          <CardFooter className="flex flex-row flex-wrap gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={`/events?edit=true&eventId=${event.id}`}
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full gap-1" size="sm">
                      <Pencil className="h-4 w-4" />
                      <span>Edit</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Edit Event</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 flex-1"
                    onClick={() => router.push(`/${username}/${event.id}/edit-event`)}
                  >
                    <CalendarCog className="h-4 w-4" />
                    <span>Customize</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Customize Event</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 flex-1"
                    onClick={handleCopy}
                  >
                    <LinkIcon className="h-4 w-4" />
                    <span>Copy Link</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy Link</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={`/events/${event.id}/emails`} className="flex-1">
                    <Button variant="outline" className="w-full gap-1" size="sm">
                      <Mail className="h-4 w-4" />
                      <span>Emails</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Configure Emails</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-1 flex-1"
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Delete Event</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardFooter>
        )}
      </Card>
    </Dialog>
  );
};

export default EventCard;
