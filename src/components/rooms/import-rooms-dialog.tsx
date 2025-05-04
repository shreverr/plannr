import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Column } from "@/store/rooms.store"

interface ImportRoomsDialogProps {
  rooms: Array<{ id: string; name: string; columns: Column[] }>
  open: boolean
  onConfirm: (rooms: Array<{ id: string; name: string; columns: Column[] }>) => void
  onCancel: () => void
}

export function ImportRoomsDialog({ rooms, open, onConfirm, onCancel }: ImportRoomsDialogProps) {
  const calculateCapacity = (columns: Column[]) => {
    return columns.reduce((total, col) => total + col.rowCount, 0)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Rooms</DialogTitle>
          <DialogDescription>
            Review the rooms that will be imported
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[300px] overflow-y-auto">
          {rooms.map((room) => (
            <div key={room.id} className="py-2 border-b">
              <div className="font-medium">{room.name}</div>
              <div className="text-sm text-muted-foreground">
                Columns: {room.columns.length} | Rows per column: {room.columns.map(col => col.rowCount).join(', ')}
              </div>
              <div className="text-sm text-muted-foreground">
                Total capacity: {calculateCapacity(room.columns)} seats
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={() => onConfirm(rooms)}>Import {rooms.length} Rooms</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}