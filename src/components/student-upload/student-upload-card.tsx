import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileInput } from "@/components/ui/file-input";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";

export type StudentUploadData = {
  branchCode: string;
  subjectCode: string;
  csvFile: File | null;
};

type StudentUploadCardProps = {
  onDelete: () => void;
  onChange: (data: StudentUploadData) => void;
  data: StudentUploadData;
  showDelete?: boolean;
};

export function StudentUploadCard({
  onDelete,
  onChange,
  data,
  showDelete = true,
}: StudentUploadCardProps) {
  const handleBranchCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...data, branchCode: e.target.value });
  };

  const handleSubjectCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...data, subjectCode: e.target.value });
  };

  const handleFileSelect = (file: File | null) => {
    onChange({ ...data, csvFile: file });
  };

  return (
    <Card className="relative">
      {showDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={onDelete}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <CardContent className="pt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="branchCode">Branch Code</Label>
            <Input
              id="branchCode"
              placeholder="e.g. CSE"
              value={data.branchCode}
              onChange={handleBranchCodeChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subjectCode">Subject Code</Label>
            <Input
              id="subjectCode"
              placeholder="e.g. CS101"
              value={data.subjectCode}
              onChange={handleSubjectCodeChange}
            />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <Label htmlFor="csvUpload">Upload Students CSV</Label>
          <FileInput
            id="csvUpload"
            accept=".csv"
            onFileSelect={handleFileSelect}
          />
          {data.csvFile && (
            <p className="text-sm text-green-600">
              File selected: {data.csvFile.name}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}