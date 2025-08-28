import StudentManagement from "@/components/admin/student-management"

export default function StudentManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-montserrat text-3xl font-extrabold text-primary-purple">Student Management</h1>
      </div>
      <StudentManagement />
    </div>
  )
}
