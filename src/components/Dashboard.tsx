'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ClosetItem, DashboardMetrics } from '@/types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, Package, DollarSign, Tag } from 'lucide-react'

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalItems: 0,
    totalRetailValue: 0,
    totalResaleValue: 0,
    itemsToSell: 0,
    itemsToPhotograph: 0,
    itemsToPrice: 0,
  })
  const [brandData, setBrandData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      // Fetch all items with relations
      const { data: items, error } = await supabase
        .from('closet_items')
        .select(`
          *,
          brand:brands(name),
          category:categories(name)
        `)

      if (error) throw error

      if (!items) return

      // Calculate metrics
      const totalItems = items.length
      const totalRetailValue = items.reduce((sum, item) => sum + (item.retail_price_cad || 0), 0)
      const totalResaleValue = items.reduce((sum, item) => sum + (item.estimated_resale_value_cad || 0), 0)
      const itemsToSell = items.filter(item => item.status === 'Sell').length
      const itemsToPhotograph = items.filter(item => !item.photo_urls || item.photo_urls.length === 0).length
      const itemsToPrice = items.filter(item => !item.retail_price_cad || !item.resale_price_cad).length

      setMetrics({
        totalItems,
        totalRetailValue,
        totalResaleValue,
        itemsToSell,
        itemsToPhotograph,
        itemsToPrice,
      })

      // Aggregate by brand
      const brandMap = new Map<string, number>()
      items.forEach(item => {
        const brandName = item.brand?.name || 'Unknown'
        const value = item.estimated_resale_value_cad || 0
        brandMap.set(brandName, (brandMap.get(brandName) || 0) + value)
      })
      
      const brandChartData = Array.from(brandMap.entries())
        .map(([name, value]) => ({ name, value: Math.round(value) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)
      
      setBrandData(brandChartData)

      // Aggregate by category
      const categoryMap = new Map<string, number>()
      items.forEach(item => {
        const categoryName = item.category?.name || 'Unknown'
        const value = item.estimated_resale_value_cad || 0
        categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + value)
      })
      
      const categoryChartData = Array.from(categoryMap.entries())
        .map(([name, value]) => ({ name, value: Math.round(value) }))
        .sort((a, b) => b.value - a.value)
      
      setCategoryData(categoryChartData)

    } catch (error) {
      console.error('Dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Items"
          value={metrics.totalItems.toString()}
          icon={Package}
          color="blue"
        />
        <MetricCard
          title="Total Retail Value"
          value={`$${metrics.totalRetailValue.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          title="Est. Resale Value"
          value={`$${metrics.totalResaleValue.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          icon={TrendingUp}
          color="purple"
        />
        <MetricCard
          title="Items to Sell"
          value={metrics.itemsToSell.toString()}
          icon={Tag}
          color="orange"
        />
      </div>

      {/* Action Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActionCard
          title="Need Photos"
          count={metrics.itemsToPhotograph}
          description="Items missing photos"
          color="red"
        />
        <ActionCard
          title="Need Pricing"
          count={metrics.itemsToPrice}
          description="Items without price estimates"
          color="yellow"
        />
        <ActionCard
          title="Ready to Sell"
          count={metrics.itemsToSell}
          description="Items marked for sale"
          color="green"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Value by Brand */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Value by Brand (Top 10)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={brandData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Bar dataKey="value" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Value by Category */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Value by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Bar dataKey="value" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  icon: any
  color: 'blue' | 'green' | 'purple' | 'orange'
}

function MetricCard({ title, value, icon: Icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

interface ActionCardProps {
  title: string
  count: number
  description: string
  color: 'red' | 'yellow' | 'green'
}

function ActionCard({ title, count, description, color }: ActionCardProps) {
  const colorClasses = {
    red: 'border-red-200 bg-red-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    green: 'border-green-200 bg-green-50',
  }

  const textColorClasses = {
    red: 'text-red-900',
    yellow: 'text-yellow-900',
    green: 'text-green-900',
  }

  return (
    <div className={`border-l-4 p-4 rounded ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-lg font-semibold ${textColorClasses[color]}`}>{title}</p>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <div className={`text-3xl font-bold ${textColorClasses[color]}`}>{count}</div>
      </div>
    </div>
  )
}
