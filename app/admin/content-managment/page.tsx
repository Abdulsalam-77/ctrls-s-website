import ContentManagement from "@/components/admin/content-management"

export default function ContentManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-montserrat text-3xl font-extrabold text-primary-purple">Content Management</h1>
      </div>
      <ContentManagement />
    </div>
  )
}
