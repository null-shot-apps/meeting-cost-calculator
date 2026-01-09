import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

type EstimateRequest = {
  jobTitle: string;
  location: string;
  experience: string;
  companySize?: string;
  industry?: string;
};

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

    // Build the prompt for Claude
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

    // Call Anthropic API
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Fallback to mock data if no API key
      return NextResponse.json(getMockEstimate(jobTitle, experience));
    }

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
      throw new Error('Invalid response format');
    }

    const estimation = JSON.parse(jsonMatch[0]);
    return NextResponse.json(estimation);
  } catch (error) {
    console.error('Salary estimation error:', error);
    
    // Return mock data as fallback
    const body: EstimateRequest = await request.json();
    return NextResponse.json(getMockEstimate(body.jobTitle, body.experience));
  }
}

// Mock estimation for fallback
function getMockEstimate(jobTitle: string, experience: string): any {
  const title = jobTitle.toLowerCase();
  const exp = experience.toLowerCase();
  
  let baseSalary = 80000;
  
  // Adjust by role
  if (title.includes('engineer') || title.includes('developer')) {
    baseSalary = 100000;
  } else if (title.includes('manager') || title.includes('director')) {
    baseSalary = 130000;
  } else if (title.includes('senior') || title.includes('lead')) {
    baseSalary = 120000;
  } else if (title.includes('ceo') || title.includes('cto') || title.includes('cfo')) {
    baseSalary = 250000;
  } else if (title.includes('designer')) {
    baseSalary = 85000;
  } else if (title.includes('analyst')) {
    baseSalary = 75000;
  }
  
  // Adjust by experience
  if (exp.includes('entry') || exp.includes('0-2')) {
    baseSalary *= 0.7;
  } else if (exp.includes('mid') || exp.includes('3-5')) {
    baseSalary *= 0.9;
  } else if (exp.includes('senior') || exp.includes('6-10')) {
    baseSalary *= 1.2;
  } else if (exp.includes('lead') || exp.includes('principal') || exp.includes('10+')) {
    baseSalary *= 1.5;
  }
  
  const median = Math.round(baseSalary);
  const rangeLow = Math.round(median * 0.85);
  const rangeHigh = Math.round(median * 1.15);
  
  return {
    median_salary: median,
    range_low: rangeLow,
    range_high: rangeHigh,
    confidence: 'medium',
    notes: 'Estimate based on typical market rates (mock data - configure ANTHROPIC_API_KEY for AI estimates)',
  };
}

