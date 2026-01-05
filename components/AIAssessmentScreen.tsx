import { analyzeLastMonth, MonthlyAnalysis } from '@/utils/aiAnalysis';
import { getRatingColor } from '@/utils/storage';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function AIAssessmentScreen() {
    const [analysis, setAnalysis] = useState<MonthlyAnalysis | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalysis();
    }, []);

    const loadAnalysis = async () => {
        setLoading(true);
        try {
            const result = await analyzeLastMonth();
            setAnalysis(result);
        } catch (error) {
            console.error('Error loading analysis:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'improving':
                return '📈';
            case 'declining':
                return '📉';
            default:
                return '➡️';
        }
    };

    const getTrendColor = (trend: string) => {
        switch (trend) {
            case 'improving':
                return '#2ecc71';
            case 'declining':
                return '#e74c3c';
            default:
                return '#3498db';
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3498db" />
                <Text style={styles.loadingText}>Analyzing your reflections...</Text>
            </View>
        );
    }

    if (!analysis) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Unable to load analysis</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadAnalysis}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>🤖 AI Assessment</Text>
                <Text style={styles.subtitle}>{analysis.period}</Text>
            </View>

            {/* Summary Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>📊 Summary</Text>
                <View style={styles.summaryGrid}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>{analysis.ratedDays}</Text>
                        <Text style={styles.summaryLabel}>Days Tracked</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryValue, { color: getRatingColor(Math.round(analysis.averageRating)) }]}>
                            {analysis.averageRating.toFixed(1)}
                        </Text>
                        <Text style={styles.summaryLabel}>Avg Rating</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryValue, { color: getTrendColor(analysis.emotionalTrend) }]}>
                            {getTrendIcon(analysis.emotionalTrend)}
                        </Text>
                        <Text style={styles.summaryLabel}>Trend</Text>
                    </View>
                </View>
            </View>

            {/* Rating Distribution */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>📈 Rating Distribution</Text>
                <View style={styles.distributionContainer}>
                    {[
                        { label: 'Excellent', rating: 5, count: analysis.ratingDistribution.excellent },
                        { label: 'Good', rating: 4, count: analysis.ratingDistribution.good },
                        { label: 'Neutral', rating: 3, count: analysis.ratingDistribution.neutral },
                        { label: 'Bad', rating: 2, count: analysis.ratingDistribution.bad },
                        { label: 'Terrible', rating: 1, count: analysis.ratingDistribution.terrible },
                    ].map((item) => (
                        <View key={item.rating} style={styles.distributionRow}>
                            <View style={styles.distributionLabel}>
                                <View style={[styles.colorDot, { backgroundColor: getRatingColor(item.rating) }]} />
                                <Text style={styles.distributionText}>{item.label}</Text>
                            </View>
                            <View style={styles.distributionBarContainer}>
                                <View
                                    style={[
                                        styles.distributionBar,
                                        {
                                            width: `${analysis.ratedDays > 0 ? (item.count / analysis.ratedDays) * 100 : 0}%`,
                                            backgroundColor: getRatingColor(item.rating),
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={styles.distributionCount}>{item.count}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Top Themes */}
            {analysis.topThemes.length > 0 && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🔍 Top Themes</Text>
                    <View style={styles.themesContainer}>
                        {analysis.topThemes.map((theme, index) => (
                            <View key={index} style={styles.themeChip}>
                                <Text style={styles.themeText}>{theme}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* AI Insights */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>💡 AI Insights</Text>
                {analysis.insights.map((insight, index) => (
                    <View key={index} style={styles.insightItem}>
                        <Text style={styles.insightText}>{insight}</Text>
                    </View>
                ))}
            </View>

            {/* Recommendations */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>✨ Recommendations</Text>
                {analysis.recommendations.map((recommendation, index) => (
                    <View key={index} style={styles.recommendationItem}>
                        <Text style={styles.recommendationNumber}>{index + 1}</Text>
                        <Text style={styles.recommendationText}>{recommendation}</Text>
                    </View>
                ))}
            </View>

            {/* Refresh Button */}
            <TouchableOpacity style={styles.refreshButton} onPress={loadAnalysis}>
                <Text style={styles.refreshButtonText}>🔄 Refresh Analysis</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6fa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f6fa',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#7f8c8d',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f6fa',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#e74c3c',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#3498db',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#ffffff',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#7f8c8d',
    },
    card: {
        backgroundColor: '#ffffff',
        marginHorizontal: 20,
        marginTop: 20,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 16,
    },
    summaryGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#3498db',
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#7f8c8d',
    },
    distributionContainer: {
        gap: 12,
    },
    distributionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    distributionLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 80,
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 6,
    },
    distributionText: {
        fontSize: 13,
        color: '#34495e',
    },
    distributionBarContainer: {
        flex: 1,
        height: 20,
        backgroundColor: '#ecf0f1',
        borderRadius: 10,
        overflow: 'hidden',
    },
    distributionBar: {
        height: '100%',
        borderRadius: 10,
    },
    distributionCount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#34495e',
        width: 30,
        textAlign: 'right',
    },
    themesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    themeChip: {
        backgroundColor: '#3498db',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    themeText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    insightItem: {
        marginBottom: 12,
        paddingLeft: 8,
    },
    insightText: {
        fontSize: 15,
        color: '#34495e',
        lineHeight: 22,
    },
    recommendationItem: {
        flexDirection: 'row',
        marginBottom: 12,
        gap: 12,
    },
    recommendationNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#3498db',
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 24,
    },
    recommendationText: {
        flex: 1,
        fontSize: 15,
        color: '#34495e',
        lineHeight: 22,
    },
    refreshButton: {
        marginHorizontal: 20,
        marginTop: 20,
        paddingVertical: 16,
        backgroundColor: '#3498db',
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#3498db',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    refreshButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
    },
});
