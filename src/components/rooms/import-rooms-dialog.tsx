import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

type Room = {
  id: string
  name: string
  rows: number
  columns: number
}

type ImportRoomsDialogProps = {
  rooms: Room[]
  onConfirm: (rooms: Room[]) => void
  onCancel: () => void
  open: boolean
}

export function ImportRoomsDialog({ rooms, onConfirm, onCancel, open }: ImportRoomsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Rooms</DialogTitle>
          <DialogDescription>
            Review the rooms to be imported. Click confirm to add these rooms.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          <div className="space-y-4">
            {rooms.map((room, index) => (
              <div key={index} className="space-y-1">
                <h4 className="font-medium">{room.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Size: {room.rows} x {room.columns}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(rooms)}>
            Confirm Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}