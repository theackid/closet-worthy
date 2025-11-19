import { NextRequest, NextResponse } from 'next/server'
import { estimatePricing } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      brandName,
      itemName,
      modelStyle,
      categoryName,
      subcategoryName,
      conditionLabel
    } = body

    if (!brandName || !itemName || !categoryName || !conditionLabel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await estimatePricing(
      brandName,
      itemName,
      modelStyle,
      categoryName,
      subcategoryName,
      conditionLabel
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Pricing API error:', error)
    return NextResponse.json(
      { error: 'Failed to estimate pricing' },
      { status: 500 }
    )
  }
}
