import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileInput } from "@/components/ui/file-input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { TimePicker12Demo } from "@/components/time-picker-demo";

// Define form validation schema
const formSchema = z.object({
  examinationName: z.string().min(2, { message: "Examination name is required" }),
  date: z.string().min(1, { message: "Examination date is required" }),
  fromTime: z.date({ required_error: "Start time is required" }),
  toTime: z.date({ required_error: "End time is required" }),
  cloakRoomVenue: z.string().min(2, { message: "Cloak room venue is required" }),
  mandatoryInstructions: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function NewSeatingPlan() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      examinationName: "",
      date: "",
      fromTime: new Date(new Date().setHours(9, 0, 0, 0)),
      toTime: new Date(new Date().setHours(12, 0, 0, 0)),
      cloakRoomVenue: "",
      mandatoryInstructions: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    // Handle form submission
    console.log("Form data:", data);
    console.log("CSV file:", csvFile);
    // Here you would typically send the data to your backend
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold leading-none">Create New Seating Plan</h1>
        <p className="text-sm text-muted-foreground mt-1.5">Configure your seating arrangement settings</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

          {/* CSV Upload */}
          <div className="space-y-2">
            <Label htmlFor="csvUpload">Upload Students CSV</Label>
            <FileInput 
              id="csvUpload"
              accept=".csv"
              onFileSelect={setCsvFile}
            />
            <p className="text-sm text-muted-foreground">
              Upload a CSV file containing student information.
            </p>
            {csvFile && (
              <p className="text-sm text-green-600">
                File selected: {csvFile.name}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full md:w-auto">
            Create Seating Plan
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default NewSeatingPlan;
