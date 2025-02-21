"use client";

import { Button } from "../components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../components/ui/drawer";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import EditEventForm from "./editEventForm";

const EditEventDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const edit = searchParams.get("edit");
    const eventId = searchParams.get("eventId");
    if (edit === "true" && eventId) {
      setIsOpen(true);
    }
  }, [searchParams]);

  const handleClose = () => {
    setIsOpen(false);
    if (searchParams.get("edit") === "true") {
      router.replace(window?.location?.pathname);
    }
  };

  return (
    <Drawer open={isOpen} onClose={handleClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit event</DrawerTitle>
        </DrawerHeader>
        <EditEventForm
          eventId={searchParams.get("eventId")}
          onSubmitForm={() => {
            handleClose();
          }}
          onClose={() => setIsOpen(false)}
        />
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default EditEventDrawer;
