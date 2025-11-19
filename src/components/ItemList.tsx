'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ClosetItem } from '@/types'
import { Edit2, Trash2, Search, Filter, Package } from 'lucide-react'

interface ItemListProps {
  onEdit: (item: ClosetItem) => void
  refreshTrigger?: number
}

type FilterType = 'all' | 'keep' | 'sell' | 'donate' | 'no-photos' | 'no-pricing'

export default function ItemList({ onEdit, refreshTrigger }: ItemListProps) {
  const [items, setItems] = useState<ClosetItem[]>([])
  const [filteredItems, setFilteredItems] = useState<ClosetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  useEffect(() => {
    loadItems()
  }, [refreshTrigger])

  useEffect(() => {
    applyFilters()
  }, [items, searchQuery, activeFilter])

  async function loadItems() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('closet_items')
        .select(`
          *,
          brand:brands(name),
          category:categories(name),
          subcategory:subcategories(name),
          condition:conditions(label, score)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Load items error:', error)
    } finally {
      setLoading(false)
    }
  }

  function applyFilters() {
    let filtered = [...items]

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.item_name.toLowerCase().includes(query) ||
        item.brand?.name?.toLowerCase().includes(query) ||
        item.category?.name?.toLowerCase().includes(query) ||
        item.colour?.toLowerCase().includes(query)
      )
    }

    // Apply filter
    switch (activeFilter) {
      case 'keep':
        filtered = filtered.filter(item => item.status === 'Keep')
        break
      case 'sell':
        filtered = filtered.filter(item => item.status === 'Sell')
        break
      case 'donate':
        filtered = filtered.filter(item => item.status === 'Donate')
        break
      case 'no-photos':
        filtered = filtered.filter(item => !item.photo_urls || item.photo_urls.length === 0)
        break
      case 'no-pricing':
        filtered = filtered.filter(item => !item.retail_price_cad || !item.resale_price_cad)
        break
    }

    setFilteredItems(filtered)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const { error } = await supabase
        .from('closet_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadItems()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete item')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading items...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Closet Items</h2>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, brand, category, colour..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
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
      <div className="text-sm text-gray-600">
        Showing {filteredItems.length} of {items.length} items
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onEdit={() => onEdit(item)}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </div>
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
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        active
          ? 'bg-primary-600 text-white'
          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  )
}

interface ItemCardProps {
  item: ClosetItem
  onEdit: () => void
  onDelete: () => void
}

function ItemCard({ item, onEdit, onDelete }: ItemCardProps) {
  const photoUrl = item.photo_urls && item.photo_urls.length > 0 ? item.photo_urls[0] : null
  const statusColors = {
    Keep: 'bg-blue-100 text-blue-800',
    Sell: 'bg-green-100 text-green-800',
    Donate: 'bg-purple-100 text-purple-800',
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Photo */}
      <div className="aspect-square bg-gray-100 relative">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={item.item_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-300" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[item.status || 'Keep']}`}>
            {item.status || 'Keep'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{item.item_name}</h3>
        <p className="text-sm text-gray-600 mb-2">
          {item.brand?.name || 'Unknown Brand'}
          {item.size && ` • ${item.size}`}
        </p>
        
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">
            {item.category?.name || 'Uncategorized'}
          </span>
          <span className="text-gray-600">
            {item.condition?.label || 'N/A'}
          </span>
        </div>

        {/* Pricing */}
        <div className="border-t pt-3 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Retail:</span>
            <span className="font-semibold text-gray-900">
              {item.retail_price_cad ? `$${item.retail_price_cad.toFixed(0)}` : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Resale:</span>
            <span className="font-semibold text-green-600">
              {item.resale_price_cad ? `$${item.resale_price_cad.toFixed(0)}` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 text-sm"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
