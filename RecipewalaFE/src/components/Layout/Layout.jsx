import { Outlet } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toggleSidebar } from '../../features/ui/uiSlice'
import Header from './Header'
import Sidebar from './Sidebar'

const Layout = () => {
  const { sidebarOpen } = useSelector((state) => state.ui)
  const dispatch = useDispatch()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <Header />
        
        {/* Page content */}
        <main className="p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout