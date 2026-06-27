import { useState } from "react"
import { StudentEventsList } from "@/components/student part/student-events"

interface PublishedEvent {
  id: string
  title: string
  description: string
  starts_at: string
  ends_at?: string
  capacity: number
  location?: string
  status: "PUBLISHED"
  published_at: string
  participants: string[] // student IDs
  waitlist: string[] // student IDs
}

// interface Student {
//   id: string
//   name: string
// }

export const StudentEventsPage = () => {
  const [events, setEvents] = useState<PublishedEvent[]>([
    {
      id: "event-1",
      title: "Frontend Workshop",
      description: "Learn React",
      starts_at: "2026-07-15T18:30:00",
      capacity: 50,
      status: "PUBLISHED",
      published_at: new Date().toISOString(),
      participants: [],
      waitlist: [],
    },
  ])
  const currentStudentId = "student-123"

  const handleRegister = (eventId: string, studentId: string) => {
    setEvents(
      events.map((e) =>
        e.id === eventId && e.participants.length < e.capacity
          ? { ...e, participants: [...e.participants, studentId] }
          : e
      )
    )
  }

  const handleJoinWaitlist = (eventId: string, studentId: string) => {
    setEvents(
      events.map((e) =>
        e.id === eventId && !e.waitlist.includes(studentId)
          ? { ...e, waitlist: [...e.waitlist, studentId] }
          : e
      )
    )
  }

  const handleCancel = (eventId: string, studentId: string) => {
    setEvents(
      events.map((e) =>
        e.id === eventId
          ? {
              ...e,
              participants: e.participants.filter((id) => id !== studentId),
              waitlist: e.waitlist.filter((id) => id !== studentId),
            }
          : e
      )
    )
  }

  return (
    <StudentEventsList
      events={events}
      currentStudentId={currentStudentId}
      onRegister={handleRegister}
      onJoinWaitlist={handleJoinWaitlist}
      onCancel={handleCancel}
    />
  )
}
