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
import useSeatingPlanStore from "@/store/seating-plan.store";
import { useEffect, useState } from "react";
import { SeatingPlanPreview } from "@/components/seating-plan/seating-plan-preview";

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
  useEffect(() => {
    window.ipcRenderer.generateSeatingP({}).then((response: any) => {
    });
  }, []);

  const { currentPlan, addSeatingPlan, addStudentUpload, updateStudentUpload, deleteStudentUpload, setCurrentPlan } = useSeatingPlanStore();
  const [previewOpen, setPreviewOpen] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
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

  useEffect(() => {
    if (currentPlan) {
      const currentValues = form.getValues();
      form.reset({
        examinationName: currentValues.examinationName || currentPlan.examinationName,
        date: currentValues.date || currentPlan.date,
        fromTime: currentValues.fromTime || currentPlan.fromTime,
        toTime: currentValues.toTime || currentPlan.toTime,
        cloakRoomVenue: currentValues.cloakRoomVenue || currentPlan.cloakRoomVenue,
        mandatoryInstructions: currentValues.mandatoryInstructions || currentPlan.mandatoryInstructions,
        examType: currentValues.examType || currentPlan.examType,
        selectedRooms: currentValues.selectedRooms || currentPlan.selectedRooms,
      });
    }
  }, [currentPlan, form]);

  const onSubmit = (data: FormValues) => {
    const seatingPlan = {
      ...data,
      studentUploads: currentPlan?.studentUploads || []
    };
    addSeatingPlan(seatingPlan);
    setCurrentPlan(seatingPlan);
    setPreviewOpen(true);
  };

  const handleAddUpload = () => {
    addStudentUpload();
  };

  const handleDeleteUpload = (index: number) => {
    deleteStudentUpload(index);
  };

  const handleUploadChange = (index: number, data: any) => {
    updateStudentUpload(index, data);
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold leading-none">Create New Seating Plan</h1>
        <p className="text-sm text-muted-foreground mt-1.5">Configure your seating arrangement settings</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

          <div className="grid gap-6 md:grid-cols-2">
            {/* Examination Name */}
            <FormField
              control={form.control}
              name="examinationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Examination Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. ETE " {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Cloak Room Venue */}
            <FormField
              control={form.control}
              name="cloakRoomVenue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cloak Room Venue</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Main Hall" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Examination Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Examination Date</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="DD-MM-YYYY"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Examination Time */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="fromTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <TimePicker12Demo date={field.value} setDate={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="toTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <TimePicker12Demo date={field.value} setDate={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Mandatory Instructions */}
          <FormField
            control={form.control}
            name="mandatoryInstructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mandatory Instructions</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter any mandatory instructions for the examination..."
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

          {/* Room Selection */}
          <div className="space-y-2">
            <RoomSelectionTable />
          </div>

          {/* Student Upload Cards */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Student Information</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddUpload}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Branch
              </Button>
            </div>
            <div className="space-y-4">
              {(currentPlan?.studentUploads || []).map((upload, index) => (
                <StudentUploadCard
                  key={index}
                  data={upload}
                  onChange={(data) => handleUploadChange(index, data)}
                  onDelete={() => handleDeleteUpload(index)}
                  showDelete={(currentPlan?.studentUploads || []).length > 1}
                />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full md:w-auto">
            Generate Seating Plan
          </Button>
          {currentPlan && (
            <SeatingPlanPreview
              plan={currentPlan}
              open={previewOpen}
              onOpenChange={setPreviewOpen}
            />
          )}
        </form>
      </Form>
    </div>
  );
}

export default NewSeatingPlan;
