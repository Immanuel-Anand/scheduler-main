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
import EventForm from "./eventForm";

const CreateEventDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    // Because we are adding ?create=true in params like this when we click 'create event' in header.jsx component http://localhost:3000/events?create=true . So, this popup should open only when we click create event button
    const create = searchParams.get("create");
    if (create === "true") {
      setIsOpen(true);
    }
  }, [searchParams]);
  const handleClose = () => {
    setIsOpen(false);
    // We need to remove the create=true from the params as well, so, this won't pop up again
    if (searchParams.get("create") === "true") {
      router.replace(window?.location?.pathname);
    }
  };
  return (
    <Drawer open={isOpen} onClose={handleClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create new event</DrawerTitle>
        </DrawerHeader>
        <EventForm
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

export default CreateEventDrawer;
