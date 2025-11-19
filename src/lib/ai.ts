import { AIRecognitionResult, AIPricingResult, AIListingResult } from '@/types'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

if (!ANTHROPIC_API_KEY) {
  console.warn('ANTHROPIC_API_KEY not set - AI features will be disabled')
}

interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

async function callClaude(messages: ClaudeMessage[]): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages,
    }),
  })

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.content[0].text
}

export async function recognizeItem(
  itemName: string,
  brandOverride?: string,
  modelStyle?: string,
  categoryName?: string,
  subcategoryName?: string,
  size?: string,
  colour?: string,
  photoBase64?: string
): Promise<AIRecognitionResult> {
  const content = `You are helping catalogue a wardrobe of designer clothing for resale.

Given information:
- Item Name: ${itemName || 'Unknown'}
- Brand Override: ${brandOverride || 'Not specified'}
- Model/Style: ${modelStyle || 'Not specified'}
- Category: ${categoryName || 'Not specified'}
- Subcategory: ${subcategoryName || 'Not specified'}
- Size: ${size || 'Not specified'}
- Colour: ${colour || 'Not specified'}

Please identify:
1. Brand (if not already specified)
2. Exact item type (e.g., "90s Pinch Waist High-Rise Straight Jeans")
3. Category (e.g., Jacket, Jeans, Shoes)
4. Subcategory (e.g., Denim, Overshirt, Low-top Sneaker)
5. Colour
6. Fabric/material if visible
7. Gender category if obvious (Men's, Women's, Unisex)
8. Any notable details (e.g., cropped fit, raw hem, embroidery)

Return ONLY a JSON object with this structure (no markdown, no code blocks):
{
  "brand": "Brand Name",
  "itemType": "Specific item description",
  "category": "Category",
  "subcategory": "Subcategory",
  "colour": "Colour description",
  "fabric": "Material/fabric",
  "gender": "Men's/Women's/Unisex",
  "details": "Notable details"
}`

  const response = await callClaude([
    { role: 'user', content }
  ])

  // Parse JSON response
  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
  } catch (e) {
    console.error('Failed to parse AI response:', response)
    throw new Error('Failed to parse AI recognition result')
  }
}

export async function estimatePricing(
  brandName: string,
  itemName: string,
  modelStyle: string,
  categoryName: string,
  subcategoryName: string,
  conditionLabel: string
): Promise<AIPricingResult> {
  const retailPrompt = `Estimate the original retail price in CAD for this item:
- Brand: ${brandName}
- Item: ${itemName} - ${modelStyle}
- Category: ${categoryName} / ${subcategoryName}

Respond with ONLY a JSON object (no markdown, no code blocks):
{
  "retailPrice": 325
}

The retailPrice should be a number representing CAD.`

  const resalePrompt = `Estimate the current resale price in CAD for this item:
- Brand: ${brandName}
- Item: ${itemName} - ${modelStyle}
- Category: ${categoryName} / ${subcategoryName}
- Condition: ${conditionLabel}

Consider platforms like Grailed, Vestiaire Collective, The RealReal, Poshmark.

Respond with ONLY a JSON object (no markdown, no code blocks):
{
  "resalePrice": 140
}

The resalePrice should be a number representing CAD.`

  const [retailResponse, resaleResponse] = await Promise.all([
    callClaude([{ role: 'user', content: retailPrompt }]),
    callClaude([{ role: 'user', content: resalePrompt }])
  ])

  try {
    const cleanedRetail = retailResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const cleanedResale = resaleResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    const retail = JSON.parse(cleanedRetail)
    const resale = JSON.parse(cleanedResale)
    
    return {
      retailPrice: retail.retailPrice,
      resalePrice: resale.resalePrice
    }
  } catch (e) {
    console.error('Failed to parse pricing response')
    throw new Error('Failed to parse AI pricing result')
  }
}

export async function generateListing(
  brandName: string,
  itemName: string,
  modelStyle: string,
  categoryName: string,
  subcategoryName: string,
  size: string,
  colour: string,
  conditionLabel: string,
  conditionNotes?: string
): Promise<AIListingResult> {
  const titlePrompt = `Create a short, resale-ready title for this item for platforms like Grailed and Vestiaire.

Format: Brand – Model – Category – Size – Colour

Examples:
- Agolde – 90s Pinch Waist Jeans – 30 – Washed Black
- Isabel Marant Étoile – Kotto Jacket – FR 38 – Khaki

Use:
- Brand: ${brandName}
- Model: ${modelStyle || itemName}
- Category: ${categoryName}
- Size: ${size}
- Colour: ${colour}

Respond with ONLY a JSON object (no markdown):
{
  "title": "Your title here"
}`

  const descriptionPrompt = `Write a compelling resale listing description for this clothing item.
Use a friendly, concise reseller tone (like Grailed or Vestiaire).

Include:
- Brand: ${brandName}
- Model/style: ${itemName} – ${modelStyle}
- Category: ${categoryName} / ${subcategoryName}
- Size: ${size}
- Colour: ${colour}
- Condition: ${conditionLabel}${conditionNotes ? ` (${conditionNotes})` : ''}

Keep it under 120 words. No emojis. Add 3-6 SEO-style keywords at the end separated by commas.

Respond with ONLY a JSON object (no markdown):
{
  "description": "Your description here"
}`

  const [titleResponse, descriptionResponse] = await Promise.all([
    callClaude([{ role: 'user', content: titlePrompt }]),
    callClaude([{ role: 'user', content: descriptionPrompt }])
  ])

  try {
    const cleanedTitle = titleResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const cleanedDescription = descriptionResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    const title = JSON.parse(cleanedTitle)
    const description = JSON.parse(cleanedDescription)
    
    return {
      title: title.title,
      description: description.description
    }
  } catch (e) {
    console.error('Failed to parse listing response')
    throw new Error('Failed to parse AI listing result')
  }
}
