'use client'

import { useState } from 'react'
import Dashboard from '@/components/Dashboard'
import ItemList from '@/components/ItemList'
import ItemForm from '@/components/ItemForm'
import { ClosetItem } from '@/types'
import { LayoutDashboard, Package, Plus, Menu, X } from 'lucide-react'

type View = 'dashboard' | 'items'

export default function Home() {
  const [activeView, setActiveView] = useState<View>('dashboard')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<ClosetItem | undefined>()
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  function handleAddNew() {
    setEditingItem(undefined)
    setShowForm(true)
  }

  function handleEdit(item: ClosetItem) {
    setEditingItem(item)
    setShowForm(true)
  }

  function handleSave() {
    setShowForm(false)
    setEditingItem(undefined)
    setRefreshTrigger(prev => prev + 1)
  }

  function handleCancel() {
    setShowForm(false)
    setEditingItem(undefined)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Closet Worthy</h1>
                <p className="text-xs text-gray-500">AI-Powered Closet Management</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <NavButton
                active={activeView === 'dashboard'}
                onClick={() => setActiveView('dashboard')}
                icon={LayoutDashboard}
                label="Dashboard"
              />
              <NavButton
                active={activeView === 'items'}
                onClick={() => setActiveView('items')}
                icon={Package}
                label="Items"
              />
              <button
                onClick={handleAddNew}
                className="ml-4 flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Item
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
              <button
                onClick={() => {
                  setActiveView('dashboard')
                  setMobileMenuOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                  activeView === 'dashboard'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </button>
              <button
                onClick={() => {
                  setActiveView('items')
                  setMobileMenuOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                  activeView === 'items'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Package className="w-5 h-5" />
                Items
              </button>
              <button
                onClick={() => {
                  handleAddNew()
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="w-5 h-5" />
                Add Item
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showForm ? (
          <ItemForm
            item={editingItem}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : activeView === 'dashboard' ? (
          <Dashboard />
        ) : (
          <ItemList
            onEdit={handleEdit}
            refreshTrigger={refreshTrigger}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Closet Worthy © 2024 • AI-Powered Closet Management
          </p>
        </div>
      </footer>

      {/* Floating Add Button (Mobile) */}
      {!showForm && (
        <button
          onClick={handleAddNew}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 transition-colors z-50"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  )
}

interface NavButtonProps {
  active: boolean
  onClick: () => void
  icon: any
  label: string
}

function NavButton({ active, onClick, icon: Icon, label }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
        active
          ? 'bg-primary-50 text-primary-700 font-medium'
          : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  )
}
