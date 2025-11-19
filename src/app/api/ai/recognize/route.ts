import { NextRequest, NextResponse } from 'next/server'
import { recognizeItem } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      itemName,
      brandOverride,
      modelStyle,
      categoryName,
      subcategoryName,
      size,
      colour,
      photoBase64
    } = body

    const result = await recognizeItem(
      itemName,
      brandOverride,
      modelStyle,
      categoryName,
      subcategoryName,
      size,
      colour,
      photoBase64
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Recognition API error:', error)
    return NextResponse.json(
      { error: 'Failed to recognize item' },
      { status: 500 }
    )
  }
}
