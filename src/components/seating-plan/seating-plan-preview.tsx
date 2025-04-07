import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SeatingPlanData } from "@/store/seating-plan.store";
import { SeatingPlanGenerator } from "./seating-plan-generator";

type SeatingPlanPreviewProps = {
  plan: SeatingPlanData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SeatingPlanPreview({ plan, open, onOpenChange }: SeatingPlanPreviewProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] overflow-y-auto print:overflow-visible print:h-auto print:max-w-none">
        <div className="flex justify-end gap-4 mb-4 print:hidden">
          <Button onClick={handlePrint}>Print Seating Plan</Button>
        </div>
        <SeatingPlanGenerator plan={plan} />
      </DialogContent>
    </Dialog>
  );
}