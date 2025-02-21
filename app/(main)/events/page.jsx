import { getUserEvents } from "../../../actions/events";
import EventCard from "../../../components/eventCard";
import React, { Suspense } from "react";
import EditEventDrawer from "../../../components/edit-event"; 

export default function EventsPage() {
  return (
    // Events may not be available, so we need a fall back ui. So, we put them here.
    <Suspense fallback={<div>Loading Events...</div>}>
      <Events />
    </Suspense>
  );
}

const Events = async () => {
  const { events, username } = await getUserEvents(); // These are server rendered components, so, it is fine to render it like this
  if (events.length === 0) {
    return <p>You haven&apos;t created any events yet</p>;
  }
  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} username={username} />
      ))}
       <EditEventDrawer />
    </div>
  );
};
