import RatingModal from '@/components/RatingModal';
import { setupSmartNotifications } from '@/utils/notifications';
import {
    DayEntry,
    formatDate,
    getAllDayEntries,
    getDayEntry,
    getRatingColor,
    saveDayEntry,
} from '@/utils/storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

export default function CalendarScreen() {
    const [markedDates, setMarkedDates] = useState<any>({});
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedEntry, setSelectedEntry] = useState<DayEntry | null>(null);
    const [currentMonth, setCurrentMonth] = useState(formatDate(new Date()));

    // Load all entries and mark calendar
    const loadEntries = async () => {
        try {
            const entries = await getAllDayEntries();
            const marked: any = {};

            Object.keys(entries).forEach((date) => {
                const entry = entries[date];
                marked[date] = {
                    marked: true,
                    dotColor: getRatingColor(entry.rating),
                    customStyles: {
                        container: {
                            backgroundColor: getRatingColor(entry.rating),
                            borderRadius: 8,
                        },
                        text: {
                            color: '#ffffff',
                            fontWeight: 'bold',
                        },
                    },
                };
            });

            setMarkedDates(marked);
        } catch (error) {
            console.error('Error loading entries:', error);
        }
    };

    // Reload entries when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadEntries();
        }, [])
    );

    // Check if it's after 9 PM and today hasn't been rated
    useEffect(() => {
        const checkTodayRating = async () => {
            const now = new Date();
            const hour = now.getHours();
            const today = formatDate(now);

            // Only prompt if it's after 9 PM
            if (hour >= 21) {
                const entry = await getDayEntry(today);
                if (!entry) {
                    // Show modal automatically
                    handleDatePress({ dateString: today } as DateData);
                }
            }
        };

        checkTodayRating();
    }, []);

    const handleDatePress = async (day: DateData) => {
        const date = day.dateString;
        setSelectedDate(date);

        // Load existing entry if available
        const entry = await getDayEntry(date);
        setSelectedEntry(entry);

        setModalVisible(true);
    };

    const handleSaveEntry = async (rating: number, description: string) => {
        try {
            await saveDayEntry(selectedDate, { rating, description });
            setModalVisible(false);
            await loadEntries(); // Reload to update calendar

            // Update notification status - cancel if today was just rated
            await setupSmartNotifications();

            Alert.alert('Success', 'Your reflection has been saved!');
        } catch (error) {
            Alert.alert('Error', 'Failed to save your reflection. Please try again.');
            console.error('Error saving entry:', error);
        }
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedEntry(null);
    };

    const handleAddToday = () => {
        const today = formatDate(new Date());
        handleDatePress({ dateString: today } as DateData);
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Rating Your Day Bro</Text>
                    <Text style={styles.subtitle}>Track your daily mood and thoughts</Text>
                </View>

                {/* Calendar */}
                <View style={styles.calendarContainer}>
                    <Calendar
                        current={currentMonth}
                        maxDate={formatDate(new Date())} // Restrict to today - no future dates
                        onDayPress={handleDatePress}
                        onMonthChange={(month) => {
                            setCurrentMonth(month.dateString);
                        }}
                        markedDates={markedDates}
                        markingType={'custom'}
                        theme={{
                            backgroundColor: '#ffffff',
                            calendarBackground: '#ffffff',
                            textSectionTitleColor: '#2c3e50',
                            selectedDayBackgroundColor: '#3498db',
                            selectedDayTextColor: '#ffffff',
                            todayTextColor: '#3498db',
                            dayTextColor: '#2c3e50',
                            textDisabledColor: '#bdc3c7',
                            dotColor: '#3498db',
                            selectedDotColor: '#ffffff',
                            arrowColor: '#3498db',
                            monthTextColor: '#2c3e50',
                            indicatorColor: '#3498db',
                            textDayFontFamily: 'System',
                            textMonthFontFamily: 'System',
                            textDayHeaderFontFamily: 'System',
                            textDayFontWeight: '400',
                            textMonthFontWeight: 'bold',
                            textDayHeaderFontWeight: '600',
                            textDayFontSize: 16,
                            textMonthFontSize: 18,
                            textDayHeaderFontSize: 14,
                        }}
                        style={styles.calendar}
                    />
                </View>

                {/* Legend */}
                <View style={styles.legendContainer}>
                    <Text style={styles.legendTitle}>Rating Scale</Text>
                    <View style={styles.legendItems}>
                        {[
                            { rating: 5, label: 'Excellent' },
                            { rating: 4, label: 'Good' },
                            { rating: 3, label: 'Neutral' },
                            { rating: 2, label: 'Bad' },
                            { rating: 1, label: 'Terrible' },
                        ].map((item) => (
                            <View key={item.rating} style={styles.legendItem}>
                                <View
                                    style={[
                                        styles.legendColor,
                                        { backgroundColor: getRatingColor(item.rating) },
                                    ]}
                                />
                                <Text style={styles.legendLabel}>{item.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Quick Add Button */}
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddToday}
                    activeOpacity={0.8}
                >
                    <Text style={styles.addButtonText}>+ Add Today's Reflection</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Rating Modal */}
            <RatingModal
                visible={modalVisible}
                date={selectedDate}
                initialRating={selectedEntry?.rating || 0}
                initialDescription={selectedEntry?.description || ''}
                onSave={handleSaveEntry}
                onClose={handleCloseModal}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6fa',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#ffffff',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
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
    calendarContainer: {
        margin: 20,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    calendar: {
        borderRadius: 16,
    },
    legendContainer: {
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 16,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    legendTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 12,
    },
    legendItems: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    legendColor: {
        width: 20,
        height: 20,
        borderRadius: 4,
        marginRight: 8,
    },
    legendLabel: {
        fontSize: 14,
        color: '#34495e',
    },
    addButton: {
        marginHorizontal: 20,
        marginBottom: 40,
        paddingVertical: 18,
        backgroundColor: '#3498db',
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#3498db',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    addButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
    },
});
