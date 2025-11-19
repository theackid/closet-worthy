'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { DashboardMetrics } from '@/types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Package, DollarSign, Tag } from 'lucide-react'

interface DashboardProps {
  onNavigateToItems?: (filter?: string) => void
}

export default function Dashboard({ onNavigateToItems }: DashboardProps) {
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
      const { data: items, error } = await supabase
        .from('closet_items')
        .select(`
          *,
          brand:brands(name),
          category:categories(name)
        `)

      if (error) throw error
      if (!items) return

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

      // Aggregate RETAIL value by brand
      const brandMap = new Map<string, number>()
      items.forEach(item => {
        const brandName = item.brand?.name || 'Unknown'
        const value = item.retail_price_cad || 0
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
        <div className="text-primary-400">Loading your closet... ✨</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
          Your Dashboard
        </h2>
        <span className="text-2xl">✨</span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Items"
          value={metrics.totalItems.toString()}
          icon={Package}
          gradient="from-primary-400 to-primary-500"
          onClick={() => onNavigateToItems?.('all')}
          clickable
        />
        <MetricCard
          title="Total Retail Value"
          value={`$${metrics.totalRetailValue.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          icon={DollarSign}
          gradient="from-peach-400 to-peach-500"
        />
        <MetricCard
          title="Est. Resale Value"
          value={`$${metrics.totalResaleValue.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          icon={TrendingUp}
          gradient="from-accent-400 to-accent-500"
        />
        <MetricCard
          title="Items to Sell"
          value={metrics.itemsToSell.toString()}
          icon={Tag}
          gradient="from-lavender-400 to-lavender-500"
        />
      </div>

      {/* Action Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActionCard
          title="Need Photos"
          count={metrics.itemsToPhotograph}
          description="Items missing photos"
          gradient="from-primary-100 to-primary-200"
          textColor="text-primary-700"
          onClick={() => onNavigateToItems?.('no-photos')}
        />
        <ActionCard
          title="Need Pricing"
          count={metrics.itemsToPrice}
          description="Items without price estimates"
          gradient="from-peach-100 to-peach-200"
          textColor="text-peach-700"
          onClick={() => onNavigateToItems?.('no-pricing')}
        />
        <ActionCard
          title="Ready to Sell"
          count={metrics.itemsToSell}
          description="Items marked for sale"
          gradient="from-accent-100 to-accent-200"
          textColor="text-accent-700"
          onClick={() => onNavigateToItems?.('sell')}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retail Value by Brand */}
        <div className="card-soft p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            Retail Value by Brand (Top 10)
            <span className="text-sm">👜</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={brandData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f9d0d9" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                stroke="#cd2d5e"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#cd2d5e" style={{ fontSize: '12px' }} />
              <Tooltip 
                formatter={(value) => `$${value}`}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid #f9d0d9',
                  boxShadow: '0 4px 6px rgba(226, 80, 122, 0.1)'
                }}
              />
              <Bar 
                dataKey="value" 
                fill="url(#brandGradient)" 
                radius={[8, 8, 0, 0]}
              />
              <defs>
                <linearGradient id="brandGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e2507a" />
                  <stop offset="100%" stopColor="#df43ee" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Value by Category */}
        <div className="card-soft p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            Value by Category
            <span className="text-sm">👗</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2ddf7" />
              <XAxis 
                dataKey="name"
                stroke="#6f49b3"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#6f49b3" style={{ fontSize: '12px' }} />
              <Tooltip 
                formatter={(value) => `$${value}`}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid #e2ddf7',
                  boxShadow: '0 4px 6px rgba(149, 120, 219, 0.1)'
                }}
              />
              <Bar 
                dataKey="value" 
                fill="url(#categoryGradient)"
                radius={[8, 8, 0, 0]}
              />
              <defs>
                <linearGradient id="categoryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9578db" />
                  <stop offset="100%" stopColor="#b19fe7" />
                </linearGradient>
              </defs>
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
  gradient: string
  onClick?: () => void
  clickable?: boolean
}

function MetricCard({ title, value, icon: Icon, gradient, onClick, clickable }: MetricCardProps) {
  return (
    <div 
      className={`card-soft p-6 hover:scale-105 transition-transform duration-300 ${
        clickable ? 'cursor-pointer hover:shadow-glow' : ''
      }`}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
            {value}
          </p>
        </div>
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-soft`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  )
}

interface ActionCardProps {
  title: string
  count: number
  description: string
  gradient: string
  textColor: string
  onClick?: () => void
}

function ActionCard({ title, count, description, gradient, textColor, onClick }: ActionCardProps) {
  return (
    <div 
      className={`rounded-3xl bg-gradient-to-br ${gradient} p-6 shadow-soft hover:shadow-soft-lg transition-all duration-300 cursor-pointer hover:scale-105`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-lg font-bold ${textColor} mb-1`}>{title}</p>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <div className={`text-4xl font-bold ${textColor}`}>{count}</div>
      </div>
    </div>
  )
}
