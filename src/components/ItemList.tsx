'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ClosetItem } from '@/types'
import { Package, Edit2, Trash2, Search } from 'lucide-react'
import ItemDetail from '@/components/ItemDetail'

interface ItemListProps {
  onEdit: (item: ClosetItem) => void
  refreshTrigger: number
  initialFilter?: string
}

type FilterType = 'all' | 'keep' | 'sell' | 'donate' | 'no-photos' | 'no-pricing'

export default function ItemList({ onEdit, refreshTrigger, initialFilter = 'all' }: ItemListProps) {
  const [items, setItems] = useState<ClosetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [viewingItem, setViewingItem] = useState<ClosetItem | null>(null)

  // Set initial filter when passed from dashboard
  useEffect(() => {
    if (initialFilter) {
      setActiveFilter(initialFilter as FilterType)
    }
  }, [initialFilter])

  useEffect(() => {
    loadItems()
  }, [refreshTrigger])

  async function loadItems() {
    try {
      const { data, error } = await supabase
        .from('closet_items')
        .select(`
          *,
          brand:brands(name),
          category:categories(name),
          condition:conditions(label)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error loading items:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const { error } = await supabase
        .from('closet_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadItems()
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const filteredItems = items.filter(item => {
    // Search filter
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = !searchQuery || 
      item.item_name.toLowerCase().includes(searchLower) ||
      item.brand?.name?.toLowerCase().includes(searchLower) ||
      item.category?.name?.toLowerCase().includes(searchLower) ||
      item.colour?.toLowerCase().includes(searchLower)

    if (!matchesSearch) return false

    // Status filters
    switch (activeFilter) {
      case 'keep':
        return item.status === 'Keep'
      case 'sell':
        return item.status === 'Sell'
      case 'donate':
        return item.status === 'Donate'
      case 'no-photos':
        return !item.photo_urls || item.photo_urls.length === 0
      case 'no-pricing':
        return !item.retail_price_cad || !item.resale_price_cad
      default:
        return true
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-primary-400">Loading your items... ✨</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
          Your Closet
        </h2>
        <span className="text-2xl">👗</span>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-300 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, brand, category, colour..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-primary-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <FilterButton
            active={activeFilter === 'all'}
            onClick={() => setActiveFilter('all')}
            label="All"
          />
          <FilterButton
            active={activeFilter === 'keep'}
            onClick={() => setActiveFilter('keep')}
            label="Keep"
          />
          <FilterButton
            active={activeFilter === 'sell'}
            onClick={() => setActiveFilter('sell')}
            label="Sell"
          />
          <FilterButton
            active={activeFilter === 'donate'}
            onClick={() => setActiveFilter('donate')}
            label="Donate"
          />
          <FilterButton
            active={activeFilter === 'no-photos'}
            onClick={() => setActiveFilter('no-photos')}
            label="No Photos"
          />
          <FilterButton
            active={activeFilter === 'no-pricing'}
            onClick={() => setActiveFilter('no-pricing')}
            label="No Pricing"
          />
        </div>
      </div>

      {/* Items Count */}
      <div className="text-sm text-primary-400 font-medium">
        Showing {filteredItems.length} of {items.length} items ✨
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 card-soft">
          <Package className="w-16 h-16 text-primary-200 mx-auto mb-4" />
          <p className="text-primary-400">No items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onView={() => setViewingItem(item)}
              onEdit={() => onEdit(item)}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </div>
      )}

      {/* Item Detail Modal */}
      {viewingItem && (
        <ItemDetail
          item={viewingItem}
          onClose={() => setViewingItem(null)}
          onEdit={() => {
            setViewingItem(null)
            onEdit(viewingItem)
          }}
        />
      )}
    </div>
  )
}

interface FilterButtonProps {
  active: boolean
  onClick: () => void
  label: string
}

function FilterButton({ active, onClick, label }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 ${
        active
          ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-soft hover:shadow-glow'
          : 'bg-white/80 backdrop-blur-sm text-gray-700 border-2 border-primary-100 hover:border-primary-200 hover:bg-primary-50/50'
      }`}
    >
      {label}
    </button>
  )
}

interface ItemCardProps {
  item: ClosetItem
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

function ItemCard({ item, onView, onEdit, onDelete }: ItemCardProps) {
  const photoUrl = item.photo_urls && item.photo_urls.length > 0 ? item.photo_urls[0] : null
  const statusStyles = {
    Keep: 'bg-gradient-to-r from-lavender-100 to-lavender-200 text-lavender-700 border-lavender-200',
    Sell: 'bg-gradient-to-r from-accent-100 to-accent-200 text-accent-700 border-accent-200',
    Donate: 'bg-gradient-to-r from-peach-100 to-peach-200 text-peach-700 border-peach-200',
  }

  return (
    <div 
      className="card-soft overflow-hidden hover:scale-105 hover:shadow-glow transition-all duration-300 group cursor-pointer"
      onClick={onView}
    >
      {/* Photo */}
      <div className="aspect-square bg-gradient-to-br from-cream-100 to-primary-50 relative overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={item.item_name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-20 h-20 text-primary-200" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 backdrop-blur-sm ${statusStyles[item.status || 'Keep']}`}>
            {item.status || 'Keep'}
          </span>
        </div>
        {item.photo_urls && item.photo_urls.length > 1 && (
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-gray-700">
            {item.photo_urls.length} photos
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 mb-1.5 line-clamp-2 text-lg">{item.item_name}</h3>
        <p className="text-sm text-primary-500 mb-3 font-medium">
          {item.brand?.name || 'Unknown Brand'}
          {item.size && ` • ${item.size}`}
        </p>
        
        <div className="flex items-center justify-between text-xs mb-3 text-gray-500">
          <span className="bg-cream-100 px-2 py-1 rounded-lg">
            {item.category?.name || 'Uncategorized'}
          </span>
          <span className="bg-lavender-100 px-2 py-1 rounded-lg">
            {item.condition?.label || 'N/A'}
          </span>
        </div>

        {/* Pricing */}
        <div className="border-t border-primary-100 pt-3 mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Retail:</span>
            <span className="font-semibold text-gray-900">
              {item.retail_price_cad ? `$${item.retail_price_cad.toFixed(0)}` : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Resale:</span>
            <span className="font-semibold bg-gradient-to-r from-accent-500 to-accent-600 bg-clip-text text-transparent">
              {item.resale_price_cad ? `$${item.resale_price_cad.toFixed(0)}` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl hover:shadow-glow transition-all text-sm font-medium"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="px-4 py-2.5 border-2 border-primary-200 text-primary-600 rounded-xl hover:bg-primary-50 hover:border-primary-300 transition-all text-sm"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
