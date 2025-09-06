/**
 * Utilities for file handling
 */

/**
 * Generates a meaningful filename from text content
 * @param {string} text - The text content to generate filename from
 * @param {number} maxLength - Maximum length of the filename (excluding extension)
 * @returns {string} A sanitized filename
 */
export const generateFilenameFromText = (text, maxLength = 30) => {
    if (!text || typeof text !== 'string') {
        return 'text.txt';
    }

    // Get the first few words, removing line breaks and extra spaces
    let cleanText = text.trim()
        .replace(/\r?\n|\r/g, ' ')  // Replace line breaks with spaces
        .replace(/\s+/g, ' ');      // Replace multiple spaces with single space

    // Take the first part of the text (up to maxLength chars)
    let filename = cleanText.substring(0, maxLength);

    // If we cut in the middle of a word, try to find the last space and cut there
    if (filename.length === maxLength && cleanText.length > maxLength) {
        const lastSpaceIndex = filename.lastIndexOf(' ');
        if (lastSpaceIndex > maxLength * 0.5) { // Only trim at word boundary if we're not losing too much text
            filename = filename.substring(0, lastSpaceIndex);
        }
    }

    // Remove special characters that aren't allowed in filenames
    filename = filename
        .replace(/[<>:"/\\|?*]/g, '') // Remove characters not allowed in filenames
        .replace(/\./g, '_')          // Replace dots with underscores
        .trim();

    // If after sanitizing we have an empty string, use a default
    if (!filename) {
        return 'text.txt';
    }

    // Replace spaces with underscores for a clean filename
    filename = filename.replace(/\s+/g, '_');

    return `${filename}.txt`;
}; 