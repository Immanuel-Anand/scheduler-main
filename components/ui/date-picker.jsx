"use client"

import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../../components/ui/button"
import { DayPicker } from "react-day-picker"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

function CustomCaption(props) {
  const { displayMonth, onMonthChange } = props;
  const [showYearPicker, setShowYearPicker] = useState(false);
  
  // Generate years from 1900 to current year + 10
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear + 10 - 1900 }, (_, i) => 1900 + i);

  if (showYearPicker) {
    return (
      <div className="flex gap-1 justify-center items-center p-2">
        <div className="grid grid-cols-4 gap-1 max-h-[200px] overflow-y-auto">
          {years.map((year) => (
            <Button
              key={year}
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-12",
                year === displayMonth.getFullYear() && "bg-primary text-primary-foreground"
              )}
              onClick={() => {
                const newMonth = new Date(displayMonth);
                newMonth.setFullYear(year);
                onMonthChange(newMonth);
                setShowYearPicker(false);
              }}
            >
              {year}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-1 justify-center items-center">
      <Button
        variant="outline"
        className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          const prevMonth = new Date(displayMonth);
          prevMonth.setMonth(prevMonth.getMonth() - 1);
          onMonthChange(prevMonth);
        }}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => setShowYearPicker(true)}
        variant="ghost"
        className="text-sm font-medium"
      >
        {format(displayMonth, "MMMM yyyy")}
      </Button>
      <Button
        variant="outline"
        className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          const nextMonth = new Date(displayMonth);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          onMonthChange(nextMonth);
        }}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function DatePicker({ selected, onSelect, minDate, maxDate }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !selected && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={onSelect}
          fromDate={minDate}
          toDate={maxDate}
          initialFocus
          components={{
            Caption: CustomCaption
          }}
          className="rdp-nav_button"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex justify-between w-full",
            head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: cn(
              "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
              "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            ),
            day: cn(
              "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
              "hover:bg-accent hover:text-accent-foreground"
            ),
            day_range_end: "day-range-end",
            day_selected:
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50",
            day_range_middle:
              "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
          }}
        />
      </PopoverContent>
    </Popover>
  )
} 