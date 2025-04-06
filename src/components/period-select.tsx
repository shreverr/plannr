import * as React from "react";
import { Button } from "@/components/ui/button";
import { Period } from "./time-picker-utils";

interface TimePeriodSelectProps extends React.HTMLAttributes<HTMLButtonElement> {
  period: Period;
  setPeriod: (period: Period) => void;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  onLeftFocus?: () => void;
}

const TimePeriodSelect = React.forwardRef<HTMLButtonElement, TimePeriodSelectProps>(
  ({ period, setPeriod, date, setDate, onLeftFocus, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "ArrowLeft") onLeftFocus?.();
      if (["ArrowUp", "ArrowDown", " ", "Enter"].includes(e.key)) {
        e.preventDefault();
        const newPeriod = period === "AM" ? "PM" : "AM";
        setPeriod(newPeriod);
        if (date) {
          const hours = date.getHours();
          const newHours = hours >= 12 ? hours - 12 : hours + 12;
          const newDate = new Date(date);
          newDate.setHours(newHours);
          setDate(newDate);
        }
      }
    };

    return (
      <Button
        ref={ref}
        variant="outline"
        className="w-[48px] font-mono text-base tabular-nums"
        onClick={() => {
          const newPeriod = period === "AM" ? "PM" : "AM";
          setPeriod(newPeriod);
          if (date) {
            const hours = date.getHours();
            const newHours = hours >= 12 ? hours - 12 : hours + 12;
            const newDate = new Date(date);
            newDate.setHours(newHours);
            setDate(newDate);
          }
        }}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {period}
      </Button>
    );
  }
);

TimePeriodSelect.displayName = "TimePeriodSelect";

export { TimePeriodSelect };