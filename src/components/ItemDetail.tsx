'use client'

import { X, Edit2, ChevronLeft, ChevronRight } from 'lucide-react'
import { ClosetItem } from '@/types'
import { useState } from 'react'

interface ItemDetailProps {
  item: ClosetItem
  onClose: () => void
  onEdit: () => void
}

export default function ItemDetail({ item, onClose, onEdit }: ItemDetailProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const photos = item.photo_urls || []
  const hasPhotos = photos.length > 0

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  const statusStyles = {
    Keep: 'bg-gradient-to-r from-lavender-100 to-lavender-200 text-lavender-700 border-lavender-200',
    Sell: 'bg-gradient-to-r from-accent-100 to-accent-200 text-accent-700 border-accent-200',
    Donate: 'bg-gradient-to-r from-peach-100 to-peach-200 text-peach-700 border-peach-200',
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-soft-lg">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-primary-100 p-6 flex items-center justify-between rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              {item.item_name}
            </h2>
            <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 ${statusStyles[item.status || 'Keep']}`}>
              {item.status || 'Keep'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-50 rounded-xl transition-all text-primary-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image Gallery */}
          {hasPhotos && (
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-cream-100 to-primary-50 rounded-3xl overflow-hidden">
                <img
                  src={photos[currentPhotoIndex]}
                  alt={`${item.item_name} - Photo ${currentPhotoIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Photo Navigation */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-soft hover:bg-white transition-all"
                  >
                    <ChevronLeft className="w-6 h-6 text-primary-600" />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-soft hover:bg-white transition-all"
                  >
                    <ChevronRight className="w-6 h-6 text-primary-600" />
                  </button>

                  {/* Photo Counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-soft">
                    <p className="text-sm font-medium text-gray-700">
                      {currentPhotoIndex + 1} / {photos.length}
                    </p>
                  </div>
                </>
              )}

              {/* Thumbnail Strip */}
              {photos.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        index === currentPhotoIndex
                          ? 'border-primary-400 scale-105'
                          : 'border-primary-100 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={photo}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="Brand" value={item.brand?.name || 'Unknown'} />
            <DetailItem label="Category" value={item.category?.name || 'Uncategorized'} />
            <DetailItem label="Size" value={item.size || 'N/A'} />
            <DetailItem label="Condition" value={item.condition?.label || 'N/A'} />
            {item.colour && (
              <DetailItem label="Colour" value={item.colour} />
            )}
          </div>

          {/* Pricing */}
          <div className="card-soft p-6 bg-gradient-to-br from-cream-50 to-primary-50">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Pricing 💰</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Retail Price (CAD)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {item.retail_price_cad ? `$${item.retail_price_cad.toFixed(0)}` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Resale Price (CAD)</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-accent-500 to-accent-600 bg-clip-text text-transparent">
                  {item.resale_price_cad ? `$${item.resale_price_cad.toFixed(0)}` : 'N/A'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600 mb-1">Est. Resale Value (CAD)</p>
                <p className="text-xl font-semibold text-gray-700">
                  {item.estimated_resale_value_cad ? `$${item.estimated_resale_value_cad.toFixed(0)}` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={onEdit}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3"
          >
            <Edit2 className="w-5 h-5" />
            Edit Item
          </button>
        </div>
      </div>
    </div>
  )
}

interface DetailItemProps {
  label: string
  value: string
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="p-4 rounded-2xl bg-white border-2 border-primary-100">
      <p className="text-xs text-gray-500 mb-1 font-medium">{label}</p>
      <p className="text-gray-900 font-semibold">{value}</p>
    </div>
  )
}
