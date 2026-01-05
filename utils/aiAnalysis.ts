import { DayEntry, getAllDayEntries } from './storage';

export interface MonthlyAnalysis {
    period: string;
    totalDays: number;
    ratedDays: number;
    averageRating: number;
    ratingDistribution: {
        excellent: number;
        good: number;
        neutral: number;
        bad: number;
        terrible: number;
    };
    emotionalTrend: 'improving' | 'declining' | 'stable';
    topThemes: string[];
    insights: string[];
    recommendations: string[];
}

/**
 * Get entries from the last N days
 */
export const getEntriesFromLastNDays = async (days: number): Promise<Record<string, DayEntry>> => {
    const allEntries = await getAllDayEntries();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentEntries: Record<string, DayEntry> = {};

    Object.keys(allEntries).forEach((dateStr) => {
        const entryDate = new Date(dateStr);
        if (entryDate >= cutoffDate) {
            recentEntries[dateStr] = allEntries[dateStr];
        }
    });

    return recentEntries;
};

/**
 * Analyze rating trends
 */
const analyzeRatingTrend = (entries: Record<string, DayEntry>): 'improving' | 'declining' | 'stable' => {
    const dates = Object.keys(entries).sort();
    if (dates.length < 7) return 'stable';

    const midPoint = Math.floor(dates.length / 2);
    const firstHalf = dates.slice(0, midPoint);
    const secondHalf = dates.slice(midPoint);

    const firstAvg = firstHalf.reduce((sum, date) => sum + entries[date].rating, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, date) => sum + entries[date].rating, 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;

    if (difference > 0.3) return 'improving';
    if (difference < -0.3) return 'declining';
    return 'stable';
};

/**
 * Extract key themes from diary entries using simple keyword analysis
 */
