import { useState, useEffect } from "react";
import { SeatingPlanData } from "@/store/seating-plan.store";
import { SeatingPlanLayout } from "./seating-plan-layout";

type StudentData = {
  rollNumber: string;
  branchCode: string;
};

type SeatingPlanGeneratorProps = {
  plan: SeatingPlanData;
};

export function SeatingPlanGenerator({ plan }: SeatingPlanGeneratorProps) {
  const [studentData, setStudentData] = useState<StudentData[][]>([]);
  const [branchSummary, setBranchSummary] = useState<{ branchCode: string; count: number; }[]>([]);

  useEffect(() => {
    const processStudentData = async () => {
      // Process CSV files and extract student data
      const allStudents: StudentData[] = [];
      const branchCounts = new Map<string, number>();

      for (const upload of plan.studentUploads) {
        if (upload.csvFile) {
          const text = await upload.csvFile.text();
          const rows = text.split('\n').slice(1); // Skip header row

          rows.forEach(row => {
            const [rollNumber] = row.split(',');
            if (rollNumber?.trim()) {
              allStudents.push({
                rollNumber: rollNumber.trim(),
                branchCode: upload.branchCode
              });
              
              const count = branchCounts.get(upload.branchCode) || 0;
              branchCounts.set(upload.branchCode, count + 1);
            }
          });
        }
      }

      // Arrange students in 8 columns
      const arrangedStudents: StudentData[][] = [];
      const studentsPerRow = Math.ceil(allStudents.length / 6); // 6 rows

      for (let i = 0; i < studentsPerRow; i++) {
        const row: StudentData[] = [];
        for (let j = 0; j < 8; j++) {
          const studentIndex = i + (j * studentsPerRow);
          row.push(allStudents[studentIndex] || { rollNumber: '', branchCode: '' });
        }
        arrangedStudents.push(row);
      }

      // Generate branch summary
      const summary = Array.from(branchCounts.entries()).map(([branchCode, count]) => ({
        branchCode,
        count
      }));

      setStudentData(arrangedStudents);
      setBranchSummary(summary);
    };

    processStudentData();
  }, [plan.studentUploads]);

  return (
    <SeatingPlanLayout
      plan={plan}
      studentData={studentData}
      branchSummary={branchSummary}
    />
  );
}