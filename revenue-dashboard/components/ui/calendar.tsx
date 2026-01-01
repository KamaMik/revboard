"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames, useDayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "dropdown",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()
  const [navView, setNavView] = React.useState<"days" | "years">("days")

  return (
    <DayPicker
      key={navView}
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:2.5rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav,
          navView === "years" && "hidden"
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-[--cell-size] w-full items-center justify-center px-[--cell-size]",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-[--cell-size] w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border w-32",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "bg-transparent cursor-pointer p-1 text-sm outline-none w-full",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-bold text-lg",
          captionLayout === "label"
            ? "text-lg"
            : "[&>svg]:text-muted-foreground flex h-8 items-center justify-between gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:size-3.5 w-full",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground flex-1 select-none rounded-md text-[0.8rem] font-normal",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn(
          "w-[--cell-size] select-none",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-muted-foreground select-none text-[0.8rem]",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full select-none p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
          defaultClassNames.day
        ),
        range_start: cn(
          "bg-accent rounded-l-md",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("bg-accent rounded-r-md", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...rootProps }: any) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...rootProps}
            />
          )
        },
        Chevron: ({ className, orientation, ...chevronProps }: any) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...chevronProps} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", className)}
                {...chevronProps}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...chevronProps} />
          )
        },
        DayButton: CalendarDayButton,
        CaptionLabel: (captionProps: any) => (
          <Button
            variant="ghost"
            className="h-auto p-1 font-bold text-lg hover:bg-accent hover:text-accent-foreground cursor-pointer z-50 relative"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setNavView(prev => prev === "days" ? "years" : "days")
            }}
            type="button"
          >
            {captionProps.children}
          </Button>
        ),
        Table: (tableProps: any) => {
          const { goToMonth, months } = useDayPicker();
          const currentMonth = months?.[0]?.date || new Date();
          
          if (navView === "years") {
            // Generate years range
            const currentYear = new Date().getFullYear();
            const startYear = (props as any).fromYear || (props as any).fromDate?.getFullYear() || 2015;
            const endYear = (props as any).toYear || (props as any).toDate?.getFullYear() || currentYear + 5;
            
            const years = [];
            for (let y = startYear; y <= endYear; y++) {
              years.push(y);
            }

            return (
              <div className="flex flex-col gap-4 p-2 w-full">
                <div className="grid grid-cols-4 gap-2 max-h-[180px] overflow-y-auto w-full border-b pb-2">
                  {years.map((year) => (
                    <Button
                      key={year}
                      variant={year === currentMonth.getFullYear() ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                          "h-7 text-xs",
                          year === new Date().getFullYear() && "text-blue-500 font-bold"
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const newDate = new Date(currentMonth);
                        newDate.setFullYear(year);
                        goToMonth(newDate);
                      }}
                      type="button"
                    >
                      {year}
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 12 }, (_, i) => i).map((monthIndex) => (
                    <Button
                      key={monthIndex}
                      variant={monthIndex === currentMonth.getMonth() ? "default" : "ghost"}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const newDate = new Date(currentMonth);
                        newDate.setMonth(monthIndex);
                        goToMonth(newDate);
                        setNavView("days");
                      }}
                      type="button"
                    >
                      {new Date(2000, monthIndex, 1).toLocaleString("default", { month: "short" })}
                    </Button>
                  ))}
                </div>
              </div>
            );
          }
          return (
            <table className={cn("w-full border-collapse", tableProps.className)} {...tableProps} />
          )
        },
        WeekNumber: ({ children, ...weekProps }: any) => {
          return (
            <td {...weekProps}>
              <div className="flex size-[--cell-size] items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      } as any}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex aspect-square h-auto w-full min-w-[--cell-size] flex-col gap-1 font-normal leading-none data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
