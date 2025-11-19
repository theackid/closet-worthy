'use client'

import { useState } from 'react'
import { Package, Plus, Menu, X, LayoutDashboard } from 'lucide-react'
import Dashboard from '@/components/Dashboard'
import ItemList from '@/components/ItemList'
import ItemForm from '@/components/ItemForm'
import { ClosetItem } from '@/types'

type View = 'dashboard' | 'items'

export default function Home() {
  const [activeView, setActiveView] = useState<View>('dashboard')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<ClosetItem | undefined>()
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [itemsFilter, setItemsFilter] = useState<string>('all')

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

  function handleNavigateToItems(filter?: string) {
    setActiveView('items')
    setItemsFilter(filter || 'all')
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-effect border-b border-primary-100/50 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-accent-400 rounded-2xl flex items-center justify-center shadow-soft">
                <Package className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  Closet Worthy
                </h1>
                <p className="text-sm text-primary-400 font-medium">Where Your Wardrobe Comes to Life ✨</p>
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
                onClick={() => handleNavigateToItems('all')}
                icon={Package}
                label="Items"
              />
              <button
                onClick={handleAddNew}
                className="ml-4 btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Item
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-primary-100/50 py-4 space-y-2">
              <button
                onClick={() => {
                  setActiveView('dashboard')
                  setMobileMenuOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  activeView === 'dashboard'
                    ? 'bg-gradient-to-r from-primary-50 to-accent-50 text-primary-700 shadow-soft'
                    : 'text-gray-700 hover:bg-primary-50/50'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </button>
              <button
                onClick={() => {
                  handleNavigateToItems('all')
                  setMobileMenuOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  activeView === 'items'
                    ? 'bg-gradient-to-r from-primary-50 to-accent-50 text-primary-700 shadow-soft'
                    : 'text-gray-700 hover:bg-primary-50/50'
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
                className="w-full btn-primary flex items-center justify-center gap-3 py-3"
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
          <Dashboard onNavigateToItems={handleNavigateToItems} />
        ) : (
          <ItemList
            onEdit={handleEdit}
            refreshTrigger={refreshTrigger}
            initialFilter={itemsFilter}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-primary-100/50 mt-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-gray-500">
            Closet Worthy © 2024 • Where Your Wardrobe Comes to Life ✨
          </p>
        </div>
      </footer>

      {/* Floating Add Button (Mobile) */}
      {!showForm && (
        <button
          onClick={handleAddNew}
          className="md:hidden fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 text-white rounded-full shadow-soft-lg flex items-center justify-center hover:shadow-glow transition-all z-50 hover:scale-110"
        >
          <Plus className="w-7 h-7" />
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
      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all font-medium ${
        active
          ? 'bg-gradient-to-r from-primary-50 to-accent-50 text-primary-700 shadow-soft'
          : 'text-gray-700 hover:bg-primary-50/50'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  )
}
