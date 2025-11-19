import { NextRequest, NextResponse } from 'next/server'
import { generateListing } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      brandName,
      itemName,
      modelStyle,
      categoryName,
      subcategoryName,
      size,
      colour,
      conditionLabel,
      conditionNotes
    } = body

    if (!brandName || !itemName || !categoryName || !size || !colour || !conditionLabel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await generateListing(
      brandName,
      itemName,
      modelStyle,
      categoryName,
      subcategoryName,
      size,
      colour,
      conditionLabel,
      conditionNotes
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Listing API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate listing' },
      { status: 500 }
    )
  }
}
