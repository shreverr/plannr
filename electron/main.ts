import { app, BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { ExamConfig, generateSeatingPlan, Room, Student } from './generator'

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
  // 1. Create exam configuration
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
    departmentColors: {
      "Computer Science": "#BBDEFB",
      "Electrical Engineering": "#FFCDD2",
      "Mechanical Engineering": "#C8E6C9"
    },
    logoPath: "./university_logo.png" // Optional
  };
  
  // 2. Create rooms
  const rooms = [
    new Room("Room A101", 5, 6, "DE-MORGAN BLOCK FIRST FLOOR"),
    new Room("Room B202", 6, 5, "LE CORBUSIER BLOCK SECOND FLOOR")
  ];
  
  // 3. Create students
  const students: Student[] = [];
  
  // Sample department distribution
  const departments = ["Computer Science", "Electrical Engineering", "Mechanical Engineering"];
  
  // Generate sample student data
  for (let i = 1; i <= 50; i++) {
    const studentId = `${i}`;
    const name = `Student ${i}`;
    const department = departments[i % departments.length];
    students.push(new Student(studentId, name, department));
  }
  
  // 4. Generate the seating plan
  try {
    console.log(students);
    

    const outputFile = await generateSeatingPlan({
      outputFile: `./SeatingPlan_${new Date().toISOString().replace(/[T:.-]/g, '').slice(0, 14)}.pdf`,
      examConfig,
      students,
      rooms,
      assignmentStrategy: 'byDepartment'
    });
    
    console.log(`Seating plan generated successfully: ${outputFile}`);
  } catch (err) {
    console.error('Error generating PDF:', err);
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
  const result = exampleUsage();
  return result;
});

app.whenReady().then(createWindow)
