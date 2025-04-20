import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileInput } from "@/components/ui/file-input"; // Assuming FileInput exists and works
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { StudentUploadData } from "@/store/seating-plan.store"; // Import from store

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
  onBranchSubjectChange: (data: Partial<Pick<StudentUploadData, 'branchCode' | 'subjectCode'>>) => void;
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

  const handleFileSelect = (file: File | null) => {
    // Call the specific handler for file changes
    onFileChange(file);
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
          {/* Optionally display the path if available and needed */}
          {/* {data.csvFilePath && (
            <p className="text-xs text-gray-500 truncate" title={data.csvFilePath}>
              Path: {data.csvFilePath}
            </p>
          )} */}
        </div>
      </CardContent>
    </Card>
  );
}