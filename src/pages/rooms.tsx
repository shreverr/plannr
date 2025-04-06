import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

type Room = {
  id: string
  name: string
  capacity: number
}

function RoomsManagement() {
  const [rooms, setRooms] = useState<Room[]>([])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n')
    //   const headers = lines[0].split(',').map(header => header.trim())
      
      const parsedRooms = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',').map(value => value.trim())
          return {
            id: values[0],
            name: values[1],
            capacity: parseInt(values[2], 10)
          }
        })

      setRooms(parsedRooms)
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <Card>
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
            />
            <div className="text-sm text-muted-foreground">
              CSV format: ID, Room Name, Capacity
            </div>
          </div>
        </CardContent>
      </Card>

      {rooms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Room List</CardTitle>
            <CardDescription>Uploaded rooms and their details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {rooms.map(room => (
                <div key={room.id} className="py-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{room.name}</div>
                    <div className="text-sm text-muted-foreground">Capacity: {room.capacity}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">ID: {room.id}</div>
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