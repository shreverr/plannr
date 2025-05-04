import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Column = {
  id: string;
  rowCount: number;
}

export type Room = {
  id: string;
  name: string;
  columns: Column[];
}

type RoomStore = {
  rooms: Room[];
  addRooms: (newRooms: Room[]) => void;
  getRooms: () => Room[];
  clearRooms: () => void;
  removeRoomById: (id: string) => void;
  updateRoom: (updatedRoom: Room) => void;
}

const useRoomStore = create<RoomStore>()(
  persist(
    (set, get) => ({
      rooms: [],
      addRooms: (newRooms) => set((state) => ({
        rooms: [...state.rooms, ...newRooms]
      })),
      getRooms: () => get().rooms,
      clearRooms: () => set({ rooms: [] }),
      removeRoomById: (id) => set((state) => ({
        rooms: state.rooms.filter(room => room.id !== id)
      })),
      updateRoom: (updatedRoom) => set((state) => ({
        rooms: state.rooms.map(room => 
          room.id === updatedRoom.id ? updatedRoom : room
        )
      })),
    }),
    {
      name: 'room-storage', // Storage key
    }
  )
)

export default useRoomStore
