import { redirect } from 'next/navigation'
import { requireAuth } from '@helpers/auth'
import { isUserAdmin } from '@lib/auth/admin'
import { AdminSidebar } from '@components/admin/sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()

  const admin = await isUserAdmin(user.id)
  if (!admin) {
    redirect('/')
  }

  return (
    <div className='mx-auto max-w-7xl px-4 py-8'>
      <div className='flex flex-col md:flex-row md:gap-8'>
        <AdminSidebar />
        <main className='min-w-0 flex-1'>{children}</main>
      </div>
    </div>
  )
}
