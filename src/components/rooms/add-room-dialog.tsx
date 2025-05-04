import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { v4 as uuidv4 } from 'uuid'
import { Column } from "@/store/rooms.store"
import { Plus, Trash2 } from "lucide-react"

interface AddRoomDialogProps {
  onAdd: (room: { id: string; name: string; columns: Column[] }) => void
}

export function AddRoomDialog({ onAdd }: AddRoomDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [columns, setColumns] = useState<Column[]>([{ id: uuidv4(), rowCount: 1 }])

  const handleAddColumn = () => {
    setColumns([...columns, { id: uuidv4(), rowCount: 1 }])
  }

  const handleRemoveColumn = (id: string) => {
    if (columns.length > 1) {
      setColumns(columns.filter(col => col.id !== id))
    }
  }

  const handleColumnChange = (id: string, rowCount: number) => {
    setColumns(columns.map(col => 
      col.id === id ? { ...col, rowCount } : col
    ))
  }

  const handleSubmit = () => {
    if (name.trim() && columns.length > 0) {
      onAdd({
        id: uuidv4(),
        name: name.trim(),
        columns
      })
      setOpen(false)
      setName('')
      setColumns([{ id: uuidv4(), rowCount: 1 }])
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Room</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Room</DialogTitle>
          <DialogDescription>
            Enter the details for the new room
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Room Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="block mb-2">Columns Configuration</Label>
            {columns.map((column, index) => (
              <div key={column.id} className="flex items-center gap-2">
                <Label className="w-24 text-right">Column {index + 1}</Label>
                <Input
                  type="number"
                  min="1"
                  value={column.rowCount}
                  onChange={(e) => handleColumnChange(column.id, parseInt(e.target.value) || 1)}
                  className="flex-1"
                  placeholder="Number of rows"
                />
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleRemoveColumn(column.id)}
                  disabled={columns.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={handleAddColumn}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Column
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Add Room</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}