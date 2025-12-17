// All patterns are designed to avoid catastrophic backtracking (ReDoS-safe)
export const PII_PATTERNS = [
    {
        name: 'Email Address',
        type: 'EMAIL',
        // Bounded repetition, no nested quantifiers
        pattern: /[a-zA-Z0-9._%+-]{1,64}@[a-zA-Z0-9.-]{1,255}\.[a-zA-Z]{2,10}/g,
    },
    {
        name: 'US Social Security Number',
        type: 'SSN',
        // Strict format: XXX-XX-XXXX
        pattern: /\b[0-9]{3}-[0-9]{2}-[0-9]{4}\b/g,
    },
    {
        name: 'Credit Card Number',
        type: 'CREDIT_CARD',
        // Major card prefixes with optional separators
        pattern: /\b(?:4[0-9]{3}|5[1-5][0-9]{2}|3[47][0-9]{2}|6(?:011|5[0-9]{2}))[- ]?[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}\b/g,
        // validate will be set below after isValidLuhn is imported
    },
    {
        name: 'US Phone Number',
        type: 'PHONE_US',
        // Formats: (XXX) XXX-XXXX, XXX-XXX-XXXX, XXX.XXX.XXXX
        pattern: /\b(?:\([0-9]{3}\)\s?|[0-9]{3}[-.])[0-9]{3}[-.][0-9]{4}\b/g,
    },
    {
        name: 'IP Address (v4)',
        type: 'IP_ADDRESS',
        pattern: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    },
    {
        name: 'AWS Access Key',
        type: 'AWS_KEY',
        // AKIA followed by 16 alphanumeric chars
        pattern: /\b(AKIA[0-9A-Z]{16})\b/g,
    },
    {
        name: 'GitHub Personal Access Token',
        type: 'GITHUB_TOKEN',
        // ghp_, gho_, ghu_, ghs_, ghr_ prefixes
        pattern: /\b(gh[pousr]_[a-zA-Z0-9]{36,255})\b/g,
    },
];
// Get pattern by type
export function getPatternByType(type) {
    return PII_PATTERNS.find(p => p.type === type);
}
//# sourceMappingURL=patterns.js.map