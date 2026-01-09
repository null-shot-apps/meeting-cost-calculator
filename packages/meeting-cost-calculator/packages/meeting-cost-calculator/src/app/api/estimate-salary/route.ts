import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface EstimateRequest {
  jobTitle: string;
  location: string;
  experience: string;
  companySize?: string;
  industry?: string;
}

interface EstimateResponse {
  median_salary: number;
  range_low: number;
  range_high: number;
  confidence: 'high' | 'medium' | 'low';
  notes: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: EstimateRequest = await request.json();
    const { jobTitle, location, experience, companySize, industry } = body;

    if (!jobTitle || !location || !experience) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use Anthropic Claude API for salary estimation
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      // Fallback to basic estimation if no API key
      return NextResponse.json(getFallbackEstimate(body));
    }

    const prompt = `You are a salary data expert. Estimate the median annual salary for the following role:

Job Title: ${jobTitle}
Location: ${location}
Experience Level: ${experience}
${companySize ? `Company Size: ${companySize}` : ''}
${industry ? `Industry: ${industry}` : ''}

Provide:
1. Median annual salary (single number in USD)
2. Typical range (25th-75th percentile)
3. Confidence level (high/medium/low) based on how common this role/location combination is

Format response as JSON:
{
  "median_salary": 125000,
  "range_low": 105000,
  "range_high": 145000,
  "confidence": "high",
  "notes": "Based on 2024-2025 market data for tech industry"
}

Be realistic and use actual market data knowledge. If you're uncertain, indicate lower confidence.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse response');
    }

    const result: EstimateResponse = JSON.parse(jsonMatch[0]);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Salary estimation error:', error);
    
    // Return fallback estimate on error
    const body: EstimateRequest = await request.json();
    return NextResponse.json(getFallbackEstimate(body));
  }
}

// Fallback estimation based on simple heuristics
function getFallbackEstimate(data: EstimateRequest): EstimateResponse {
  const { jobTitle, experience } = data;
  
  // Base salary estimates
  let baseSalary = 80000;
  
  // Adjust by job title keywords
  const titleLower = jobTitle.toLowerCase();
  if (titleLower.includes('senior') || titleLower.includes('lead')) {
    baseSalary = 130000;
  } else if (titleLower.includes('principal') || titleLower.includes('staff')) {
    baseSalary = 170000;
  } else if (titleLower.includes('junior') || titleLower.includes('entry')) {
    baseSalary = 65000;
  } else if (titleLower.includes('manager') || titleLower.includes('director')) {
    baseSalary = 150000;
  } else if (titleLower.includes('vp') || titleLower.includes('executive') || titleLower.includes('cto') || titleLower.includes('ceo')) {
    baseSalary = 250000;
  }
  
  // Adjust by experience
  if (experience.includes('Entry')) {
    baseSalary *= 0.7;
  } else if (experience.includes('Mid')) {
    baseSalary *= 0.9;
  } else if (experience.includes('Senior')) {
    baseSalary *= 1.1;
  } else if (experience.includes('Lead') || experience.includes('Principal')) {
    baseSalary *= 1.3;
  }
  
  const median = Math.round(baseSalary);
  const rangeLow = Math.round(median * 0.85);
  const rangeHigh = Math.round(median * 1.15);
  
  return {
    median_salary: median,
    range_low: rangeLow,
    range_high: rangeHigh,
    confidence: 'medium',
    notes: 'Estimate based on general market data. For more accurate results, add API key.',
  };
}

