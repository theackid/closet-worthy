'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Brand, Category, Subcategory, Condition, ClosetItem } from '@/types'
import { Upload, Sparkles, X } from 'lucide-react'

interface ItemFormProps {
  item?: ClosetItem
  onSave: () => void
  onCancel: () => void
}

export default function ItemForm({ item, onSave, onCancel }: ItemFormProps) {
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  
  // Reference data
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [conditions, setConditions] = useState<Condition[]>([])
  
  // Form state
  const [formData, setFormData] = useState({
    item_name: item?.item_name || '',
    brand_id: item?.brand_id || '',
    category_id: item?.category_id || '',
    subcategory_id: item?.subcategory_id || '',
    condition_id: item?.condition_id || '',
    size: item?.size || '',
    colour: item?.colour || '',
    purchase_price_cad: item?.purchase_price_cad?.toString() || '',
    purchase_date: item?.purchase_date || '',
    brand_override_text: item?.brand_override_text || '',
    model_style_text: item?.model_style_text || '',
    status: item?.status || 'Keep',
    for_sale: item?.for_sale || false,
    ai_retail_price_raw: item?.ai_retail_price_raw || '',
    ai_resale_price_raw: item?.ai_resale_price_raw || '',
    retail_price_cad: item?.retail_price_cad?.toString() || '',
    resale_price_cad: item?.resale_price_cad?.toString() || '',
    ai_listing_title: item?.ai_listing_title || '',
    ai_listing_description: item?.ai_listing_description || '',
  })
  
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>(item?.photo_urls || [])

  useEffect(() => {
    loadReferenceData()
  }, [])

  async function loadReferenceData() {
    const [brandsRes, categoriesRes, subcategoriesRes, conditionsRes] = await Promise.all([
      supabase.from('brands').select('*').order('name'),
      supabase.from('categories').select('*').order('name'),
      supabase.from('subcategories').select('*').order('name'),
      supabase.from('conditions').select('*').order('score', { ascending: false }),
    ])

    if (brandsRes.data) setBrands(brandsRes.data)
    if (categoriesRes.data) setCategories(categoriesRes.data)
    if (subcategoriesRes.data) setSubcategories(subcategoriesRes.data)
    if (conditionsRes.data) setConditions(conditionsRes.data)
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setPhotos([...photos, ...newFiles])
      
      // Generate previews
      newFiles.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPhotoPreviews(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  function removePhoto(index: number) {
    setPhotos(photos.filter((_, i) => i !== index))
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index))
  }

  async function runAIPricing() {
    setAiLoading(true)
    try {
      const brand = brands.find(b => b.id === formData.brand_id)
      const category = categories.find(c => c.id === formData.category_id)
      const subcategory = subcategories.find(s => s.id === formData.subcategory_id)
      const condition = conditions.find(c => c.id === formData.condition_id)

      if (!brand || !category || !condition) {
        alert('Please fill in brand, category, and condition first')
        return
      }

      const response = await fetch('/api/ai/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: formData.brand_override_text || brand.name,
          itemName: formData.item_name,
          modelStyle: formData.model_style_text,
          categoryName: category.name,
          subcategoryName: subcategory?.name || '',
          conditionLabel: condition.label,
        }),
      })

      const result = await response.json()
      
      setFormData(prev => ({
        ...prev,
        ai_retail_price_raw: result.retailPrice.toString(),
        ai_resale_price_raw: result.resalePrice.toString(),
        retail_price_cad: result.retailPrice.toString(),
        resale_price_cad: result.resalePrice.toString(),
      }))
    } catch (error) {
      console.error('AI pricing error:', error)
      alert('Failed to generate pricing')
    } finally {
      setAiLoading(false)
    }
  }

  async function runAIListing() {
    setAiLoading(true)
    try {
      const brand = brands.find(b => b.id === formData.brand_id)
      const category = categories.find(c => c.id === formData.category_id)
      const subcategory = subcategories.find(s => s.id === formData.subcategory_id)
      const condition = conditions.find(c => c.id === formData.condition_id)

      if (!brand || !category || !condition || !formData.size || !formData.colour) {
        alert('Please fill in brand, category, condition, size, and colour first')
        return
      }

      const response = await fetch('/api/ai/listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: formData.brand_override_text || brand.name,
          itemName: formData.item_name,
          modelStyle: formData.model_style_text,
          categoryName: category.name,
          subcategoryName: subcategory?.name || '',
          size: formData.size,
          colour: formData.colour,
          conditionLabel: condition.label,
        }),
      })

      const result = await response.json()
      
      setFormData(prev => ({
        ...prev,
        ai_listing_title: result.title,
        ai_listing_description: result.description,
      }))
    } catch (error) {
      console.error('AI listing error:', error)
      alert('Failed to generate listing')
    } finally {
      setAiLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      // Upload photos to Supabase Storage if any
      let photoUrls: string[] = []
      
      if (photos.length > 0) {
        for (const photo of photos) {
          const fileName = `${Date.now()}_${photo.name}`
          const { data, error } = await supabase.storage
            .from('closet-photos')
            .upload(fileName, photo)

          if (error) throw error
          
          const { data: urlData } = supabase.storage
            .from('closet-photos')
            .getPublicUrl(fileName)
          
          photoUrls.push(urlData.publicUrl)
        }
      }

      // Calculate estimated resale value (90% of resale price)
      const estimatedResaleValue = formData.resale_price_cad 
        ? parseFloat(formData.resale_price_cad) * 0.9 
        : null

      const itemData = {
        item_name: formData.item_name,
        brand_id: formData.brand_id || null,
        category_id: formData.category_id || null,
        subcategory_id: formData.subcategory_id || null,
        condition_id: formData.condition_id || null,
        size: formData.size || null,
        colour: formData.colour || null,
        purchase_price_cad: formData.purchase_price_cad ? parseFloat(formData.purchase_price_cad) : null,
        purchase_date: formData.purchase_date || null,
        brand_override_text: formData.brand_override_text || null,
        model_style_text: formData.model_style_text || null,
        status: formData.status,
        for_sale: formData.for_sale,
        ai_retail_price_raw: formData.ai_retail_price_raw || null,
        ai_resale_price_raw: formData.ai_resale_price_raw || null,
        retail_price_cad: formData.retail_price_cad ? parseFloat(formData.retail_price_cad) : null,
        resale_price_cad: formData.resale_price_cad ? parseFloat(formData.resale_price_cad) : null,
        estimated_resale_value_cad: estimatedResaleValue,
        ai_listing_title: formData.ai_listing_title || null,
        ai_listing_description: formData.ai_listing_description || null,
        photo_urls: photoUrls.length > 0 ? photoUrls : (item?.photo_urls || []),
      }

      if (item) {
        // Update existing item
        const { error } = await supabase
          .from('closet_items')
          .update(itemData)
          .eq('id', item.id)

        if (error) throw error
      } else {
        // Create new item
        const { error } = await supabase
          .from('closet_items')
          .insert([itemData])

        if (error) throw error
      }

      onSave()
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {item ? 'Edit Item' : 'Add New Item'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Photos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photos
        </label>
        <div className="flex flex-wrap gap-4 mb-4">
          {photoPreviews.map((preview, index) => (
            <div key={index} className="relative">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500">
          <div className="flex flex-col items-center">
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="mt-2 text-sm text-gray-500">Upload photos</span>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Item Name *
          </label>
          <input
            type="text"
            required
            value={formData.item_name}
            onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., 90s Pinch Waist Jeans"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brand *
          </label>
          <select
            required
            value={formData.brand_id}
            onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select brand</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brand Override (optional)
          </label>
          <input
            type="text"
            value={formData.brand_override_text}
            onChange={(e) => setFormData({ ...formData, brand_override_text: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., Isabel Marant Étoile"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model / Style
          </label>
          <input
            type="text"
            value={formData.model_style_text}
            onChange={(e) => setFormData({ ...formData, model_style_text: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., Kotto Jacket"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            required
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subcategory
          </label>
          <select
            value={formData.subcategory_id}
            onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select subcategory</option>
            {subcategories
              .filter(sub => sub.category_id === formData.category_id)
              .map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Condition *
          </label>
          <select
            required
            value={formData.condition_id}
            onChange={(e) => setFormData({ ...formData, condition_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select condition</option>
            {conditions.map(cond => (
              <option key={cond.id} value={cond.id}>{cond.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Size
          </label>
          <input
            type="text"
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., 30, M, EU 44"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Colour
          </label>
          <input
            type="text"
            value={formData.colour}
            onChange={(e) => setFormData({ ...formData, colour: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., Washed black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Purchase Price (CAD)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.purchase_price_cad}
            onChange={(e) => setFormData({ ...formData, purchase_price_cad: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Purchase Date
          </label>
          <input
            type="date"
            value={formData.purchase_date}
            onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="Keep">Keep</option>
            <option value="Sell">Sell</option>
            <option value="Donate">Donate</option>
          </select>
        </div>
      </div>

      {/* AI Pricing Section */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">AI Pricing</h3>
          <button
            type="button"
            onClick={runAIPricing}
            disabled={aiLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {aiLoading ? 'Generating...' : 'Generate Prices'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Retail Price (CAD)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.retail_price_cad}
              onChange={(e) => setFormData({ ...formData, retail_price_cad: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resale Price (CAD)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.resale_price_cad}
              onChange={(e) => setFormData({ ...formData, resale_price_cad: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* AI Listing Section */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">AI Listing</h3>
          <button
            type="button"
            onClick={runAIListing}
            disabled={aiLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {aiLoading ? 'Generating...' : 'Generate Listing'}
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Listing Title
            </label>
            <input
              type="text"
              value={formData.ai_listing_title}
              onChange={(e) => setFormData({ ...formData, ai_listing_title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Listing Description
            </label>
            <textarea
              rows={4}
              value={formData.ai_listing_description}
              onChange={(e) => setFormData({ ...formData, ai_listing_description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 border-t pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : (item ? 'Update Item' : 'Add Item')}
        </button>
      </div>
    </form>
  )
}
