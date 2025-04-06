import React from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Room } from "@/store/rooms.store";
import { Label } from "@/components/ui/label";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import useRoomStore from "@/store/rooms.store";
import { Checkbox } from "@/components/ui/checkbox";

export function RoomSelectionTable() {
  const { rooms } = useRoomStore();
  const form = useFormContext();

  if (rooms.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No rooms available. Please add rooms in the Rooms Management page.
      </div>
    );
  }

  return (
    <FormField
      control={form.control}
      name="selectedRooms"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Select Examination Rooms</FormLabel>
          <FormControl>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={rooms.length > 0 && (field.value || []).length === rooms.length}
                      onCheckedChange={(checked) => {
                        const newValue = checked ? rooms.map(room => room.id) : [];
                        field.onChange(newValue);
                      }}
                      className="mt-1"
                    />
                  </TableHead>
                  <TableHead>Room Name</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead>Capacity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="w-[50px]">
                      <Checkbox
                        checked={(field.value || []).includes(room.id)}
                        onCheckedChange={(checked) => {
                          const currentValue = field.value || [];
                          const newValue = checked
                            ? [...currentValue, room.id]
                            : currentValue.filter((id: string) => id !== room.id);
                          field.onChange(newValue);
                        }}
                        id={room.id}
                        className="mt-1"
                      />
                    </TableCell>
                    <TableCell>
                      <Label htmlFor={room.id}>{room.name}</Label>
                    </TableCell>
                    <TableCell>
                      {room.rows} × {room.columns}
                    </TableCell>
                    <TableCell>
                      {room.rows * room.columns} seats
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}