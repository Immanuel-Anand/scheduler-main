import { getUserByUsername } from "../../../actions/users";
import { notFound } from "next/navigation";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import EventCard from "../../../components/eventCard"

//Meta data for seo purposes
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const username = resolvedParams.username;
  const user = await getUserByUsername(username);

  if (!user) {
    return {
      title: "User Not Found",
    };
  }

  return {
    title: `${user.name}'s Profile | PepoScheduler`,
    description: `Book an event with ${user.name}. View available public events and schedules.`,
  };
}

//Since it is inside [] This will be displayed whatever you put after this 3000: http://localhost:3000/dtfgsdfg.
// We can use this params and match it against the username and display the data for that particular user
const UserPage = async ({ params }) => {
  const resolvedParams = await params;
  const username = resolvedParams.username;
  console.log("username from params", username); // This will give us the username since we put [username] as folder. we can extract it like this from the address bar
  const user = await getUserByUsername(username); // Since we didn't use 'use client' we can directly get the server side code here
  if (!user) {
    notFound(); // IF we don't write this code, even if there is no username exist on the address bar like this http://localhost:3000/dtfgsdfg, you will still get the user page. But, with this code, we can display the 404 page for a page like this: http://localhost:3000/dtfgsdfg
  }
  return (
    <div className="container mx-auto px-4 py-8" suppressHydrationWarning>
      <div className="flex flex-col items-center mb-8" suppressHydrationWarning>
        <Avatar className="w-24 h-24 mb-4">
          <AvatarImage src={user.imageUrl} alt={user.name} />
          {/* We are showing only the initial if userimage is not avaialble so we put charAt(0) */}
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
        <p className="text-gray-600 text-center">
          Welcome to my scheduling page. Please select an event below to book a
          call with me.
        </p>
      </div>
      {user.events?.length === 0 ? (
        <p className="text-center text-gray-600">No public events available.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {user.events?.map((event) => {
            return (
              <EventCard
                key={event.id}
                event={event}
                username={username}
                isPublic
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserPage;
