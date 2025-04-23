import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileInput } from "@/components/ui/file-input"; // Assuming FileInput exists and works
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import useSeatingPlanStore, { StudentUploadData } from "@/store/seating-plan.store"; // Import from store

// Remove local type definition if it's defined in the store
// export type StudentUploadData = {
//   branchCode: string;
//   subjectCode: string;
//   csvFile: File | null;
//   csvFilePath?: string | null; // Add path if needed here too, or rely on store's definition
// };

type StudentUploadCardProps = {
  onDelete: () => void;
  // Replace single onChange with specific handlers
  onBranchSubjectChange: (data: Partial<Pick<StudentUploadData, 'branchCode' | 'subjectCode' | 'semester' | 'batchYear'>>) => void;
  onFileChange: (file: File | null) => void;
  data: StudentUploadData;
  showDelete?: boolean;
  disabled?: boolean; // Add disabled prop
};

export function StudentUploadCard({
  onDelete,
  // Destructure new props
  onBranchSubjectChange,
  onFileChange,
  data,
  showDelete = true,
  disabled = false, // Use disabled prop
}: StudentUploadCardProps) {

  const handleBranchCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Call the specific handler for branch/subject changes
    onBranchSubjectChange({ branchCode: e.target.value });
  };

  const handleSubjectCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Call the specific handler for branch/subject changes
    onBranchSubjectChange({ subjectCode: e.target.value });
  };

  const handleSemesterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onBranchSubjectChange({ semester: Number(e.target.value) });
  };

  const handleBatchYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onBranchSubjectChange({ batchYear: Number(e.target.value) });
  };

  const handleFileSelect = (file: File | null) => {
    // Call the specific handler for file changes
    onFileChange(file);
  };

  const { currentPlan  } = useSeatingPlanStore();

  const handleGenerateAttendance = async () => {
    console.log('Generate attendance sheet clicked for:', data);
    if (!data.csvFilePath) {
      console.error("CSV file path is missing.");
      // Optionally show an error message to the user
      return;
    }
    try {
      // Send data needed for attendance sheet generation
      const result = await window.ipcRenderer.invoke('generate-attendance-sheet', {
        branchCode: data.branchCode,
        subjectCode: data.subjectCode,
        semester: data.semester,
        batchYear: data.batchYear,
        csvFilePath: data.csvFilePath, // Send the path
        mode: currentPlan?.examMode,
        examType: currentPlan?.examType,
        session: currentPlan?.session,
        date: currentPlan?.date
        // Add other relevant data if needed by the main process
        // e.g., exam details if they aren't globally available in main.ts
      });

      if (result.success) {
        console.log(`Attendance sheet generated successfully: ${result.path}`);
        // Optionally show a success message or open the file
        alert(`Attendance sheet saved to: ${result.path}`);
      } else {
        console.error('Error generating attendance sheet:', result.error);
        // Show error message to the user
        alert(`Error generating attendance sheet: ${result.error}`);
      }
    } catch (error) {
      console.error('IPC Error:', error);
      alert(`Failed to communicate with the generation process: ${error}`);
    }
  };

  return (
    <Card className="relative">
      {showDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={onDelete}
          disabled={disabled} // Disable delete button too
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      {/* Disable content based on prop */}
      <CardContent className={`pt-6 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`branchCode-${data.branchCode}-${data.subjectCode}`}>Branch Code</Label> {/* Add unique ID part */}            <Input
              id={`branchCode-${data.branchCode}-${data.subjectCode}`} // Add unique ID part
              placeholder="e.g. CSE"
              value={data.branchCode}
              onChange={handleBranchCodeChange}
              disabled={disabled} // Disable input
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`subjectCode-${data.branchCode}-${data.subjectCode}`}>Subject Code</Label> {/* Add unique ID part */}            <Input
              id={`subjectCode-${data.branchCode}-${data.subjectCode}`} // Add unique ID part
              placeholder="e.g. CS101"
              value={data.subjectCode}
              onChange={handleSubjectCodeChange}
              disabled={disabled} // Disable input
            />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 mt-4">
          <div className="space-y-2">
            <Label htmlFor={`semester-${data.branchCode}-${data.subjectCode}`}>Semester</Label>
            <Input
              id={`semester-${data.branchCode}-${data.subjectCode}`}
              type="number"
              min={1}
              value={data.semester}
              onChange={handleSemesterChange}
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`batchYear-${data.branchCode}-${data.subjectCode}`}>Batch Year</Label>
            <Input
              id={`batchYear-${data.branchCode}-${data.subjectCode}`}
              type="number"
              min={2000}
              value={data.batchYear}
              onChange={handleBatchYearChange}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <Label htmlFor={`csvUpload-${data.branchCode}-${data.subjectCode}`}>Upload Students CSV</Label> {/* Add unique ID part */}          <FileInput
            id={`csvUpload-${data.branchCode}-${data.subjectCode}`} // Add unique ID part
            accept=".csv"
            onFileSelect={handleFileSelect}
            // Remove currentFile prop as FileInput doesn't use it and File object isn't stored
            // currentFile={data.csvFile}
            disabled={disabled} // Disable file input
          />
          {/* Display file name from csvFileName */} 
          {data.csvFileName && (
            <p className="text-sm text-muted-foreground truncate" title={data.csvFileName}>
              File: {data.csvFileName}
            </p>
          )}

          <Button 
            className="mt-4 w-full"
            onClick={handleGenerateAttendance}
            disabled={disabled || !data.csvFileName}
          >
            Generate Attendance Sheet
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}