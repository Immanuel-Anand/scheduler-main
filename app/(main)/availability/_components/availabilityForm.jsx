'use client'
import { Checkbox } from '../../../../components/ui/checkbox'
import { availabilitySchema } from '../../../../lib/validators'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { timeSlots } from '../data'
import { Input } from '../../../../components/ui/input'
import { Button } from '../../../../components/ui/button'
import { updateAvailability } from '../../../../actions/availability'
import { useToast } from '../../../../hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../../../../components/ui/dialog"
import { format } from 'date-fns'
import { timeZones } from "../../../../lib/timeZones"
import { DatePicker } from "../../../../components/ui/date-picker"
import { Label } from "../../../../components/ui/label"
import { createSchedule, getScheduleAvailability, assignScheduleToEvents } from "../../../../actions/schedule"
import { ScrollArea } from "../../../../components/ui/scroll-area"
import { Card, CardContent } from "../../../../components/ui/card"
import { ChevronDown, ChevronUp } from "lucide-react"

const AvailabilityForm = ({ initialData, schedules = [], events = [] }) => {
  const [selectedDate, setSelectedDate] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedTimezone, setSelectedTimezone] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone
    } catch (error) {
      return 'UTC'
    }
  })
  const { toast } = useToast()
  const [holidayName, setHolidayName] = useState('')
  const [isCreateScheduleOpen, setIsCreateScheduleOpen] = useState(false)
  const [newScheduleName, setNewScheduleName] = useState('')
  const [selectedSchedule, setSelectedSchedule] = useState(initialData?.scheduleId || '')
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false)
  const [selectedEvents, setSelectedEvents] = useState([])
  const [isAssigning, setIsAssigning] = useState(false)
  const [isEventListOpen, setIsEventListOpen] = useState(false)

  // Set default values for the form
  const defaultValues = {
    monday: { isAvailable: false, startTime: "09:00", endTime: "17:00" },
    tuesday: { isAvailable: false, startTime: "09:00", endTime: "17:00" },
    wednesday: { isAvailable: false, startTime: "09:00", endTime: "17:00" },
    thursday: { isAvailable: false, startTime: "09:00", endTime: "17:00" },
    friday: { isAvailable: false, startTime: "09:00", endTime: "17:00" },
    saturday: { isAvailable: false, startTime: "09:00", endTime: "17:00" },
    sunday: { isAvailable: false, startTime: "09:00", endTime: "17:00" },
    timeGap: 0,
    dateOverrides: {},
    holidays: {},
    ...initialData // Spread initialData after default values
  }

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(availabilitySchema),
    defaultValues
  })

  // Helper function to add a holiday
  const handleAddHoliday = (date) => {
    if (!date) return;
    
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const currentHolidays = watch('holidays') || {}
      
      // Update the form data with the new holiday
      setValue('holidays', {
        ...currentHolidays,
        [dateStr]: {
          name: holidayName // Use the holidayName state
        }
      }, { shouldValidate: true })
      
      setSelectedDate(null)
      setHolidayName('') // Reset holiday name
      setIsHolidayDialogOpen(false)
      
      toast({
        title: "Holiday Added",
        description: `Added holiday for ${format(date, 'MMMM d, yyyy')}${holidayName ? `: ${holidayName}` : ''}`,
      })
    } catch (error) {
      console.error("Error adding holiday:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add holiday",
      })
    }
  }

  const onSubmit = async (formData) => {
    try {
        setLoading(true)
        
        console.log("Form data before submission:", formData)
        console.log("Holidays before submission:", formData.holidays)
        
        // Prepare the data object
        const data = {
            ...formData,
            timeGap: Number(formData.timeGap),
            dateOverrides: formData.dateOverrides || {},
            holidays: formData.holidays || {}
        }
        
        console.log("Data being sent to server:", data)
        
        const response = await updateAvailability(data)
        
        if (response.success) {
            toast({
                title: "Success",
                description: "Availability updated successfully",
            })
        }
    } catch (error) {
        console.error("Form submission error:", error)
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Failed to update availability",
        })
    } finally {
        setLoading(false)
    }
  }

  // Update the create schedule button onClick handler
  const handleCreateSchedule = async () => {
    try {
      setIsCreatingSchedule(true)
      const result = await createSchedule(newScheduleName)

      if (!result.success) {
        throw new Error(result.error)
      }

      setSelectedSchedule(result.data.id)
      setNewScheduleName('')
      setIsCreateScheduleOpen(false)
      toast({
        title: "Success",
        description: "Schedule created successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create schedule",
      })
    } finally {
      setIsCreatingSchedule(false)
    }
  }

  // Add a handler for schedule selection
  const handleScheduleChange = async (scheduleId) => {
    try {
      setSelectedSchedule(scheduleId)
      const result = await getScheduleAvailability(scheduleId)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      // Update form with the selected schedule's availability
      if (result.data) {
        // Reset form with new data
        reset(result.data)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load schedule availability",
      })
    }
  }

  const handleAssignSchedule = async () => {
    if (!selectedSchedule || selectedEvents.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select both a schedule and at least one event",
      })
      return
    }

    try {
      setIsAssigning(true)
      const result = await assignScheduleToEvents({
        scheduleId: selectedSchedule,
        eventIds: selectedEvents
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      setSelectedEvents([])
      toast({
        title: "Success",
        description: "Schedule assigned to selected events",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to assign schedule",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid gap-6">
        {/* Schedule Selection and Creation */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Select
                value={selectedSchedule}
                onValueChange={handleScheduleChange}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select schedule" />
                </SelectTrigger>
                <SelectContent>
                  {schedules.map((schedule) => (
                    <SelectItem key={schedule.id} value={schedule.id}>
                      {schedule.name} {schedule.isDefault && "(Default)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Dialog open={isCreateScheduleOpen} onOpenChange={setIsCreateScheduleOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">
                    Create Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Schedule</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Schedule Name</Label>
                      <Input
                        id="name"
                        value={newScheduleName}
                        onChange={(e) => setNewScheduleName(e.target.value)}
                        placeholder="e.g., Summer Hours, Regular Schedule"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateScheduleOpen(false)
                        setNewScheduleName('')
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      disabled={!newScheduleName || isCreatingSchedule}
                      onClick={async () => {
                        try {
                          setIsCreatingSchedule(true)
                          const result = await createSchedule({
                            name: newScheduleName
                          })

                          if (!result.success) {
                            throw new Error(result.error)
                          }

                          setSelectedSchedule(result.data.id)
                          setNewScheduleName('')
                          setIsCreateScheduleOpen(false)
                          toast({
                            title: "Success",
                            description: "Schedule created successfully",
                          })
                        } catch (error) {
                          toast({
                            variant: "destructive",
                            title: "Error",
                            description: error.message || "Failed to create schedule",
                          })
                        } finally {
                          setIsCreatingSchedule(false)
                        }
                      }}
                    >
                      {isCreatingSchedule ? "Creating..." : "Create Schedule"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Event Selection */}
        {events.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsEventListOpen(!isEventListOpen)}
              >
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-medium">Assign Schedule to Events</h3>
                  <span className="text-sm text-muted-foreground">
                    ({selectedEvents.length} selected)
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    disabled={!selectedSchedule || selectedEvents.length === 0 || isAssigning}
                    onClick={(e) => {
                      e.stopPropagation() // Prevent collapse when clicking button
                      handleAssignSchedule()
                    }}
                  >
                    {isAssigning ? "Assigning..." : "Assign Schedule"}
                  </Button>
                  {isEventListOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {isEventListOpen && (
                <div className="mt-4">
                  <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                    <div className="space-y-4">
                      {events.map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-2 hover:bg-accent rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={event.id}
                              checked={selectedEvents.includes(event.id)}
                              onCheckedChange={(checked) => {
                                setSelectedEvents(prev => 
                                  checked 
                                    ? [...prev, event.id]
                                    : prev.filter(id => id !== event.id)
                                )
                              }}
                            />
                            <label
                              htmlFor={event.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {event.title}
                            </label>
                          </div>
                          {event.scheduleId && (
                            <span className="text-sm text-muted-foreground">
                              {schedules.find(s => s.id === event.scheduleId)?.name || 'Unknown Schedule'}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Timezone</label>
        <Select
          value={selectedTimezone}
          onValueChange={setSelectedTimezone}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            {timeZones.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {[
         "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ].map((day) => {
const isAvailable = watch(`${day}.isAvailable`) // we are monitoring this field, if this is selected, this will be true
        return (
          <div key={day} className="flex items-center space-x-4 mb-4">
             {/* Controller is for supporting the third-party component where register is not supported */}
            <Controller name={`${day}.isAvailable`}
              control={control} render={({ field }) => {
                return (
                  <Checkbox checked={field.value} onCheckedChange={(checked) => {
                  setValue(`${day}.isAvailable`, checked)
                  // If the user checked and not gave any value, we need to enter default times
                  if (!checked) {
                    setValue(`${day}.startTime`, "09:00");
                    setValue(`${day}.endTime`, "17:00")
                  }
                  }}
                  />
                )
            }}
            />
            {/* This is to make the first letter capital. We could have used "Capitalize" from the tailwind class too */}
            <span className='w-24'>{day.charAt(0).toUpperCase() + day.slice(1)}</span>
            {isAvailable && (
              <>
              <Controller name={`${day}.startTime`}
              control={control} render={({ field }) => {
                return (
                  <Select onValueChange={field.onChange} value={field.value}>
  <SelectTrigger className="w-32">
    <SelectValue placeholder="Start Time" />
  </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(time => {

   return <SelectItem key={time} value={time}>{time}</SelectItem>
                      })}

  </SelectContent>
</Select>

                )
            }}
                />
                <span>to</span>
             <Controller name={`${day}.endTime`}
              control={control} render={({ field }) => {
                return (
              <Select onValueChange={field.onChange} value={field.value}>
  <SelectTrigger className="w-32">
    <SelectValue placeholder="End Time" />
  </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(time => {

   return <SelectItem key={time} value={time}>{time}</SelectItem>
                      })}

  </SelectContent>
</Select>

                )
            }}
                />
                {/* Errors can only happen on endTime as the end time has to be greater than the start time */}
                {errors[day]?.endTime && (
                  <span className='text-red-500 text-sm ml-2'>
                    {errors[day].endTime.message}
                  </span>
                )}
              </>
            )}
          </div>
        )
      })}
      <div className="flex items-center space-x-4">
        <span className='w-48'>Minimum gap before booking (minutes):</span>
        <Input type="number"
          {...register("timeGap", {
        valueAsNumber: true
          })}
          className='w-32'
        />
        {errors?.timeGap && (
                  <span className='text-red-500 text-sm ml-2'>
                    {errors.timeGap.message}
                  </span>
                )}
      </div>
      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Date-Specific Hours</h3>
         <p className="text-sm text-muted-foreground mb-4">Change the hours for specific dates</p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline">Add Date-Specific Hours</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Select Date to Override</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <DatePicker
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date)
                  if (date) {
                    const dateStr = format(date, 'yyyy-MM-dd')
                    if (!watch(`dateOverrides.${dateStr}`)) {
                      setValue(`dateOverrides.${dateStr}`, {
                        isAvailable: true,
                        startTime: "09:00",
                        endTime: "17:00"
                      })
                    }
                  }
                }}
              />
              
              {selectedDate && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Controller
                      name={`dateOverrides.${format(selectedDate, 'yyyy-MM-dd')}.isAvailable`}
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            setValue(`dateOverrides.${format(selectedDate, 'yyyy-MM-dd')}.isAvailable`, checked)
                          }}
                        />
                      )}
                    />
                    <span>{format(selectedDate, 'MMMM d, yyyy')}</span>
                  </div>
                  
                  {watch(`dateOverrides.${format(selectedDate, 'yyyy-MM-dd')}.isAvailable`) && (
                    <div className="flex items-center space-x-4">
                      <Controller
                        name={`dateOverrides.${format(selectedDate, 'yyyy-MM-dd')}.startTime`}
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Start Time" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map(time => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <span>to</span>
                      <Controller
                        name={`dateOverrides.${format(selectedDate, 'yyyy-MM-dd')}.endTime`}
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="End Time" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map(time => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Display existing overrides */}
        <div className="mt-4 space-y-2">
          {Object.entries(watch('dateOverrides') || {}).map(([date, override]) => (
            <div key={date} className="flex items-center space-x-4">
              <span>{format(new Date(date), 'MMMM d, yyyy')}:</span>
              {override.isAvailable ? (
                <span>{override.startTime} - {override.endTime}</span>
              ) : (
                <span className="text-muted-foreground">Unavailable</span>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newOverrides = { ...watch('dateOverrides') }
                  delete newOverrides[date]
                  setValue('dateOverrides', newOverrides)
                }}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Holidays Section */}
      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Holidays</h3>
        <p className="text-sm text-muted-foreground mb-4">Mark dates when you're unavailable for meetings</p>
        
        <Dialog open={isHolidayDialogOpen} onOpenChange={setIsHolidayDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline">Add Holiday</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Holiday</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <DatePicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
              />
              
              {selectedDate && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Selected Date:</span>
                    <span className="text-sm text-muted-foreground">
                      {format(selectedDate, 'MMMM d, yyyy')}
                    </span>
                  </div>
                  <Input
                    placeholder="Holiday name (optional)"
                    value={holidayName}
                    onChange={(e) => setHolidayName(e.target.value)}
                  />
                  <Button 
                    onClick={() => handleAddHoliday(selectedDate)}
                    className="w-full"
                  >
                    Apply Holiday
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Display existing holidays */}
        <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
                Current Holidays: {Object.keys(watch('holidays') || {}).length}
            </div>
            {Object.entries(watch('holidays') || {}).map(([date, holiday]) => (
                <div key={date} className="flex items-center justify-between">
                    <span>{format(new Date(date), 'MMMM d, yyyy')}</span>
                    <span className="text-sm text-muted-foreground">
                        {holiday.name || 'No name'}
                    </span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            const newHolidays = { ...watch('holidays') }
                            delete newHolidays[date]
                            setValue('holidays', newHolidays, { 
                                shouldValidate: true,
                                shouldDirty: true
                            })
                            console.log("Holidays after removal:", watch('holidays'))
                        }}
                    >
                        Remove
                    </Button>
                </div>
            ))}
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Updating..." : "Update Availability"}
      </Button>
    </form>
  )
}

export default AvailabilityForm