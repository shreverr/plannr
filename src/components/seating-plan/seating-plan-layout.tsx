import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { SeatingPlanData } from "@/store/seating-plan.store";

type SeatingPlanLayoutProps = {
  plan: SeatingPlanData;
  studentData: {
    rollNumber: string;
    branchCode: string;
  }[][];
  branchSummary: {
    branchCode: string;
    count: number;
  }[];
};

export function SeatingPlanLayout({ plan, studentData, branchSummary }: SeatingPlanLayoutProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">SEATING PLAN FOR {plan.examinationName}</h1>
        <p className="text-sm mb-1">DATED: {plan.date}, TIMINGS: {formatTime(plan.fromTime)} - {formatTime(plan.toTime)}</p>
        <p className="text-sm">CLOAK ROOM VENUE: {plan.cloakRoomVenue}</p>
      </div>

      {/* Mandatory Instructions */}
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Mandatory Instructions to be announced by the Invigilator(s) to candidates before distribution of the question papers</h2>
        <div className="text-sm whitespace-pre-line">{plan.mandatoryInstructions}</div>
      </div>

      {/* Seating Arrangement Table */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">S.No.</TableHead>
                {Array.from({ length: 8 }, (_, i) => (
                  <TableHead key={i}>Row {i + 1}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell>{rowIndex + 1}</TableCell>
                  {row.map((student, colIndex) => (
                    <TableCell key={colIndex}>
                      {student ? student.rollNumber : ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Branch Summary */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        {branchSummary.map((branch, index) => (
          <div key={index} className="flex gap-2">
            <span className="font-medium">{branch.branchCode}</span>
            <span>{branch.count}</span>
          </div>
        ))}
        <div className="col-span-2">
          <span className="font-medium">TOTAL</span>
          <span className="ml-2">
            {branchSummary.reduce((acc, curr) => acc + curr.count, 0)}
          </span>
        </div>
      </div>

      {/* Footer Details */}
      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>UMC Roll Number if any:</Label>
            <div className="h-6 border-b border-dashed"></div>
          </div>
          <div className="space-y-2">
            <Label>Absent Roll Number:</Label>
            <div className="h-6 border-b border-dashed"></div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Remarks:</Label>
          <div className="h-6 border-b border-dashed"></div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <Label>Name of the Invigilator-1:</Label>
              <div className="h-6 border-b border-dashed"></div>
            </div>
            <div>
              <Label>Employee Code:</Label>
              <div className="h-6 border-b border-dashed"></div>
            </div>
            <div>
              <Label>Signature:</Label>
              <div className="h-6 border-b border-dashed"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Name of the Invigilator-2:</Label>
              <div className="h-6 border-b border-dashed"></div>
            </div>
            <div>
              <Label>Employee Code:</Label>
              <div className="h-6 border-b border-dashed"></div>
            </div>
            <div>
              <Label>Signature:</Label>
              <div className="h-6 border-b border-dashed"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}