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
  modeOfExamination: 'ONLINE' | 'OFFLINE';
  branchSemBatch: string;
  subjectCode: string;
  session: string;
  students: StudentAttendanceInfo[];
  logoPath?: string; // Optional path for the university logo
  // totalPages: number; // Removed
  // currentPage: number; // Removed
  invigilatorName?: string; // Optional
}

export interface AttendanceOptions {
  outputFile: string;
  data: AttendanceData;
}

// Function to generate the attendance sheet PDF
export function generateAttendanceSheet(options: AttendanceOptions): Promise<string> {
  console.log('[AttendanceGen] Starting generation with options:', options);
  return new Promise((resolve, reject) => {
    const { data, outputFile } = options;
    const doc = new PDFDocument({ size: 'A4', layout: 'portrait', margin: 30 });
    const stream = fs.createWriteStream(outputFile);

    doc.pipe(stream);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 30;
    const contentWidth = pageWidth - 2 * margin;
    const maxRowsPerPage = 25; // Define max students per page (Changed from 35 to 20)
    const totalPages = Math.ceil(data.students.length / maxRowsPerPage) || 1; // Calculate total pages, ensure at least 1
    console.log(`[AttendanceGen] Calculated total pages: ${totalPages}`);

    // Define base headers and widths outside the loop
    const baseHeaders = ['S. No', 'Batch', 'Sem.', 'Student Name', 'University Roll No', 'Answer Sheet Serial No.', 'Machine No.', 'Signature', 'Time Out'];
    const baseColWidths = [35, 40, 35, 120, 80, 70, 60, 70, 50]; // Adjusted widths for portrait A4
    const rowHeight = 20;

    for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
      console.log(`[AttendanceGen] Processing page: ${currentPage}`);
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
      doc.fontSize(10).font('Helvetica').text(`${currentPage}/${totalPages}`, pageWidth - margin - 50, yPos, { width: 50, align: 'right' });

      // University Name
      yPos += 5; // Adjust spacing based on logo presence/absence
      doc.fontSize(14).font('Helvetica-Bold').text(data.universityName, margin, yPos, { align: 'center' });
      yPos += 16;
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
      
      // Determine headers and widths for the current page (based on mode)
      let headers = [...baseHeaders];
      let colWidths = [...baseColWidths];
      if (data.modeOfExamination.toUpperCase() === 'OFFLINE') {
        const machineNoIndex = headers.indexOf('Machine No.');
        if (machineNoIndex > -1) {
          headers.splice(machineNoIndex, 1);
          colWidths.splice(machineNoIndex, 1);
        }
        const timeOutIndex = headers.indexOf('Time Out');
        if (timeOutIndex > -1) {
          headers.splice(timeOutIndex, 1);
          colWidths.splice(timeOutIndex, 1);
        }
      }
      const tableWidth = colWidths.reduce((a, b) => a + b, 0);
      const tableStartX = (pageWidth - tableWidth) / 2; // Center the table

      // Table Headers
      doc.font('Helvetica-Bold').fontSize(8);
      let currentX = tableStartX;
      const headerRowHeight = rowHeight * (headers.some(h => h.includes('\n')) ? 1.5 : 1);
      headers.forEach((header, i) => {
        const headerHeightMultiplier = header.includes('\n') ? 1.5 : 1;
        const headerYOffset = header.includes('Answer Sheet') ? 1.5 : 7;
        doc.rect(currentX, tableTop, colWidths[i], rowHeight * headerHeightMultiplier).stroke();
        doc.text(header.replace('\n', '\n'), currentX + 2, tableTop + headerYOffset, { width: colWidths[i] - 4, align: 'center' });
        currentX += colWidths[i];
      });

      // Table Rows
      doc.font('Helvetica').fontSize(8);
      const startStudentIndex = (currentPage - 1) * maxRowsPerPage;
      const endStudentIndex = Math.min(startStudentIndex + maxRowsPerPage, data.students.length);
      console.log(`[AttendanceGen] Page ${currentPage} - Student index range: ${startStudentIndex} to ${endStudentIndex - 1}`);
      let tableBottom = tableTop + headerRowHeight; // Initialize table bottom

      for (let i = startStudentIndex; i < endStudentIndex; i++) {
          const student = data.students[i];
          const rowIndexOnPage = i - startStudentIndex;
          const currentY = tableTop + headerRowHeight + rowIndexOnPage * rowHeight; // Use dynamic header height
          console.log(`[AttendanceGen] Page ${currentPage} - Drawing row for student index ${i} at Y: ${currentY}`);
          currentX = tableStartX;

          // Stop drawing rows if they exceed page boundary (leave space for footer)
          if (currentY + rowHeight > pageHeight - 100) break; // Adjusted footer space

          colWidths.forEach((colWidth, j) => {
              doc.rect(currentX, currentY, colWidth, rowHeight).stroke();
              let cellText = '';
              const header = headers[j]; // Get the current header for context
              if (student) {
                  switch (header) { // Use header text instead of fixed index
                      case 'S. No': cellText = (i + 1).toString(); break; // Use global index for S.No
                      case 'Batch': cellText = student.batch.toString(); break;
                      case 'Sem.': cellText = student.sem.toString(); break;
                      case 'Student Name': cellText = student.studentName; break;
                      case 'University Roll No': cellText = student.universityRollNo; break;
                      // Columns like 'Answer Sheet Serial No.', 'Signature' are empty for signing
                      // 'Machine No.' and 'Time Out' are conditionally excluded
                      default: cellText = ''; // Empty for other columns
                  }
              }
              // Determine alignment based on header
              let align: 'center' | 'left' = 'left';
              if (['S. No', 'Batch', 'Sem.', 'University Roll No'].includes(header)) {
                  align = 'center';
              }
              doc.text(cellText, currentX + 2, currentY + 5, { 
                  width: colWidth - 4, 
                  align: align
              });
              currentX += colWidth;
          });
          tableBottom = currentY + rowHeight; // Update table bottom after drawing row
      }

      // --- Footer --- 
      // Position the footer 20 points below the table bottom
      let footerYPos = tableBottom + 20; 
      // Ensure footer doesn't go off page (though table limit should prevent this)
      // If footerYPos + estimated_footer_height > pageHeight - margin, adjust if needed.
      // For now, keeping it simple as the table break condition handles the boundary.
      console.log(`[AttendanceGen] Page ${currentPage} - Calculated footer Y position: ${footerYPos}`);

      doc.fontSize(9).font('Helvetica');
      doc.text('Total No. of Presentees: __________', margin, footerYPos);
      doc.text('Total No. of Absentees: __________', margin + 220, footerYPos);
      doc.text('Total No. of Detainees: __________', margin + 420, footerYPos);
      footerYPos += 20;
      doc.text('Unfair Means Case(s) Roll No. (if any): ____________________', margin, footerYPos);
      footerYPos += 30;
      doc.text('Name of the Invigilators', margin, footerYPos);
      doc.text('Signature of the Invigilators', pageWidth - margin - 150, footerYPos, { align: 'right' });
      footerYPos += 10;
      // Add page number at bottom right again
    //   doc.fontSize(10).text(`${currentPage}/${totalPages}`, pageWidth - margin - 50, footerYPos, { width: 50, align: 'right' });

      // Add a new page *after* drawing the current page's content,
      // but only if this is NOT the last page.
      if (currentPage < totalPages) {
        doc.addPage();
      }
    }

    // Finalize the PDF
    doc.end();

    stream.on('finish', () => {
      console.log(`[AttendanceGen] PDF generation finished for: ${outputFile}`);
      resolve(outputFile);
    });

    stream.on('error', (err) => {
      console.error(`[AttendanceGen] Error generating PDF: ${outputFile}`, err);
      reject(err);
    });
  });
}

