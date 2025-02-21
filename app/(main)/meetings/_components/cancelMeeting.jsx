"use client";

import { Button } from "../../../../components/ui/button";
import { cancelMeeting } from "../../../../actions/meetings";
import { useRouter } from "next/navigation";
import { useToast } from "../../../../hooks/use-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export default function CancelMeetingButton({ meetingId }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
    
    const handleCancel = async () => {
    try {
      setLoading(true);
      const delEvent = await cancelMeeting(meetingId);
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
      toast({
        title: "Error",
        variant: "destructive",
        description: "Error deleting event.",
        className: "text-left",
        position: "top-right",
      });
    }
    setLoading(false);
  };

    return (
      <Dialog>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Meeting</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this meeting?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-start flex">
          <Button onClick={handleCancel}>Yes</Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Do Not Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
            <div className="flex flex-col gap-1">
                    <DialogTrigger asChild>
      <Button variant="destructive" onClick={handleCancel} disabled={loading}>
        {loading ? "Canceling..." : "Cancel Meeting"}
                    </Button>
                    </DialogTrigger>
            </div>
                </Dialog>
  );
}
