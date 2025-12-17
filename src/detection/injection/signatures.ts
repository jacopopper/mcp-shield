export interface AttackSignature {
    name: string;
    category: 'override' | 'roleplay' | 'extraction' | 'obfuscation' | 'delimiter';
    patterns: RegExp[];
    weight: number; // Risk contribution (0-1)
}

export const ATTACK_SIGNATURES: AttackSignature[] = [
    // System Override Attempts
    {
        name: 'instruction_override',
        category: 'override',
        patterns: [
            /ignore\s+(all\s+)?previous\s+instructions?/i,
            /disregard\s+(all\s+)?(your\s+)?(previous|above|prior)/i,
            /forget\s+(all\s+)?(your\s+)?(previous|above|prior|original)\s+\w+/i,
            /override\s+(your\s+)?(all\s+)?(previous\s+)?instructions?/i,
        ],
        weight: 0.9,
    },
    {
        name: 'new_instructions',
        category: 'override',
        patterns: [
            /new\s+instructions?\s*:/i,
            /updated?\s+instructions?\s*:/i,
            /your\s+(new\s+)?instructions?\s+(are|is)/i,
            /your\s+real\s+instructions?\s+are/i,
        ],
        weight: 0.8,
    },

    // Role Hijacking
    {
        name: 'role_hijacking',
        category: 'roleplay',
        patterns: [
            /you\s+are\s+now\s+(a|an|in|playing|\w+)/i,
            /act\s+as\s+(a|an|if\s+you\s+were)/i,
            /roleplay\s+as/i,
            /pretend\s+(to\s+be|you('re|[\s]are))/i,
            /enter\s+(\w+\s+)?(dan|developer|jailbreak|god)?\s*mode/i,
        ],
        weight: 0.6,
    },

    // Prompt Extraction
    {
        name: 'prompt_extraction',
        category: 'extraction',
        patterns: [
            /what\s+(are|were)\s+your\s+(original\s+)?instructions/i,
            /show\s+(me\s+)?(your\s+)?(system\s+)?prompt/i,
            /reveal\s+(your\s+)?(system\s+|hidden\s+)?instructions/i,
            /output\s+(your\s+)?(system\s+)?prompt/i,
            /repeat\s+(your\s+)?initial\s+(prompt|instructions)/i,
        ],
        weight: 0.5,
    },

    // Delimiter Injection (fake system messages)
    {
        name: 'delimiter_injection',
        category: 'delimiter',
        patterns: [
            /^(system|assistant|user)\s*:/im,
            /<\/?system>/i,
            /\[INST\]|\[\/INST\]/i,
            /<<\s*SYS\s*>>|<<\s*\/SYS\s*>>/i,
            /###\s*(system|instruction|human|assistant)/i,
        ],
        weight: 0.7,
    },

    // Obfuscation Detection
    {
        name: 'base64_payload',
        category: 'obfuscation',
        patterns: [
            // Base64 strings of significant length
            /[A-Za-z0-9+/]{50,}={0,2}/,
        ],
        weight: 0.4,
    },
    {
        name: 'unicode_obfuscation',
        category: 'obfuscation',
        patterns: [
            // Homoglyph detection (mixed scripts)
            /[\u0400-\u04FF].*[a-zA-Z]|[a-zA-Z].*[\u0400-\u04FF]/,
            // Zero-width characters
            /[\u200B-\u200D\uFEFF]/,
        ],
        weight: 0.5,
    },
    {
        name: 'token_splitting',
        category: 'obfuscation',
        patterns: [
            // Spaced out letters: "i g n o r e"
            /\b[a-z]\s+[a-z]\s+[a-z]\s+[a-z]\s+[a-z]\s+[a-z]\b/i,
        ],
        weight: 0.3,
    },
];

export type AttackCategory = AttackSignature['category'];