const extractThemes = (entries: Record<string, DayEntry>): string[] => {
    const allText = Object.values(entries)
        .map(entry => entry.description.toLowerCase())
        .join(' ');

    // Common positive and negative keywords
    const keywords = {
        work: ['work', 'job', 'project', 'meeting', 'deadline', 'colleague'],
        social: ['friend', 'family', 'party', 'dinner', 'hangout', 'visit'],
        health: ['exercise', 'gym', 'run', 'workout', 'health', 'sleep'],
        learning: ['learn', 'study', 'read', 'course', 'book', 'skill'],
        stress: ['stress', 'anxiety', 'worry', 'pressure', 'overwhelm'],
        achievement: ['accomplish', 'achieve', 'success', 'complete', 'finish', 'win'],
    };

    const themeScores: Record<string, number> = {};

    Object.entries(keywords).forEach(([theme, words]) => {
        const count = words.reduce((sum, word) => {
            const regex = new RegExp(`\\b${word}\\w*\\b`, 'gi');
            const matches = allText.match(regex);
            return sum + (matches ? matches.length : 0);
        }, 0);
        themeScores[theme] = count;
    });

    // Return top 3 themes
    return Object.entries(themeScores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .filter(([, count]) => count > 0)
        .map(([theme]) => theme.charAt(0).toUpperCase() + theme.slice(1));
};

/**
 * Generate AI-style insights based on data
 */
const generateInsights = (
    entries: Record<string, DayEntry>,
    avgRating: number,
    trend: string,
    themes: string[]
): string[] => {
    const insights: string[] = [];
    const ratedDays = Object.keys(entries).length;

    // Consistency insight
    if (ratedDays >= 25) {
        insights.push('🎯 Excellent consistency! You\'ve been tracking your mood regularly.');
    } else if (ratedDays >= 15) {
        insights.push('👍 Good tracking habit! Try to maintain this consistency.');
    } else {
        insights.push('💡 Consider tracking more regularly to get better insights.');
    }

    // Rating insight
    if (avgRating >= 4.0) {
        insights.push('😊 Your overall mood has been very positive this month!');
    } else if (avgRating >= 3.0) {
        insights.push('🙂 Your mood has been generally stable and balanced.');
    } else {
        insights.push('💙 It seems you\'ve had some challenging days. Remember, it\'s okay to have ups and downs.');
    }

    // Trend insight
    if (trend === 'improving') {
        insights.push('📈 Great news! Your mood trend is improving over time.');
    } else if (trend === 'declining') {
        insights.push('📉 Your mood has been declining recently. Consider what might be affecting you.');
    }

    // Theme insights
    if (themes.length > 0) {
        insights.push(`🔍 Main focus areas: ${themes.join(', ')}.`);
    }

    return insights;
};

/**
 * Generate personalized recommendations
 */
const generateRecommendations = (
    avgRating: number,
    trend: string,
    themes: string[]
): string[] => {
    const recommendations: string[] = [];

    if (avgRating < 3.0) {
        recommendations.push('Consider talking to someone you trust about how you\'re feeling.');
        recommendations.push('Try incorporating small self-care activities into your daily routine.');
    }

    if (trend === 'declining') {
        recommendations.push('Identify patterns: What days tend to be harder? What helps on better days?');
        recommendations.push('Consider professional support if you\'re consistently struggling.');
    }

    if (themes.includes('Stress')) {
        recommendations.push('Practice stress management techniques like deep breathing or meditation.');
        recommendations.push('Ensure you\'re getting enough rest and taking regular breaks.');
    }

    if (themes.includes('Work')) {
        recommendations.push('Maintain work-life balance. Set boundaries for work hours.');
    }

    if (themes.includes('Social')) {
        recommendations.push('Continue nurturing your social connections - they\'re important for wellbeing.');
    }

    if (themes.includes('Health')) {
        recommendations.push('Keep up the healthy habits! Physical health supports mental wellbeing.');
    }

    // Default recommendations if none specific
    if (recommendations.length === 0) {
        recommendations.push('Continue reflecting daily to track your emotional patterns.');
        recommendations.push('Celebrate your wins, no matter how small.');
        recommendations.push('Be kind to yourself on difficult days.');
    }

    return recommendations.slice(0, 4); // Limit to 4 recommendations
};

/**
 * Analyze the last 30 days of data
 */
export const analyzeLastMonth = async (): Promise<MonthlyAnalysis> => {
    const entries = await getEntriesFromLastNDays(30);
    const ratedDays = Object.keys(entries).length;

    if (ratedDays === 0) {
        return {
            period: 'Last 30 Days',
            totalDays: 30,
            ratedDays: 0,
            averageRating: 0,
            ratingDistribution: {
                excellent: 0,
                good: 0,
                neutral: 0,
                bad: 0,
                terrible: 0,
            },
            emotionalTrend: 'stable',
            topThemes: [],
            insights: ['No data available yet. Start tracking your daily reflections!'],
            recommendations: ['Begin by rating your day and writing a brief diary entry.'],
        };
    }

    // Calculate rating distribution
    const distribution = {
        excellent: 0,
        good: 0,
        neutral: 0,
        bad: 0,
        terrible: 0,
    };

    let totalRating = 0;

    Object.values(entries).forEach((entry) => {
        totalRating += entry.rating;
        switch (entry.rating) {
            case 5:
                distribution.excellent++;
                break;
            case 4:
                distribution.good++;
                break;
            case 3:
                distribution.neutral++;
                break;
            case 2:
                distribution.bad++;
                break;
            case 1:
                distribution.terrible++;
                break;
        }
    });

    const averageRating = totalRating / ratedDays;
    const trend = analyzeRatingTrend(entries);
    const themes = extractThemes(entries);
    const insights = generateInsights(entries, averageRating, trend, themes);
    const recommendations = generateRecommendations(averageRating, trend, themes);

    return {
        period: 'Last 30 Days',
        totalDays: 30,
        ratedDays,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution: distribution,
        emotionalTrend: trend,
        topThemes: themes,
        insights,
        recommendations,
    };
};

/**
 * Generate AI prompt for external LLM (optional advanced feature)
 * Configured as Professional Psychologist and Life Coach
 */
export const generateAIPrompt = async (): Promise<string> => {
    const entries = await getEntriesFromLastNDays(30);
    const dates = Object.keys(entries).sort();

    // System prompt - Professional Psychologist and Life Coach
    let prompt = `SYSTEM PROMPT:
You are an expert Psychologist and Life Coach with over 15 years of experience in cognitive behavioral therapy, positive psychology, and emotional intelligence. Your role is to analyze the user's daily diary entries and provide professional, empathetic, and actionable insights.

ANALYSIS GUIDELINES:
1. Analyze both numerical ratings (1-5 scale) and text content holistically
2. Identify emotional patterns, triggers, and behavioral trends
3. Recognize cognitive distortions or unhelpful thought patterns
4. Highlight strengths, resilience, and positive coping mechanisms
5. Provide evidence-based recommendations for mental well-being
6. Use a warm, empathetic, and constructive tone
7. Be non-judgmental and validating of all emotions
8. Focus on actionable steps for improvement

USER DATA - LAST 30 DAYS:
Total Entries: ${dates.length}

`;

    // Add each diary entry
    dates.forEach((date) => {
        const entry = entries[date];
        prompt += `Date: ${date}\n`;
        prompt += `Rating: ${entry.rating}/5\n`;
        prompt += `Diary Entry: ${entry.description || '(No entry)'}\n\n`;
    });

    // Analysis instructions
    prompt += `\nPROFESSIONAL ANALYSIS REQUIRED:

Please provide a comprehensive psychological assessment including:

1. EMOTIONAL PATTERN ANALYSIS
   - Overall emotional trajectory (improving/declining/stable)
   - Frequency and intensity of positive vs. negative emotions
   - Emotional regulation patterns
   - Mood volatility or stability

2. KEY THEMES & CONCERNS
   - Recurring topics or stressors
   - Life domains requiring attention (work, relationships, health, etc.)
   - Potential triggers for low mood days
   - Unmet psychological needs

3. STRENGTHS & RESILIENCE FACTORS
   - Positive coping mechanisms observed
   - Evidence of growth mindset or self-awareness
   - Support systems and resources utilized
   - Moments of joy, gratitude, or achievement

4. COGNITIVE & BEHAVIORAL INSIGHTS
   - Thought patterns (helpful vs. unhelpful)
   - Behavioral patterns affecting well-being
   - Self-care practices (or lack thereof)
   - Work-life balance indicators

5. PROFESSIONAL RECOMMENDATIONS
   - Specific, actionable steps for improvement
   - Evidence-based techniques (CBT, mindfulness, etc.)
   - Lifestyle modifications to consider
   - When to seek additional professional support

6. ENCOURAGEMENT & VALIDATION
   - Acknowledge the courage of self-reflection
   - Normalize difficult emotions
   - Celebrate progress and efforts
   - Provide hope and motivation

TONE: Warm, empathetic, professional, and constructive. Balance honesty with compassion. Empower the user with knowledge and tools for self-improvement.

Please provide your analysis now:`;

    return prompt;
};

/**
 * Generate simplified AI prompt for basic analysis
 */
export const generateSimpleAIPrompt = async (): Promise<string> => {
    const entries = await getEntriesFromLastNDays(30);
    const dates = Object.keys(entries).sort();

    let prompt = `You are an empathetic AI therapist analyzing a user's daily mood journal for the past 30 days. Here is their data:\n\n`;

    dates.forEach((date) => {
        const entry = entries[date];
        prompt += `Date: ${date}\n`;
        prompt += `Rating: ${entry.rating}/5\n`;
        prompt += `Entry: ${entry.description}\n\n`;
    });

    prompt += `Based on this data, please provide:\n`;
    prompt += `1. A summary of their emotional patterns\n`;
    prompt += `2. Key themes or concerns\n`;
    prompt += `3. Positive observations\n`;
    prompt += `4. Gentle, actionable recommendations\n`;
    prompt += `5. Encouragement and validation\n\n`;
    prompt += `Please be warm, supportive, and non-judgmental in your response.`;

    return prompt;
};
