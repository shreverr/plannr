import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

// Define the structure for student data
export interface StudentAttendanceInfo {
  sNo: number;
  batch: number;
  sem: number;
  studentName: string;
  universityRollNo: string;
}

// Define the structure for the main attendance data
export interface AttendanceData {
  universityName: string;
  examTitle: string; // e.g., Attendance (Regular) for End Term Examinations, December 2024
  noteLines: string[];
  dateAndSession: string;
  subject: string;
  modeOfExamination: string;
  branchSemBatch: string;
  subjectCode: string;
  session: string;
  students: StudentAttendanceInfo[];
  logoPath?: string; // Optional path for the university logo
  totalPages: number; // To display like 19/19
  currentPage: number;
  invigilatorName?: string; // Optional
}

export interface AttendanceOptions {
  outputFile: string;
  data: AttendanceData;
}

// Function to generate the attendance sheet PDF
export function generateAttendanceSheet(options: AttendanceOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const { data, outputFile } = options;
    const doc = new PDFDocument({ size: 'A4', layout: 'portrait', margin: 30 });
    const stream = fs.createWriteStream(outputFile);

    doc.pipe(stream);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 30;
    const contentWidth = pageWidth - 2 * margin;

    // --- Header --- 
    let yPos = margin;

    // Logo (optional)
    if (data.logoPath) {
      try {
        // Adjust logo size and position as needed
        doc.image(data.logoPath, margin, yPos, { width: 50 }); 
      } catch (err) {
        console.warn(`Warning: Logo image not found at ${data.logoPath}`);
      }
    }

    // Page Number (Top Right)
    doc.fontSize(10).font('Helvetica').text(`${data.currentPage}/${data.totalPages}`, pageWidth - margin - 50, yPos, { width: 50, align: 'right' });

    // University Name
    yPos += 5; // Adjust spacing based on logo presence/absence
    doc.fontSize(14).font('Helvetica-Bold').text(data.universityName, margin, yPos, { align: 'center' });
    yPos += 16;
    // Removed yPos adjustment for subtitle
    doc.fontSize(11).font('Helvetica').text(data.examTitle, margin, yPos, { align: 'center' });
    yPos += 20;

    // Notes
    doc.fontSize(9).font('Helvetica-Bold').text('Note:', margin, yPos);
    yPos += 12;
    doc.font('Helvetica');
    data.noteLines.forEach(line => {
      doc.text(line, margin + 10, yPos, { continued: false, indent: 5 });
      yPos += 11;
    });
    yPos += 30;

    // Exam Details
    const detailStartY = yPos;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text(`Date & Session: ${data.dateAndSession}`, margin, yPos);
    yPos += 14;
    doc.text(`Subject: ${data.subject}`, margin, yPos);
    yPos += 14;
    doc.text(`Mode of Examination: ${data.modeOfExamination}`, margin, yPos);

    // Right-aligned details
    yPos = detailStartY; // Reset Y for right column
    const rightColX = pageWidth / 2 + 20;
    doc.text(`Branch/Sem/Batch: ${data.branchSemBatch}`, rightColX, yPos, {align: "right"});
    yPos += 14;
    doc.text(`Subject Code: ${data.subjectCode}`, rightColX, yPos, {align: "right"});
    yPos += 14;
    doc.text(`Session-${data.session}`, rightColX, yPos, {align: "right"});
    yPos += 25; // Space before table

    // --- Table --- 
    const tableTop = yPos;
    const rowHeight = 20;
    const colWidths = [35, 40, 35, 120, 80, 70, 60, 70, 50]; // Adjusted widths for portrait A4
    const tableWidth = colWidths.reduce((a, b) => a + b, 0);
    const tableStartX = (pageWidth - tableWidth) / 2; // Center the table

    // Table Headers
    const headers = ['S. No', 'Batch', 'Sem.', 'Student Name', 'University Roll No', 'Answer Sheet Serial No.', 'Machine No.', 'Signature', 'Time Out'];
    doc.font('Helvetica-Bold').fontSize(8);
    let currentX = tableStartX;
    headers.forEach((header, i) => {
      doc.rect(currentX, tableTop, colWidths[i], rowHeight * (header.includes('\n') ? 1.5 : 1)).stroke();
      doc.text(header.replace('\n', '\n'), currentX + 2, tableTop + (header.includes('Answer Sheet') ? 1.5 : 7), { width: colWidths[i] - 4, align: 'center' });
      currentX += colWidths[i];
    });

    // Table Rows
    doc.font('Helvetica').fontSize(8);
    const maxRows = 35; // Adjust based on page height and desired empty rows
    const totalRowsToDraw = Math.max(data.students.length, 15); // Draw at least 15 rows + header, or more if students exist
    const startStudentIndex = (data.currentPage - 1) * maxRows; // Assuming pagination logic if needed
    const endStudentIndex = Math.min(startStudentIndex + maxRows, data.students.length);

    for (let i = 0; i < Math.min(maxRows, data.students.length); i++) { // Changed to use actual student count
        const student = data.students[i];
        const currentY = tableTop + rowHeight * (headers[5].includes('\n') ? 1.5 : 1) + i * rowHeight;
        currentX = tableStartX;

        // Stop drawing rows if they exceed page boundary (leave space for footer)
        if (currentY + rowHeight > pageHeight - 120) break;

        colWidths.forEach((colWidth, j) => {
            doc.rect(currentX, currentY, colWidth, rowHeight).stroke();
            let cellText = '';
            if (student) {
                switch (j) {
                    case 0: cellText = (i + 1).toString(); break; // Use row index for S.No
                    case 1: cellText = student.batch.toString(); break;
                    case 2: cellText = student.sem.toString(); break;
                    case 3: cellText = student.studentName; break;
                    case 4: cellText = student.universityRollNo; break;
                    // Columns 5, 6, 7, 8 are empty for signing
                    default: cellText = ''; // Empty for other columns
                }
            }
            doc.text(cellText, currentX + 2, currentY + 5, { 
                width: colWidth - 4, 
                align: j < 3 || j == 4 ? 'center' : 'left' 
            });
            currentX += colWidth;
        });
    }

    const tableBottom = tableTop + rowHeight * (headers[5].includes('\n') ? 1.5 : 1) + maxRows * rowHeight;

    // --- Footer --- 
    yPos = Math.min(tableBottom + 20, pageHeight - 100); // Position footer relative to table or page bottom

    doc.fontSize(9).font('Helvetica');
    doc.text('Total No. of Presentees: __________', margin, yPos);
    doc.text('Total No. of Absentees: __________', margin + 220, yPos);
    doc.text('Total No. of Detainees: __________', margin + 420, yPos);
    yPos += 20;
    doc.text('Unfair Means Case(s) Roll No. (if any): ____________________', margin, yPos);
    yPos += 30;
    doc.text('Name of the Invigilators', margin, yPos);
    doc.text('Signature of the Invigilators', pageWidth - margin - 150, yPos, { align: 'right' });
    yPos += 10;
    // Add page number at bottom right again if needed
    doc.fontSize(10).text(`${data.currentPage}/${data.totalPages}`, pageWidth - margin - 50, yPos, { width: 50, align: 'right' });

    // Finalize the PDF
    doc.end();

    stream.on('finish', () => {
      resolve(outputFile);
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
}

// Example Usage (can be removed or adapted)
export async function exampleAttendanceGeneration() {
  const exampleData: AttendanceData = {
    universityName: 'Chitkara University, Punjab',
    examTitle: 'Attendance (Regular) for End Term Examinations, December 2024',
    noteLines: [
      '1. Centre Superintendents are requested to send this slip to the Assistant Registrar (Examinations) securely put inside the packet along with the answer-books\n2. Please ensure that the memo is not sent separately in any case.',
    ],
    dateAndSession: '16-12-2024 (Session-1)',
    subject: 'Introduction to AI with Microsoft Azure AI',
    modeOfExamination: 'ONLINE',
    branchSemBatch: 'BE (CSE-AI)/1st/2024',
    subjectCode: '24CAI1102',
    session: '1',
    students: [
      { sNo: 291, batch: 2024, sem: 1, studentName: 'Nandini Gupta', universityRollNo: '2410992816' },
      { sNo: 292, batch: 2024, sem: 1, studentName: 'Navjot Kaur', universityRollNo: '2410992817' },
      { sNo: 293, batch: 2024, sem: 1, studentName: 'Navneet Kaur', universityRollNo: '2410992818' },
      { sNo: 294, batch: 2024, sem: 1, studentName: 'Navyam Jain', universityRollNo: '2410992819' },
      { sNo: 295, batch: 2024, sem: 1, studentName: 'Nayamat E Meet', universityRollNo: '2410992820' },
      { sNo: 296, batch: 2024, sem: 1, studentName: 'Nayan', universityRollNo: '2410992821' },
      { sNo: 297, batch: 2024, sem: 1, studentName: 'Nidhi Mittal', universityRollNo: '2410992822' },
      { sNo: 298, batch: 2024, sem: 1, studentName: 'Nishchay Rai', universityRollNo: '2410992823' },
      { sNo: 299, batch: 2024, sem: 1, studentName: 'Nishtha', universityRollNo: '2410992824' },
      { sNo: 300, batch: 2024, sem: 1, studentName: 'Niyati Aggarwal', universityRollNo: '2410992825' },
      // Add more students as needed...
    ],
    logoPath: path.join(process.env.VITE_PUBLIC || 'public', 'image.png'), // Adjust path as needed
    totalPages: 19, // Example total pages
    currentPage: 19, // Example current page
  };

  try {
    const outputFile = await generateAttendanceSheet({
      outputFile: `./AttendanceSheet_${new Date().toISOString().replace(/[T:.-]/g, '').slice(0, 14)}.pdf`,
      data: exampleData,
    });
    console.log(`Attendance sheet generated successfully: ${outputFile}`);
  } catch (err) {
    console.error('Error generating attendance sheet:', err);
  }
}

// Uncomment to run example when executing this file directly
// exampleAttendanceGeneration();