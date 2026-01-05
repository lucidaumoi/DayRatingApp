/**
 * Word Count Algorithm Test Suite
 * Verifies the word counting function works correctly
 */

const calculateWordCount = (text: string): number => {
    // Step 1: Trim whitespace
    const trimmed = text.trim();

    // Edge case: empty string
    if (trimmed.length === 0) return 0;

    // Step 2 & 3: Split by whitespace and filter out empty strings
    const words = trimmed.split(/\s+/).filter(Boolean);

    // Step 4: Return word count
    return words.length;
};

// Test Cases
const tests = [
    { input: 'hello world', expected: 2, description: 'Two simple words' },
    { input: 'a b c', expected: 3, description: 'Three single letters' },
    { input: '  hello  world  ', expected: 2, description: 'Words with extra spaces' },
    { input: '', expected: 0, description: 'Empty string' },
    { input: '   ', expected: 0, description: 'Only spaces' },
    { input: 'hello', expected: 1, description: 'Single word' },
    { input: 'hello\nworld', expected: 2, description: 'Words with newline' },
    { input: 'hello\tworld', expected: 2, description: 'Words with tab' },
    { input: 'hello\n\n\nworld', expected: 2, description: 'Words with multiple newlines' },
    { input: 'The quick brown fox', expected: 4, description: 'Four words' },
    { input: '  The  quick  brown  fox  ', expected: 4, description: 'Four words with extra spaces' },
];

console.log('🧪 Word Count Algorithm Test Suite\n');
console.log('='.repeat(60));

let passed = 0;
let failed = 0;

tests.forEach((test, index) => {
    const result = calculateWordCount(test.input);
    const isPass = result === test.expected;

    if (isPass) {
        passed++;
        console.log(`✅ Test ${index + 1}: PASS - ${test.description}`);
        console.log(`   Input: "${test.input}"`);
        console.log(`   Expected: ${test.expected}, Got: ${result}\n`);
    } else {
        failed++;
        console.log(`❌ Test ${index + 1}: FAIL - ${test.description}`);
        console.log(`   Input: "${test.input}"`);
        console.log(`   Expected: ${test.expected}, Got: ${result}\n`);
    }
});

console.log('='.repeat(60));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${tests.length} tests`);

if (failed === 0) {
    console.log('🎉 All tests passed! Word counting is working correctly.');
} else {
    console.log('⚠️  Some tests failed. Please review the implementation.');
}

// Export for use in the app
export { calculateWordCount };
