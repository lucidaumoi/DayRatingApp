import { getRatingColor } from '@/utils/storage';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface RatingModalProps {
    visible: boolean;
    date: string; // YYYY-MM-DD format
    initialRating?: number;
    initialDescription?: string;
    onSave: (rating: number, description: string) => void;
    onClose: () => void;
}

const RATING_LABELS = [
    { rating: 1, label: 'Terrible', emoji: '😞' },
    { rating: 2, label: 'Bad', emoji: '😕' },
    { rating: 3, label: 'Neutral', emoji: '😐' },
    { rating: 4, label: 'Good', emoji: '🙂' },
    { rating: 5, label: 'Excellent', emoji: '😄' },
];

export default function RatingModal({
    visible,
    date,
    initialRating = 0,
    initialDescription = '',
    onSave,
    onClose,
}: RatingModalProps) {
    const [rating, setRating] = useState(initialRating);
    const [description, setDescription] = useState(initialDescription);
    const [charCount, setCharCount] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [showSavedIndicator, setShowSavedIndicator] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const MAX_CHARS = 1512;
    const AUTO_SAVE_DELAY = 2000; // 2 seconds

    /**
     * Calculate character count
     * Simple and straightforward - just the length of the string
     */
    const calculateCharCount = (text: string): number => {
        return text.length;
    };

    /**
     * Auto-save diary entry to AsyncStorage
     * Debounced to avoid excessive writes
     */
    const autoSaveDiary = async (text: string, currentRating: number) => {
        try {
            // Only auto-save if there's a rating (required field)
            if (currentRating === 0) return;

            setIsSaving(true);

            // Import storage function dynamically
            const { saveDayEntry } = await import('@/utils/storage');
            await saveDayEntry(date, { rating: currentRating, description: text });

            setIsSaving(false);
            setShowSavedIndicator(true);

            // Hide "Saved" indicator after 2 seconds
            setTimeout(() => setShowSavedIndicator(false), 2000);
        } catch (error) {
            console.error('Auto-save error:', error);
            setIsSaving(false);
        }
    };

    // Sync state with props when modal opens or props change
    useEffect(() => {
        if (visible) {
            setRating(initialRating);
            setDescription(initialDescription);
            setCharCount(calculateCharCount(initialDescription));
        }
    }, [visible, initialRating, initialDescription]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    const handleDescriptionChange = (text: string) => {
        const chars = calculateCharCount(text);

        // Only update if within character limit
        if (chars <= MAX_CHARS) {
            setDescription(text);
            setCharCount(chars);

            // Clear existing timeout
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            // Set new timeout for auto-save (debounced)
            saveTimeoutRef.current = setTimeout(() => {
                autoSaveDiary(text, rating);
            }, AUTO_SAVE_DELAY);
        } else {
            // If exceeded, keep the previous text
            Alert.alert(
                'Character Limit Reached',
                `Maximum ${MAX_CHARS} characters allowed. Current: ${chars} characters.`
            );
        }
    };

    const handleSave = () => {
        if (rating === 0) {
            Alert.alert('Rating Required', 'Please select a rating before saving.');
            return;
        }

        onSave(rating, description);
        // Reset for next time
        setRating(0);
        setDescription('');
        setCharCount(0);
    };

    const handleClose = () => {
        onClose();
        // Reset state
        setRating(0);
        setDescription('');
        setCharCount(0);
    };

    // Format date for display
    const formatDisplayDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.overlay}>
                    <View style={styles.modalContent}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.title}>
                                    {initialRating > 0 ? 'View & Edit Reflection' : 'Daily Reflection'}
                                </Text>
                                <Text style={styles.dateText}>{formatDisplayDate(date)}</Text>
                            </View>

                            {/* Rating Section */}
                            <View style={styles.ratingSection}>
                                <Text style={styles.sectionTitle}>How was your day?</Text>
                                <View style={styles.ratingButtons}>
                                    {RATING_LABELS.map((item) => (
                                        <TouchableOpacity
                                            key={item.rating}
                                            style={[
                                                styles.ratingButton,
                                                {
                                                    backgroundColor: getRatingColor(item.rating),
                                                    opacity: rating === item.rating ? 1 : 0.5,
                                                    transform: [
                                                        { scale: rating === item.rating ? 1.1 : 1 },
                                                    ],
                                                },
                                            ]}
                                            onPress={() => setRating(item.rating)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.ratingLabel}>{item.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Daily Diary Section */}
                            <View style={styles.diarySection}>
                                <View style={styles.diarySectionHeader}>
                                    <Text style={styles.sectionTitle}>
                                        📝 Daily Diary
                                    </Text>
                                    <View style={styles.counterContainer}>
                                        <Text style={[
                                            styles.wordCounter,
                                            charCount > MAX_CHARS * 0.9 && styles.wordCounterWarning,
                                            charCount === MAX_CHARS && styles.wordCounterLimit
                                        ]}>
                                            {charCount} / {MAX_CHARS}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.diarySubtitle}>
                                    Write about your day, thoughts, and experiences...
                                </Text>
                                <TextInput
                                    style={styles.diaryInput}
                                    placeholder="What happened today? How did you feel? What did you learn?&#10;&#10;Take your time to reflect on your day..."
                                    placeholderTextColor="#95a5a6"
                                    multiline
                                    value={description}
                                    onChangeText={handleDescriptionChange}
                                    textAlignVertical="top"
                                    maxLength={MAX_CHARS}
                                />
                                {/* Auto-save indicator */}
                                <View style={styles.autoSaveContainer}>
                                    {isSaving && (
                                        <Text style={styles.savingText}>💾 Saving...</Text>
                                    )}
                                    {showSavedIndicator && !isSaving && (
                                        <Text style={styles.savedText}>✓ Saved</Text>
                                    )}
                                </View>
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={handleClose}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        styles.saveButton,
                                        rating === 0 && styles.saveButtonDisabled,
                                    ]}
                                    onPress={handleSave}
                                    activeOpacity={0.7}
                                    disabled={rating === 0}
                                >
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 500,
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    header: {
        marginBottom: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 8,
    },
    dateText: {
        fontSize: 16,
        color: '#7f8c8d',
    },
    ratingSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#34495e',
        marginBottom: 16,
    },
    ratingButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    ratingButton: {
        flex: 1,
        aspectRatio: 1,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    emoji: {
        fontSize: 28,
        marginBottom: 4,
    },
    ratingLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#ffffff',
        textAlign: 'center',
    },
    descriptionSection: {
        marginBottom: 24,
    },
    diarySection: {
        marginBottom: 24,
        flex: 1,
    },
    diarySectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    diarySubtitle: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 12,
        fontStyle: 'italic',
    },
    diaryInput: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#2c3e50',
        minHeight: 200, // Expanded height for zen mode
        maxHeight: 300,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        lineHeight: 24, // Better readability
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    wordCounter: {
        fontSize: 13,
        color: '#7f8c8d',
        fontWeight: '500',
    },
    wordCounterWarning: {
        color: '#f39c12', // Orange warning when approaching limit
    },
    wordCounterLimit: {
        color: '#e74c3c', // Red when at limit
        fontWeight: 'bold',
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    autoSaveContainer: {
        marginTop: 8,
        minHeight: 20,
        alignItems: 'flex-end',
    },
    savingText: {
        fontSize: 12,
        color: '#3498db',
        fontStyle: 'italic',
    },
    savedText: {
        fontSize: 12,
        color: '#2ecc71',
        fontWeight: '600',
    },
    textInput: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#2c3e50',
        minHeight: 120,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#ecf0f1',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#7f8c8d',
    },
    saveButton: {
        backgroundColor: '#2ecc71',
        shadowColor: '#2ecc71',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    saveButtonDisabled: {
        backgroundColor: '#bdc3c7',
        shadowOpacity: 0,
        elevation: 0,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
    },
});
