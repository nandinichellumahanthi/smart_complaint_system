export const STATUSES = ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Escalated'] as const
export type Status = (typeof STATUSES)[number]
export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const
export type Priority = (typeof PRIORITIES)[number]
export type Role = 'student' | 'faculty' | 'admin'
export interface Person { _id: string; name: string; email: string; department?: string; rollNo?: string; registered?: boolean }
export type User = Person & { role: Role }
export interface Comment { by: string; role: string; text: string; at: string }
export interface Complaint {
  _id: string; code: string; title: string; description: string; category: string; location: string
  priority: Priority; status: Status; evidence?: string; student: Person; assignedTo: Person | null
  comments: Comment[]; createdAt: string
}
export interface Category { _id: string; name: string; department: string; faculty: Person | null }
