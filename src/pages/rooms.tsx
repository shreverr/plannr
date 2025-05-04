import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import useRoomStore, { Column } from "@/store/rooms.store"
import { Button } from "@/components/ui/button"
import { v4 as uuidv4 } from 'uuid'
import { EditRoomDialog } from "@/components/rooms/edit-room-dialog"
import { ImportRoomsDialog } from "@/components/rooms/import-rooms-dialog"
import { AddRoomDialog } from "@/components/rooms/add-room-dialog"
import { useState } from "react"

function RoomsManagement() {
  const { rooms, addRooms, removeRoomById, updateRoom, clearRooms } = useRoomStore()
  const [importRooms, setImportRooms] = useState<Array<{ id: string; name: string; columns: Column[] }>>([])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n')
      
      // Parse CSV format: Room Name, Col1 Rows, Col2 Rows, Col3 Rows, ...
      const parsedRooms = lines
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',').map(value => value.trim())
          const roomName = values[0]
          
          // Create columns from the remaining values
          const columns: Column[] = values.slice(1)
            .filter(val => val && !isNaN(parseInt(val, 10)))
            .map(rowCount => ({
              id: uuidv4(),
              rowCount: parseInt(rowCount, 10)
            }))
          
          return {
            id: uuidv4(),
            name: roomName,
            columns
          }
        })
        .filter(room => room.name && room.columns.length > 0)

      setImportRooms(parsedRooms)
    }
    reader.readAsText(file)
  }

  // Calculate total capacity of a room
  const calculateCapacity = (columns: Column[]) => {
    return columns.reduce((total, col) => total + col.rowCount, 0)
  }

  return (
    <div className="space-y-6">
      <ImportRoomsDialog
        rooms={importRooms}
        open={importRooms.length > 0}
        onConfirm={(rooms) => {
          addRooms(rooms)
          setImportRooms([])
        }}
        onCancel={() => setImportRooms([])}
      />
      <div className="flex justify-between items-start gap-6">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Upload Rooms</CardTitle>
            <CardDescription>Upload a CSV file containing room information</CardDescription>
          </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-violet-50 file:text-violet-700
                hover:file:bg-violet-100"
              key={importRooms.length > 0 ? 'uploading' : 'cleared'}
            />
            <div className="text-sm text-muted-foreground">
              CSV format: Room Name, Col1 Rows, Col2 Rows, Col3 Rows, ...
            </div>
          </div>
        </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Add Room Manually</CardTitle>
            <CardDescription>Create a new room by entering its details</CardDescription>
          </CardHeader>
          <CardContent>
            <AddRoomDialog onAdd={(room) => addRooms([room])} />
          </CardContent>
        </Card>
      </div>

      {rooms.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Room List</CardTitle>
                <CardDescription>Uploaded rooms and their details</CardDescription>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete all rooms? This action cannot be undone.')) {
                    clearRooms()
                  }
                }}
              >
                Delete All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {[...rooms].sort((a, b) => a.name.localeCompare(b.name)).map(room => (
                <div key={room.id} className="py-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{room.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Columns: {room.columns.length} | Rows per column: {room.columns.map(col => col.rowCount).join(', ')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total capacity: {calculateCapacity(room.columns)} seats
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <EditRoomDialog room={room} onSave={updateRoom} />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeRoomById(room.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default RoomsManagement