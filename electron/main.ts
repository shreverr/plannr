import { app, BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'; // Import fs promises for async file reading
import Papa from 'papaparse'; // Import papaparse for CSV parsing
 // Import StudentGroup instead of Student
 import { ExamConfig, generateSeatingPlan, Room, StudentGroup } from './generator'
import { exampleAttendanceGeneration } from './attendance-gen';

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

async function exampleUsage() {
  // 1. Create exam configuration (Removed departmentColors)
  const examConfig: ExamConfig = {
    examName: "END TERM EXAMINATIONS - SPRING 2025",
    examDate: "20/04/2025",
    examTime: "09:00 a.m. - 12:00 p.m.",
    cloakRoom: "OAT, Ground Floor, Le Corbusier Block",
    instructions: [
      "1. No student should be allowed to leave the Examination Hall before half time.",
      "2. Mobile phones/Smart Watches/Electronic devices are strictly prohibited in examination halls.",
      "3. Students without admit card must report to Examination Wing with University Identity Card.",
      "4. No student is allowed to carry any paper/book/notes/mobile/calculator inside the examination venue.",
      "5. Students must reach at least 15 minutes before the start of Examination."
    ],
    // departmentColors removed
    logoPath: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg') // Optional - Use a valid path if needed
  };

  // 2. Create rooms
  const rooms = [
    new Room("Room A101", 5, 6, "DE-MORGAN BLOCK FIRST FLOOR"),
    new Room("Room B202", 6, 5, "LE CORBUSIER BLOCK SECOND FLOOR")
  ];

  // 3. Create student groups
  const studentGroups: StudentGroup[] = [
    {
      branchCode: "CS",
      subjectCode: "CS101",
      studentList: Array.from({ length: 25 }, (_, i) => `CS${101 + i}`) // Generate 25 CS students
    },
    {
      branchCode: "EE",
      subjectCode: "EE201",
      studentList: Array.from({ length: 20 }, (_, i) => `EE${201 + i}`) // Generate 20 EE students
    },
    {
      branchCode: "ME",
      subjectCode: "ME301",
      studentList: Array.from({ length: 15 }, (_, i) => `ME${301 + i}`) // Generate 15 ME students
    }
  ];


  // 4. Generate the seating plan (Pass studentGroups instead of students)
  try {
    const outputFile = await generateSeatingPlan({
      outputFile: `./SeatingPlan_${new Date().toISOString().replace(/[T:.-]/g, '').slice(0, 14)}.pdf`,
      examConfig,
      studentGroups, // Use the new studentGroups array
      rooms,
    });

    console.log(`Seating plan generated successfully: ${outputFile}`);
    return outputFile; // Return the path for the IPC handler
  } catch (err) {
    console.error('Error generating PDF:', err);
    throw err; // Re-throw error for the IPC handler
  }
}

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.handle('generate-seating-plan', async (event, arg) => {
  // Call exampleUsage and return its result (or handle errors)
  try {
    // Note: In a real app, you'd likely pass 'arg' containing
    // examConfig, studentGroups, and rooms from the renderer process
    // instead of using the hardcoded exampleUsage.
    const result = await exampleUsage();

    console.log("Received data in main process:", arg);

    const { examConfig, studentGroups: studentGroupsFromRenderer, rooms: roomsFromRenderer } = arg;

    // 1. Process Student Groups: Read student IDs from CSV files
    const processedStudentGroups: StudentGroup[] = [];
    for (const group of studentGroupsFromRenderer) {
      if (!group.csvFilePath || typeof group.csvFilePath !== 'string') {
        console.warn(`Skipping group ${group.branchCode}-${group.subjectCode} due to missing or invalid csvFilePath.`);
        continue;
      }
      try {
        const fileContent = await fs.readFile(group.csvFilePath, 'utf8');
        const parseResult = Papa.parse<string[]>(fileContent.trim(), {
          header: false, // Assuming CSV has no header, just one column of IDs
          skipEmptyLines: true,
        });

        if (parseResult.errors.length > 0) {
          console.error(`Error parsing CSV for ${group.branchCode}-${group.subjectCode}:`, parseResult.errors);
          throw new Error(`Failed to parse CSV: ${parseResult.errors[0].message}`);
        }

        // Extract student IDs from the first column
        const studentList = parseResult.data.map(row => row[0]).filter(id => id); // Ensure ID is not empty

        if (studentList.length === 0) {
          console.warn(`CSV for ${group.branchCode}-${group.subjectCode} is empty or contains no valid IDs.`);
          // Decide if an empty group should be added or skipped
          // continue; // Option: skip empty groups
        }

        processedStudentGroups.push({
          branchCode: group.branchCode,
          subjectCode: group.subjectCode,
          studentList: studentList,
        });

      } catch (readError: any) {
        console.error(`Error reading or parsing CSV file ${group.csvFilePath}:`, readError);
        // Decide how to handle file read errors (e.g., skip group, return error to renderer)
        throw new Error(`Failed to process student file ${group.csvFilePath}: ${readError.message}`);
      }
    }

    if (processedStudentGroups.length === 0) {
      throw new Error("No valid student data could be processed from the provided files.");
    }

    // 2. Prepare Rooms (Map frontend room structure to backend Room class instances)
    const rooms = roomsFromRenderer.map((r: any) => new Room(r.name, r.rows, r.cols, r.buildingLocation || "Default Location"));

    // 3. Define Output Path
    const timestamp = new Date().toISOString().replace(/[T:.-]/g, '').slice(0, 14);
    const defaultDownloadsPath = app.getPath('downloads'); // Get user's downloads directory
    const outputFile = path.join(defaultDownloadsPath, `SeatingPlan_${timestamp}.pdf`);

    // 4. Generate Seating Plan
    const resultPath = await generateSeatingPlan({
      outputFile: outputFile,
      examConfig,
      studentGroups: processedStudentGroups,
      rooms,
    });

    console.log(`Seating plan generated successfully: ${resultPath}`);
    return { success: true, path: resultPath };
   } catch (error: any) {
     console.error("IPC Handler Error:", error);
     return { success: false, error: error.message || 'Unknown error' };
  }
});

exampleAttendanceGeneration()

app.whenReady().then(createWindow)
