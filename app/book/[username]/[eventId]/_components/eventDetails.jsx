'use client'
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../../components/ui/avatar";
import { Calendar, Clock, Phone, Video, Play } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../../components/ui/dialog";
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

const EventDetails = ({ event }) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  // We have given like this in the server compoennt in events.js in action folder include: {
  //     user: {
  //         select: {
  //             name: true,
  //             email: true,
  //             username: true,
  //             imageUrl: true,
  //         }
  //     }
  // }
  // So, we extracting the user from event object
  const { user } = event;

  // Function to get YouTube thumbnail
  const getYouTubeThumbnail = (url) => {
    if (!url) return null;
    const videoId = url.split('v=')[1]?.split('&')[0];
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  };

  // Function to get YouTube embed URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const videoId = url.split('v=')[1]?.split('&')[0];
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  };

  return (
    <div className="p-10 lg:w-1/3 bg-white" data-theme={event.theme} >
      <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
      <div className="flex items-center mb-4">
        <Avatar className="w-12 h-12 mr-4">
          <AvatarImage src={user.imageUrl} alt={user.name} />
          {/* We are showing only the initial if userimage is not avaialble so we put charAt(0) */}
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="">
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-gray-600">@{user.username}</p>
        </div>
      </div>
      <div className="flex items-center mb-2">
        <Clock className="mr-2" />
        <span>{event.duration} minutes</span>
      </div>
         {event?.location?.length === 1 && (event?.location.includes("in-person") && (
    <div className="my-3">

              <p className="flex items-center gap-2"><span className="text-sm"> <MapPin /></span> {event?.inPersonDetails.venue}</p>
    </div>
      ))}
      {event?.location?.length === 1 && (event?.location.includes("zoom" || "google-meet" || "microsoft-teams") && (
        <div className="my-3">
   
        <p className="flex items-center gap-2"><span className="text-sm"> <Video /></span> Web conferencing details will be emailed upon confirmation.</p>
        </div>
      ))}
      {event?.location?.length === 1 && (event?.location.includes("phone") && event?.phoneDetails?.callType === "invitee-calls" && (
        <div className="my-3">
     
          <p className="flex items-center gap-2"><span className="text-sm"> <Phone /></span> You will call the Host. Phone number will be emailed to you upon booking completion.</p>
        </div>
        ))}
      {event?.location?.length === 1 && (event?.location.includes("phone") && event?.phoneDetails?.callType === "host-calls" && (
        <div className="my-3">
   
          <p className="flex items-center gap-2"><span className="text-sm"> <Phone /></span> Phone call</p>
        </div>
      ))}

      <p className="text-gray-700">{event.description}</p>

      {event.introVideoLink && (
        <>
          <div 
            className="relative mt-4 w-[250px] h-[250px] cursor-pointer group"
            onClick={() => setIsVideoOpen(true)}
          >
            <img 
              src={getYouTubeThumbnail(event.introVideoLink)} 
              alt="Video thumbnail"
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg group-hover:opacity-100 transition-opacity">
              <Play className="w-12 h-12 text-white" />
            </div>
          </div>

          <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
            <DialogContent className="sm:max-w-[800px] p-0">
              <DialogHeader>
                <VisuallyHidden.Root>
                  <DialogTitle>Event Introduction Video</DialogTitle>
                </VisuallyHidden.Root>
              </DialogHeader>
              <div className="aspect-video w-full">
                <iframe
                  width="100%"
                  height="100%"
                  src={getYouTubeEmbedUrl(event.introVideoLink)}
                  title="Video preview"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default EventDetails;
