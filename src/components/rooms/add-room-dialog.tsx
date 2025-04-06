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
import { v4 as uuidv4 } from 'uuid'

type AddRoomDialogProps = {
  onAdd: (newRoom: Room) => void
}

export function AddRoomDialog({ onAdd }: AddRoomDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [rows, setRows] = useState(1)
  const [columns, setColumns] = useState(1)
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

  const handleAdd = () => {
    if (validateForm()) {
      onAdd({
        id: uuidv4(),
        name,
        rows,
        columns,
      })
      setOpen(false)
      // Reset form
      setName('')
      setRows(1)
      setColumns(1)
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
        <Button>Add Room</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Room</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={handleNameChange}
              className="col-span-3"
            />
            {errors.name && (
              <div className="col-start-2 col-span-3 text-sm text-red-500">
                {errors.name}
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rows" className="text-right">
              Rows
            </Label>
            <Input
              id="rows"
              type="number"
              value={rows}
              onChange={handleRowsChange}
              className="col-span-3"
              min={1}
            />
            {errors.rows && (
              <div className="col-start-2 col-span-3 text-sm text-red-500">
                {errors.rows}
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="columns" className="text-right">
              Columns
            </Label>
            <Input
              id="columns"
              type="number"
              value={columns}
              onChange={handleColumnsChange}
              className="col-span-3"
              min={1}
            />
            {errors.columns && (
              <div className="col-start-2 col-span-3 text-sm text-red-500">
                {errors.columns}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>Add Room</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}