// Example Usage (can be removed or adapted)
export async function exampleAttendanceGeneration() {
  const exampleData: Omit<AttendanceData, 'totalPages' | 'currentPage'> = { // Use Omit to reflect removed properties
    universityName: 'Chitkara University, Punjab',
    examTitle: 'Attendance (Regular) for End Term Examinations, December 2024',
    noteLines: [
      '1. Centre Superintendents are requested to send this slip to the Assistant Registrar (Examinations) securely put inside the packet along with the answer-books\n2. Please ensure that the memo is not sent separately in any case.',
    ],
    dateAndSession: '16-12-2024 (Session-1)',
    subject: 'Introduction to AI with Microsoft Azure AI',
    modeOfExamination: 'OFFLINE',
    branchSemBatch: 'BE (CSE-AI)/1st/2024',
    subjectCode: '24CAI1102',
    session: '1',
    students: [
      // Create a longer list for multi-page testing
      ...Array.from({ length: 40 }, (_, i) => ({
        sNo: 291 + i,
        batch: 2024,
        sem: 1,
        studentName: `Student Name ${i + 1}`,
        universityRollNo: `2410992${816 + i}`,
      })),
      // { sNo: 291, batch: 2024, sem: 1, studentName: 'Nandini Gupta', universityRollNo: '2410992816' },
      // { sNo: 292, batch: 2024, sem: 1, studentName: 'Navjot Kaur', universityRollNo: '2410992817' },
      // ... (original students removed for brevity, replaced by generated list)
    ],
    logoPath: path.join(process.env.VITE_PUBLIC || 'public', 'image.png'), // Adjust path as needed
    // totalPages: 19, // Removed
    // currentPage: 19, // Removed
  };

  try {
    const outputFile = await generateAttendanceSheet({
      outputFile: `./AttendanceSheet_${new Date().toISOString().replace(/[T:.-]/g, '').slice(0, 14)}.pdf`,
      data: exampleData as AttendanceData, // Cast back to AttendanceData for the function call
    });
    console.log(`Attendance sheet generated successfully: ${outputFile}`);
  } catch (err) {
    console.error('Error generating attendance sheet:', err);
  }
}

// Uncomment to run example when executing this file directly
// exampleAttendanceGeneration();