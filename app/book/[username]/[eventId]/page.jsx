import { getEventAvailability, getEventDetails } from "../../../../actions/events";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import EventDetails from "./_components/eventDetails";
import BookingForm from "./_components/bookingForm";

//Meta data for seo purposes
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const username = resolvedParams.username;
  const eventId = resolvedParams.eventId;
  const event = await getEventDetails(username, eventId);

  if (!event) {
    return {
      title: "Event Not Found",
    };
  }

  return {
    title: `Book ${event.title} with ${event.user.name} | PepoScheduler`,
    description: `Schedule a ${event.duration}-minute ${event.title} event with ${event.user.name}`,
  };
}

//Since it is inside [] This will be displayed whatever you put after this 3000: http://localhost:3000/dtfgsdfg.
// We can use this params and match it against the username and display the data for that particular user
const EventPage = async ({ params }) => {
  const resolvedParams = await params;
  const username = resolvedParams.username;
  const eventId = resolvedParams.eventId;

  console.log("username from params", username); // This will give us the username since we put [username] as folder. we can extract it like this from the address bar
  const event = await getEventDetails(username, eventId); // Since we didn't use 'use client' we can directly get the server side code here
  const availability = await getEventAvailability(eventId);
  // console.log('availability', availability)
  if (!event) {
    notFound(); // IF we don't write this code, even if there is no username exist on the address bar like this http://localhost:3000/dtfgsdfg, you will still get the user page. But, with this code, we can display the 404 page for a page like this: http://localhost:3000/dtfgsdfg
  }
  return (
    <div className="flex flex-col justify-center lg:flex-row px-4 py-8">
      <EventDetails event={event} />
      <Suspense fallback={<div>Loading booking form...</div>}>
        <BookingForm event={event} availability={availability} />
      </Suspense>
    </div>
  );
};

export default EventPage;
