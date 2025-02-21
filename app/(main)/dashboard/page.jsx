"use client";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usernameSchema } from "../../../lib/validators";
import { useEffect, useState } from "react";
import axios from "axios";
import { BarLoader } from "react-spinners";
import { getLatestUpdates } from "../../../actions/dashboard";
import useFetch from "../../../hooks/use-fetch";
import { format } from "date-fns";

const Dashboard = () => {
  const { user } = useUser();
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(false)
  // We are combining react hook form with zod for validation
  const { register, handleSubmit, setValue, formState: {errors} } = useForm({
    resolver: zodResolver(usernameSchema),
  });

    useEffect(() => {
    const fetchUsername = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true)
        const { data } = await axios.get('/api/get-username');
        if (data.username) {
          setUsername(data.username);
          setValue("username", data.username); // Pre-fill the form
        }
        setLoading(false)
      } catch (error) {
        console.error("Error fetching username:", error.response?.data || error.message);
        setLoading(false)
      }setLoading(false)
    };

    fetchUsername();
    }, [user?.id, setValue]);
  
    const {
    loading: loadingUpdates,
    data: upcomingMeetings,
    fn: fnUpdates,
  } = useFetch(getLatestUpdates);

  useEffect(() => {
    (async () => await fnUpdates())();
  }, []);


  const onSubmit = async (data) => {
    try {
      setLoading(true)
      const response = await axios.put('/api/get-username', {
        username: data.username
      });
      setUsername(response.data.username);
      setLoading(false)
      // Add toast or notification here for success
    } catch (error) {
      console.error("Error updating username:", error.response?.data || error.message);
      // Add error handling/notification here
      setLoading(false)
    } setLoading(false)
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user?.firstName}</CardTitle>
        </CardHeader>
     <CardContent>
          {!loadingUpdates ? (
            <div className="space-y-6 font-light">
              <div>
                {upcomingMeetings && upcomingMeetings?.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {upcomingMeetings?.map((meeting) => (
                      <li key={meeting.id}>
                        {meeting.event.title} on{" "}
                        {format(
                          new Date(meeting.startTime),
                          "MMM d, yyyy h:mm a"
                        )}{" "}
                        with {meeting.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No upcoming meetings</p>
                )}
              </div>
            </div>
          ) : (
            <p>Loading updates...</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your unique link</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="">
              <div className="flex items-center gap-2">
                <span>
                  {/* This will take the origin url domain */}
                  {process.env.NEXT_PUBLIC_APP_URL}
                </span>
                {/* Inside register(we should enter the name of the field in usernameSchema which is 'username') */}
                <Input {...register("username")} placeholder="username" />
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>
            {loading && (
              <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />
            )}
            <Button type="submit">Update username</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
