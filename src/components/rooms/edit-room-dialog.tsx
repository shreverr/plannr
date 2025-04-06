import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Room } from "@/store/rooms.store"
import { useState } from "react"

type EditRoomDialogProps = {
  room: Room
  onSave: (updatedRoom: Room) => void
}

export function EditRoomDialog({ room, onSave }: EditRoomDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(room.name)
  const [rows, setRows] = useState(room.rows)
  const [columns, setColumns] = useState(room.columns)
  const [errors, setErrors] = useState({
    name: '',
    rows: '',
    columns: ''
  })

  const validateForm = () => {
    const newErrors = {
      name: '',
      rows: '',
      columns: ''
    }

    if (!name.trim()) {
      newErrors.name = 'Room name is required'
    }

    if (rows < 1) {
      newErrors.rows = 'Rows must be at least 1'
    }

    if (columns < 1) {
      newErrors.columns = 'Columns must be at least 1'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        ...room,
        name,
        rows,
        columns,
      })
      setOpen(false)
    }
  }

  const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    setRows(value)
    if (value < 1) {
      setErrors(prev => ({ ...prev, rows: 'Rows must be at least 1' }))
    } else {
      setErrors(prev => ({ ...prev, rows: '' }))
    }
  }

  const handleColumnsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    setColumns(value)
    if (value < 1) {
      setErrors(prev => ({ ...prev, columns: 'Columns must be at least 1' }))
    } else {
      setErrors(prev => ({ ...prev, columns: '' }))
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setName(value)
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, name: 'Room name is required' }))
    } else {
      setErrors(prev => ({ ...prev, name: '' }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Room</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <div className="col-span-3">
              <Input
                id="name"
                value={name}
                onChange={handleNameChange}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rows" className="text-right">Rows</Label>
            <div className="col-span-3">
              <Input
                id="rows"
                type="number"
                min="1"
                value={rows}
                onChange={handleRowsChange}
                className={errors.rows ? 'border-red-500' : ''}
              />
              {errors.rows && <p className="text-red-500 text-sm mt-1">{errors.rows}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="columns" className="text-right">Columns</Label>
            <div className="col-span-3">
              <Input
                id="columns"
                type="number"
                min="1"
                value={columns}
                onChange={handleColumnsChange}
                className={errors.columns ? 'border-red-500' : ''}
              />
              {errors.columns && <p className="text-red-500 text-sm mt-1">{errors.columns}</p>}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={Object.values(errors).some(error => error !== '')}
          >
            Save changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}