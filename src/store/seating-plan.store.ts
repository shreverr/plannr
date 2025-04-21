import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type StudentUploadData = {
  branchCode: string;
  subjectCode: string;
  semester: number; // <-- Added
  batchYear: number; // <-- Added
  csvFilePath: string | null; // Path for backend processing
  csvFileName: string | null; // Store filename for display
};

export type SeatingPlanData = {
  examinationName: string;
  date: string;
  fromTime: Date;
  toTime: Date;
  cloakRoomVenue: string;
  mandatoryInstructions: string;
  selectedRooms: string[];
  examType: 'regular' | 'reappear';
  examMode: 'online' | 'offline'; // <-- Added examMode
  session: number; // <-- Added session field
  studentUploads: StudentUploadData[];
};

type SeatingPlanStore = {
  seatingPlans: SeatingPlanData[];
  currentPlan: SeatingPlanData | null;
  setCurrentPlan: (plan: SeatingPlanData | null) => void;
  addSeatingPlan: (plan: SeatingPlanData) => void;
  updateSeatingPlan: (planIndex: number, plan: SeatingPlanData) => void;
  deleteSeatingPlan: (planIndex: number) => void;
  addStudentUpload: () => void;
  updateStudentUpload: (index: number, data: StudentUploadData) => void;
  deleteStudentUpload: (index: number) => void;
};

const initialSeatingPlan: SeatingPlanData = {
  examinationName: '',
  date: '',
  fromTime: new Date(new Date().setHours(9, 0, 0, 0)),
  toTime: new Date(new Date().setHours(12, 0, 0, 0)),
  cloakRoomVenue: '',
  mandatoryInstructions: '',
  selectedRooms: [],
  examType: 'regular',
  examMode: 'offline', // <-- Default to offline
  session: 1, // <-- Default session
  studentUploads: [{
    branchCode: '',
    subjectCode: '',
    semester: 1, // <-- Default
    batchYear: new Date().getFullYear(), // <-- Default to current year
    csvFilePath: null,
    csvFileName: null
  }]
};

const useSeatingPlanStore = create<SeatingPlanStore>()(
  persist<SeatingPlanStore>(
  (set) => ({
    seatingPlans: [],
    currentPlan: initialSeatingPlan,
    setCurrentPlan: (plan) => set({ currentPlan: plan }),
    addSeatingPlan: (plan) =>
      set((state) => ({
        seatingPlans: [...state.seatingPlans, plan],
        currentPlan: null
      })),
    updateSeatingPlan: (planIndex, plan) =>
      set((state) => ({
        seatingPlans: state.seatingPlans.map((p, index) =>
          index === planIndex ? plan : p
        )
      })),
    deleteSeatingPlan: (planIndex) =>
      set((state) => ({
        seatingPlans: state.seatingPlans.filter((_, index) => index !== planIndex)
      })),
    addStudentUpload: () =>
      set((state) => {
        if (!state.currentPlan) {
          return {
            ...state,
            currentPlan: {
              ...initialSeatingPlan,
              studentUploads: [{ branchCode: '', subjectCode: '', semester: 1, batchYear: new Date().getFullYear(), csvFilePath: null, csvFileName: null }]
            }
          };
        }
        return {
          currentPlan: {
            ...state.currentPlan,
            studentUploads: [
              ...state.currentPlan.studentUploads,
              { branchCode: '', subjectCode: '', semester: 1, batchYear: new Date().getFullYear(), csvFilePath: null, csvFileName: null }
            ]
          }
        };
      }),
    // Update to handle partial updates correctly with new structure
    updateStudentUpload: (index, data) =>
      set((state) => {
        if (!state.currentPlan) return state;
        const updatedUploads = state.currentPlan.studentUploads.map((upload, i) => {
          if (i === index) {
            // Merge existing upload data with the new partial data
            return { ...upload, ...data };
          }
          return upload;
        });
        return {
          currentPlan: {
            ...state.currentPlan,
            studentUploads: updatedUploads,
          },
        };
      }),
    deleteStudentUpload: (index) =>
      set((state) => {
        if (!state.currentPlan) return state;
        return {
          currentPlan: {
            ...state.currentPlan,
            studentUploads: state.currentPlan.studentUploads.filter((_, i) => i !== index)
          }
        };
      })
  }),
  {
    name: 'seating-plan-storage'
  }
));

export default useSeatingPlanStore;