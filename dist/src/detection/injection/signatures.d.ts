export interface AttackSignature {
    name: string;
    category: 'override' | 'roleplay' | 'extraction' | 'obfuscation' | 'delimiter';
    patterns: RegExp[];
    weight: number;
}
export declare const ATTACK_SIGNATURES: AttackSignature[];
export type AttackCategory = AttackSignature['category'];
//# sourceMappingURL=signatures.d.ts.map