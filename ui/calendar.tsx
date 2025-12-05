import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-gradient-to-br from-pink-100 to-blue-100 rounded-lg", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-base font-bold text-black",
        caption_dropdowns: "flex gap-2",
        dropdown_month: "text-black font-semibold bg-white rounded px-2 py-1",
        dropdown_year: "text-black font-semibold bg-white rounded px-2 py-1",
        dropdown: "text-black font-semibold bg-white rounded px-2 py-1",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-white/50 p-0 text-black hover:bg-white/80 border-black/20"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-black/80 rounded-md w-9 font-semibold text-sm",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-purple-500/30 [&:has([aria-selected])]:bg-purple-500/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-medium text-black hover:bg-white/50 hover:text-black aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-purple-500 text-white hover:bg-purple-600 hover:text-white focus:bg-purple-600 focus:text-white font-bold",
        day_today: "bg-cyan-400 text-black font-bold ring-2 ring-cyan-600",
        day_outside:
          "day-outside text-black/30 aria-selected:bg-purple-500/20 aria-selected:text-black/50",
        day_disabled: "text-black/20 opacity-40",
        day_range_middle:
          "aria-selected:bg-purple-500/20 aria-selected:text-black",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
