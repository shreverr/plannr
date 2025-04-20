import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { TimePicker12Demo } from "@/components/time-picker-demo";
import { RoomSelectionTable } from "@/components/rooms/room-selection-table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { StudentUploadCard } from "@/components/student-upload/student-upload-card";
import { Plus } from "lucide-react";
import useSeatingPlanStore, { StudentUploadData } from "@/store/seating-plan.store"; // Import StudentUploadData type
import useRoomStore from "@/store/rooms.store"; // Import room store
import { useEffect, useState } from "react";
// import { SeatingPlanPreview } from "@/components/seating-plan/seating-plan-preview"; // Remove preview import
import { toast } from "sonner"; // Import toast for feedback

// Helper function to format Date to HH:MM AM/PM
const formatTime12Hour = (date: Date): string => {
  if (!date) return "";
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// Define form validation schema
const formSchema = z.object({
  examinationName: z.string().min(2, { message: "Examination name is required" }),
  date: z.string().min(1, { message: "Examination date is required" }),
  fromTime: z.date({ required_error: "Start time is required" }),
  toTime: z.date({ required_error: "End time is required" }),
  cloakRoomVenue: z.string().min(2, { message: "Cloak room venue is required" }),
  mandatoryInstructions: z.string().min(2, { message: "Mandatory instructions are required" }),
  selectedRooms: z.array(z.string()).min(1, { message: "Please select at least one examination room" }),
  examType: z.enum(["regular", "reappear"], {
    required_error: "Please select an exam type",
  }),
});

type FormValues = z.infer<typeof formSchema>;

function NewSeatingPlan() {
  // Remove the initial useEffect calling generateSeatingP
  // useEffect(() => {
  //   window.ipcRenderer.generateSeatingP({}).then((response: any) => {
  //   });
  // }, []);

  const { currentPlan, addStudentUpload, updateStudentUpload, deleteStudentUpload, setCurrentPlan } = useSeatingPlanStore();
  const { rooms: availableRooms } = useRoomStore(); // Get available rooms from store
  // const [previewOpen, setPreviewOpen] = useState(false); // Remove preview state
  const [isGenerating, setIsGenerating] = useState(false); // State for loading indicator

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    // Initialize form with currentPlan data or defaults
    defaultValues: {
      examinationName: currentPlan?.examinationName || "",
      date: currentPlan?.date || "",
      fromTime: currentPlan?.fromTime ? new Date(currentPlan.fromTime) : new Date(new Date().setHours(9, 0, 0, 0)),
      toTime: currentPlan?.toTime ? new Date(currentPlan.toTime) : new Date(new Date().setHours(12, 0, 0, 0)),
      cloakRoomVenue: currentPlan?.cloakRoomVenue || "",
      mandatoryInstructions: currentPlan?.mandatoryInstructions || "",
      examType: currentPlan?.examType || "regular",
      selectedRooms: currentPlan?.selectedRooms || [],
    },
  });

  // Effect to update form when currentPlan changes (e.g., adding/removing uploads)
  useEffect(() => {
    if (currentPlan) {
      form.reset({ // Use reset to update the entire form state
        examinationName: currentPlan.examinationName,
        date: currentPlan.date,
        fromTime: new Date(currentPlan.fromTime), // Ensure Date objects
        toTime: new Date(currentPlan.toTime),     // Ensure Date objects
        cloakRoomVenue: currentPlan.cloakRoomVenue,
        mandatoryInstructions: currentPlan.mandatoryInstructions,
        examType: currentPlan.examType,
        selectedRooms: currentPlan.selectedRooms,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlan?.studentUploads, currentPlan?.examinationName, currentPlan?.date, currentPlan?.fromTime, currentPlan?.toTime, currentPlan?.cloakRoomVenue, currentPlan?.mandatoryInstructions, currentPlan?.examType, currentPlan?.selectedRooms, form.reset]);

  // Removed useEffect that watched form changes to update currentPlan continuously
  // The form state managed by react-hook-form is the source of truth for submission.
  // currentPlan is primarily used for initialization and managing studentUploads array.



  const onSubmit = async (data: FormValues) => {
    console.log("onSubmit function called with data:", data); // <-- Add this log
    setIsGenerating(true);
    toast.info("Generating seating plan...");

    if (!currentPlan || !currentPlan.studentUploads || currentPlan.studentUploads.length === 0) {
      toast.error("Please add student information.");
      setIsGenerating(false);
      return;
    }

     // Validate student uploads (at least one file path must exist)
     const hasStudentData = currentPlan.studentUploads.some(upload => upload.csvFilePath);
     if (!hasStudentData) {
       toast.error("Please upload at least one student CSV file.");
       setIsGenerating(false);
       return;
     }
     // Validate selected rooms
     if (!data.selectedRooms || data.selectedRooms.length === 0) {
        toast.error("Please select at least one examination room.");
        setIsGenerating(false);
        return;
     }


    // 1. Prepare ExamConfig
    const examConfig = {
      examName: data.examinationName.toUpperCase(), // Example: Make uppercase
      examDate: data.date, // Assuming format is already DD/MM/YYYY or similar
      examTime: `${formatTime12Hour(data.fromTime)} - ${formatTime12Hour(data.toTime)}`,
      cloakRoom: data.cloakRoomVenue,
      // Split instructions by newline, trim whitespace, and filter empty lines
      instructions: data.mandatoryInstructions.split('\n').map(line => line.trim()).filter(line => line.length > 0),
      // logoPath: // Optional: Get path from config or leave undefined
    };

    // 2. Prepare StudentGroups (using file paths)
    const studentGroups = currentPlan.studentUploads
      .filter(upload => upload.csvFilePath) // Only include uploads with a file path
      .map(upload => ({
        branchCode: upload.branchCode,
        subjectCode: upload.subjectCode,
        csvFilePath: upload.csvFilePath!, // Pass the path (non-null asserted due to filter)
        studentList: [] // Main process will populate this
      }));

    // 3. Prepare Rooms
    const selectedRoomDetails = data.selectedRooms
        .map(roomId => availableRooms.find(r => r.id === roomId))
        .filter((room): room is NonNullable<typeof room> => room !== undefined) // Type guard to filter out undefined and satisfy TS
        .map(room => ({
            name: room.name,
            rows: room.rows,
            cols: room.columns, // Map 'columns' to 'cols'
            buildingLocation: "Default Location" // Add location if available in store, else default - TODO: Add buildingLocation to Room store type
        }));


    try {
      // 4. Call IPC handler using the correct channel name
      console.log('Sending data to main:', { examConfig, studentGroups, rooms: selectedRoomDetails });
      const result = await window.ipcRenderer.invoke('generate-seating-plan', { // Use invoke and the correct channel name
        examConfig,
        studentGroups,
        rooms: selectedRoomDetails,
      });
      console.log('Received result from main:', result);

      if (result.success) {
        toast.success(`Seating plan generated successfully: ${result.path}`);
        // Optionally open the file or show a link
        // Example: window.ipcRenderer.send('open-file', result.path);
      } else {
        toast.error(`Error generating seating plan: ${result.error}`);
      }
    } catch (error: any) {
      console.error("IPC Error:", error);
      toast.error(`Failed to communicate with backend: ${error.message || 'Unknown IPC error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Add error handler for react-hook-form validation
  const onValidationError = (errors: any) => {
    console.error("Form validation errors:", errors);
    // Optionally, display a generic error toast if specific messages aren't enough
    // toast.error("Please check the form for errors and try again.");
    setIsGenerating(false); // Ensure loading state is reset on validation error
  };

  const handleAddUpload = () => {
    addStudentUpload();
  };

  const handleDeleteUpload = (index: number) => {
    // Only allow deletion if more than one upload card exists
    if (currentPlan && currentPlan.studentUploads.length > 1) {
       deleteStudentUpload(index);
    } else {
        toast.warning("At least one student group is required.");
    }
  };

  // Update to handle partial updates for branch/subject
  const handleUploadChange = (index: number, data: Partial<Pick<StudentUploadData, 'branchCode' | 'subjectCode'>>) => {
    updateStudentUpload(index, data);
  };

  // Handle file selection and store the path
  const handleFileChange = (index: number, file: File | null) => {
    if (file) {
      // IMPORTANT: Accessing file.path is specific to Electron.
      const filePath = (file as any).path; // Cast to access 'path'
      if (filePath && typeof filePath === 'string') {
        console.log(`File selected for index ${index}:`, filePath);
        // Store path and name, remove File object
        updateStudentUpload(index, { csvFilePath: filePath, csvFileName: file.name });
      } else {
         console.error("Could not get file path for index", index, file);
         toast.error("Could not get file path. Ensure you are running in Electron and the file exists.");
         // Clear path and name if path is invalid
         updateStudentUpload(index, { csvFilePath: null, csvFileName: null });
      }
    } else {
      console.log(`File removed for index ${index}`);
      // Clear path and name if file removed
      updateStudentUpload(index, { csvFilePath: null, csvFileName: null });
    }
  };

  // Log the state of isGenerating before rendering
  console.log("Rendering NewSeatingPlan, isGenerating:", isGenerating);
  
  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold leading-none">Create New Seating Plan</h1>
        <p className="text-sm text-muted-foreground mt-1.5">Configure your seating arrangement settings</p>
      </div>
      <Form {...form}>
        {/* Pass isGenerating to disable form during generation */}
        {/* Add the onValidationError handler to handleSubmit */}
        <form onSubmit={form.handleSubmit(onSubmit, onValidationError)} className="space-y-6">
          {/* Restore fieldset */}
          <fieldset disabled={isGenerating} className="space-y-6">
            {/* Exam Type */}
            <FormField
              control={form.control}
              name="examType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam Type</FormLabel>
                  <FormControl>
                    <ToggleGroup
                      type="single"
                      value={field.value}
                      onValueChange={field.onChange}
                      variant="outline"
                    >
                      <ToggleGroupItem value="regular">Regular</ToggleGroupItem>
                      <ToggleGroupItem value="reappear">Reappear</ToggleGroupItem>
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Examination Name */}
            <FormField
              control={form.control}
              name="examinationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Examination Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Mid Term Examination - Spring 2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date and Time */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* From Time */}
              <FormField
                control={form.control}
                name="fromTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Time</FormLabel>
                    <FormControl>
                      <TimePicker12Demo date={field.value} setDate={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* To Time */}
              <FormField
                control={form.control}
                name="toTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To Time</FormLabel>
                    <FormControl>
                      <TimePicker12Demo date={field.value} setDate={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Cloak Room Venue */}
            <FormField
              control={form.control}
              name="cloakRoomVenue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cloak Room Venue</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Room G-05, Academic Block" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mandatory Instructions */}
            <FormField
              control={form.control}
              name="mandatoryInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mandatory Instructions</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter any mandatory instructions for the examination...\nSeparate lines with Enter."
                      className="min-h-32"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    These instructions will be displayed on the seating plan.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Room Selection - RoomSelectionTable handles its own FormField integration */}
            <RoomSelectionTable />


            {/* Student Upload Cards */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Student Information (Upload CSV with one column of Student IDs)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddUpload}
                  className="flex items-center gap-2"
                  disabled={isGenerating} // Disable button while generating
                >
                  <Plus className="h-4 w-4" />
                  Add Branch/Subject Group
                </Button>
              </div>
              <div className="space-y-4">
                {(currentPlan?.studentUploads || []).map((upload, index) => (
                  <StudentUploadCard
                    key={index} // Consider a more stable key if uploads can be reordered significantly
                    data={upload}
                    // Pass specific handlers for branch/subject and file
                    onBranchSubjectChange={(bsData) => handleUploadChange(index, bsData)}
                    onFileChange={(file) => handleFileChange(index, file)}
                    onDelete={() => handleDeleteUpload(index)}
                    showDelete={(currentPlan?.studentUploads || []).length > 1}
                    disabled={isGenerating} // Disable card fields while generating
                  />
                ))}
              </div>
            </div>

          </fieldset>
          {/* Submit Button - Moved back outside fieldset */}
            
          <Button type="submit" className="w-full md:w-auto" disabled={isGenerating}>
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              "Generate Seating Plan"
            )}
          </Button>
           
          {/* Remove SeatingPlanPreview */}
          {/* {currentPlan && (
            <SeatingPlanPreview
              plan={currentPlan}
              open={previewOpen}
              onOpenChange={setPreviewOpen}
            />
          )} */}
        </form>
      </Form>
    </div>
  );
}

export default NewSeatingPlan;
