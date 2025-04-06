import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function NewSeatingPlan() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Seating Plan</CardTitle>
        <CardDescription>Configure your seating arrangement settings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground">Configuration form coming soon...</div>
      </CardContent>
    </Card>
  );
}

export default NewSeatingPlan;
