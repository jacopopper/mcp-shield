import { z } from 'zod';
export declare const PIITypeEnum: z.ZodEnum<["EMAIL", "SSN", "CREDIT_CARD", "PHONE_US", "IP_ADDRESS", "AWS_KEY", "GITHUB_TOKEN"]>;
export type PIIType = z.infer<typeof PIITypeEnum>;
export declare const PolicyEffectEnum: z.ZodEnum<["allow", "deny", "prompt"]>;
export type PolicyEffect = z.infer<typeof PolicyEffectEnum>;
export declare const PolicyConditionsSchema: z.ZodObject<{
    params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        matches: z.ZodOptional<z.ZodString>;
        startsWith: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        matches?: string | undefined;
        startsWith?: string | undefined;
    }, {
        matches?: string | undefined;
        startsWith?: string | undefined;
    }>>>;
    time: z.ZodOptional<z.ZodObject<{
        after: z.ZodOptional<z.ZodString>;
        before: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        after?: string | undefined;
        before?: string | undefined;
    }, {
        after?: string | undefined;
        before?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    params?: Record<string, {
        matches?: string | undefined;
        startsWith?: string | undefined;
    }> | undefined;
    time?: {
        after?: string | undefined;
        before?: string | undefined;
    } | undefined;
}, {
    params?: Record<string, {
        matches?: string | undefined;
        startsWith?: string | undefined;
    }> | undefined;
    time?: {
        after?: string | undefined;
        before?: string | undefined;
    } | undefined;
}>;
export declare const PolicyRuleSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    effect: z.ZodEnum<["allow", "deny", "prompt"]>;
    tools: z.ZodArray<z.ZodString, "many">;
    conditions: z.ZodOptional<z.ZodObject<{
        params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            matches: z.ZodOptional<z.ZodString>;
            startsWith: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            matches?: string | undefined;
            startsWith?: string | undefined;
        }, {
            matches?: string | undefined;
            startsWith?: string | undefined;
        }>>>;
        time: z.ZodOptional<z.ZodObject<{
            after: z.ZodOptional<z.ZodString>;
            before: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            after?: string | undefined;
            before?: string | undefined;
        }, {
            after?: string | undefined;
            before?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        params?: Record<string, {
            matches?: string | undefined;
            startsWith?: string | undefined;
        }> | undefined;
        time?: {
            after?: string | undefined;
            before?: string | undefined;
        } | undefined;
    }, {
        params?: Record<string, {
            matches?: string | undefined;
            startsWith?: string | undefined;
        }> | undefined;
        time?: {
            after?: string | undefined;
            before?: string | undefined;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    effect: "allow" | "deny" | "prompt";
    tools: string[];
    name?: string | undefined;
    conditions?: {
        params?: Record<string, {
            matches?: string | undefined;
            startsWith?: string | undefined;
        }> | undefined;
        time?: {
            after?: string | undefined;
            before?: string | undefined;
        } | undefined;
    } | undefined;
}, {
    effect: "allow" | "deny" | "prompt";
    tools: string[];
    name?: string | undefined;
    conditions?: {
        params?: Record<string, {
            matches?: string | undefined;
            startsWith?: string | undefined;
        }> | undefined;
        time?: {
            after?: string | undefined;
            before?: string | undefined;
        } | undefined;
    } | undefined;
}>;
export type PolicyRule = z.infer<typeof PolicyRuleSchema>;
export declare const PIIConfigSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    patterns: z.ZodDefault<z.ZodArray<z.ZodEnum<["EMAIL", "SSN", "CREDIT_CARD", "PHONE_US", "IP_ADDRESS", "AWS_KEY", "GITHUB_TOKEN"]>, "many">>;
    allowList: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    patterns: ("EMAIL" | "SSN" | "CREDIT_CARD" | "PHONE_US" | "IP_ADDRESS" | "AWS_KEY" | "GITHUB_TOKEN")[];
    allowList: string[];
}, {
    enabled?: boolean | undefined;
    patterns?: ("EMAIL" | "SSN" | "CREDIT_CARD" | "PHONE_US" | "IP_ADDRESS" | "AWS_KEY" | "GITHUB_TOKEN")[] | undefined;
    allowList?: string[] | undefined;
}>;
export declare const InjectionConfigSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    threshold: z.ZodDefault<z.ZodNumber>;
    blockOnDetect: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    threshold: number;
    blockOnDetect: boolean;
}, {
    enabled?: boolean | undefined;
    threshold?: number | undefined;
    blockOnDetect?: boolean | undefined;
}>;
export declare const CommandConfigSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    mode: z.ZodDefault<z.ZodEnum<["escape", "strip", "block"]>>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    mode: "strip" | "escape" | "block";
}, {
    enabled?: boolean | undefined;
    mode?: "strip" | "escape" | "block" | undefined;
}>;
export declare const LoopConfigSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    maxIdenticalCalls: z.ZodDefault<z.ZodNumber>;
    maxSequenceRepeats: z.ZodDefault<z.ZodNumber>;
    windowSize: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    maxIdenticalCalls: number;
    maxSequenceRepeats: number;
    windowSize: number;
}, {
    enabled?: boolean | undefined;
    maxIdenticalCalls?: number | undefined;
    maxSequenceRepeats?: number | undefined;
    windowSize?: number | undefined;
}>;
export declare const NeuralConfigSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    modelId: z.ZodDefault<z.ZodString>;
    threshold: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    threshold: number;
    modelId: string;
}, {
    enabled?: boolean | undefined;
    threshold?: number | undefined;
    modelId?: string | undefined;
}>;
export declare const DetectionConfigSchema: z.ZodObject<{
    pii: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        patterns: z.ZodDefault<z.ZodArray<z.ZodEnum<["EMAIL", "SSN", "CREDIT_CARD", "PHONE_US", "IP_ADDRESS", "AWS_KEY", "GITHUB_TOKEN"]>, "many">>;
        allowList: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        patterns: ("EMAIL" | "SSN" | "CREDIT_CARD" | "PHONE_US" | "IP_ADDRESS" | "AWS_KEY" | "GITHUB_TOKEN")[];
        allowList: string[];
    }, {
        enabled?: boolean | undefined;
        patterns?: ("EMAIL" | "SSN" | "CREDIT_CARD" | "PHONE_US" | "IP_ADDRESS" | "AWS_KEY" | "GITHUB_TOKEN")[] | undefined;
        allowList?: string[] | undefined;
    }>>;
    injection: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        threshold: z.ZodDefault<z.ZodNumber>;
        blockOnDetect: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        threshold: number;
        blockOnDetect: boolean;
    }, {
        enabled?: boolean | undefined;
        threshold?: number | undefined;
        blockOnDetect?: boolean | undefined;
    }>>;
    command: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        mode: z.ZodDefault<z.ZodEnum<["escape", "strip", "block"]>>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        mode: "strip" | "escape" | "block";
    }, {
        enabled?: boolean | undefined;
        mode?: "strip" | "escape" | "block" | undefined;
    }>>;
    loop: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        maxIdenticalCalls: z.ZodDefault<z.ZodNumber>;
        maxSequenceRepeats: z.ZodDefault<z.ZodNumber>;
        windowSize: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        maxIdenticalCalls: number;
        maxSequenceRepeats: number;
        windowSize: number;
    }, {
        enabled?: boolean | undefined;
        maxIdenticalCalls?: number | undefined;
        maxSequenceRepeats?: number | undefined;
        windowSize?: number | undefined;
    }>>;
    neural: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        modelId: z.ZodDefault<z.ZodString>;
        threshold: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        threshold: number;
        modelId: string;
    }, {
        enabled?: boolean | undefined;
        threshold?: number | undefined;
        modelId?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    pii: {
        enabled: boolean;
        patterns: ("EMAIL" | "SSN" | "CREDIT_CARD" | "PHONE_US" | "IP_ADDRESS" | "AWS_KEY" | "GITHUB_TOKEN")[];
        allowList: string[];
    };
    injection: {
        enabled: boolean;
        threshold: number;
        blockOnDetect: boolean;
    };
    command: {
        enabled: boolean;
        mode: "strip" | "escape" | "block";
    };
    loop: {
        enabled: boolean;
        maxIdenticalCalls: number;
        maxSequenceRepeats: number;
        windowSize: number;
    };
    neural: {
        enabled: boolean;
        threshold: number;
        modelId: string;
    };
}, {
    pii?: {
        enabled?: boolean | undefined;
        patterns?: ("EMAIL" | "SSN" | "CREDIT_CARD" | "PHONE_US" | "IP_ADDRESS" | "AWS_KEY" | "GITHUB_TOKEN")[] | undefined;
        allowList?: string[] | undefined;
    } | undefined;
    injection?: {
        enabled?: boolean | undefined;
        threshold?: number | undefined;
        blockOnDetect?: boolean | undefined;
    } | undefined;
    command?: {
        enabled?: boolean | undefined;
        mode?: "strip" | "escape" | "block" | undefined;
    } | undefined;
    loop?: {
        enabled?: boolean | undefined;
        maxIdenticalCalls?: number | undefined;
        maxSequenceRepeats?: number | undefined;
        windowSize?: number | undefined;
    } | undefined;
    neural?: {
        enabled?: boolean | undefined;
        threshold?: number | undefined;
        modelId?: string | undefined;
    } | undefined;
}>;
export declare const PolicyConfigSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    defaultEffect: z.ZodDefault<z.ZodEnum<["allow", "deny", "prompt"]>>;
    rules: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        effect: z.ZodEnum<["allow", "deny", "prompt"]>;
        tools: z.ZodArray<z.ZodString, "many">;
        conditions: z.ZodOptional<z.ZodObject<{
            params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
                matches: z.ZodOptional<z.ZodString>;
                startsWith: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                matches?: string | undefined;
                startsWith?: string | undefined;
            }, {
                matches?: string | undefined;
                startsWith?: string | undefined;
            }>>>;
            time: z.ZodOptional<z.ZodObject<{
                after: z.ZodOptional<z.ZodString>;
                before: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                after?: string | undefined;
                before?: string | undefined;
            }, {
                after?: string | undefined;
                before?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            params?: Record<string, {
                matches?: string | undefined;
                startsWith?: string | undefined;
            }> | undefined;
            time?: {
                after?: string | undefined;
                before?: string | undefined;
            } | undefined;
        }, {
            params?: Record<string, {
                matches?: string | undefined;
                startsWith?: string | undefined;
            }> | undefined;
            time?: {
                after?: string | undefined;
                before?: string | undefined;
            } | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        effect: "allow" | "deny" | "prompt";
        tools: string[];
        name?: string | undefined;
        conditions?: {
            params?: Record<string, {
                matches?: string | undefined;
                startsWith?: string | undefined;
            }> | undefined;
            time?: {
                after?: string | undefined;
                before?: string | undefined;
            } | undefined;
        } | undefined;
    }, {
        effect: "allow" | "deny" | "prompt";
        tools: string[];
        name?: string | undefined;
        conditions?: {
            params?: Record<string, {
                matches?: string | undefined;
                startsWith?: string | undefined;
            }> | undefined;
            time?: {
                after?: string | undefined;
                before?: string | undefined;
            } | undefined;
        } | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    defaultEffect: "allow" | "deny" | "prompt";
    rules: {
        effect: "allow" | "deny" | "prompt";
        tools: string[];
        name?: string | undefined;
        conditions?: {
            params?: Record<string, {
                matches?: string | undefined;
                startsWith?: string | undefined;
            }> | undefined;
            time?: {
                after?: string | undefined;
                before?: string | undefined;
            } | undefined;
        } | undefined;
    }[];
}, {
    enabled?: boolean | undefined;
    defaultEffect?: "allow" | "deny" | "prompt" | undefined;
    rules?: {
        effect: "allow" | "deny" | "prompt";
        tools: string[];
        name?: string | undefined;
        conditions?: {
            params?: Record<string, {
                matches?: string | undefined;
                startsWith?: string | undefined;
            }> | undefined;
            time?: {
                after?: string | undefined;
                before?: string | undefined;
            } | undefined;
        } | undefined;
    }[] | undefined;
}>;
export declare const HITLConfigSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    timeout: z.ZodDefault<z.ZodNumber>;
    sessionAllowList: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    timeout: number;
    sessionAllowList: boolean;
}, {
    enabled?: boolean | undefined;
    timeout?: number | undefined;
    sessionAllowList?: boolean | undefined;
}>;
export declare const AuditConfigSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    logFile: z.ZodOptional<z.ZodString>;
    redactLogs: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    redactLogs: boolean;
    logFile?: string | undefined;
}, {
    enabled?: boolean | undefined;
    logFile?: string | undefined;
    redactLogs?: boolean | undefined;
}>;
export declare const ShieldConfigSchema: z.ZodObject<{
    version: z.ZodDefault<z.ZodLiteral<"1.0">>;
    detection: z.ZodDefault<z.ZodObject<{
        pii: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            patterns: z.ZodDefault<z.ZodArray<z.ZodEnum<["EMAIL", "SSN", "CREDIT_CARD", "PHONE_US", "IP_ADDRESS", "AWS_KEY", "GITHUB_TOKEN"]>, "many">>;
            allowList: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            patterns: ("EMAIL" | "SSN" | "CREDIT_CARD" | "PHONE_US" | "IP_ADDRESS" | "AWS_KEY" | "GITHUB_TOKEN")[];
            allowList: string[];
        }, {
            enabled?: boolean | undefined;
            patterns?: ("EMAIL" | "SSN" | "CREDIT_CARD" | "PHONE_US" | "IP_ADDRESS" | "AWS_KEY" | "GITHUB_TOKEN")[] | undefined;
            allowList?: string[] | undefined;
        }>>;
        injection: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            threshold: z.ZodDefault<z.ZodNumber>;
            blockOnDetect: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            threshold: number;
            blockOnDetect: boolean;
        }, {
            enabled?: boolean | undefined;
            threshold?: number | undefined;
            blockOnDetect?: boolean | undefined;
        }>>;
        command: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            mode: z.ZodDefault<z.ZodEnum<["escape", "strip", "block"]>>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            mode: "strip" | "escape" | "block";
        }, {
            enabled?: boolean | undefined;
            mode?: "strip" | "escape" | "block" | undefined;
        }>>;
        loop: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            maxIdenticalCalls: z.ZodDefault<z.ZodNumber>;
            maxSequenceRepeats: z.ZodDefault<z.ZodNumber>;
            windowSize: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            maxIdenticalCalls: number;
            maxSequenceRepeats: number;
            windowSize: number;
        }, {
            enabled?: boolean | undefined;
            maxIdenticalCalls?: number | undefined;
            maxSequenceRepeats?: number | undefined;
            windowSize?: number | undefined;
        }>>;
        neural: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            modelId: z.ZodDefault<z.ZodString>;
            threshold: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            threshold: number;
            modelId: string;
        }, {
            enabled?: boolean | undefined;
            threshold?: number | undefined;
            modelId?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        pii: {
            enabled: boolean;
            patterns: ("EMAIL" | "SSN" | "CREDIT_CARD" | "PHONE_US" | "IP_ADDRESS" | "AWS_KEY" | "GITHUB_TOKEN")[];
            allowList: string[];
        };
        injection: {
            enabled: boolean;
            threshold: number;
            blockOnDetect: boolean;
        };
        command: {
            enabled: boolean;
            mode: "strip" | "escape" | "block";
        };
        loop: {
            enabled: boolean;
            maxIdenticalCalls: number;
            maxSequenceRepeats: number;
            windowSize: number;
        };
        neural: {
            enabled: boolean;
            threshold: number;
            modelId: string;
        };
    }, {
        pii?: {
            enabled?: boolean | undefined;
            patterns?: ("EMAIL" | "SSN" | "CREDIT_CARD" | "PHONE_US" | "IP_ADDRESS" | "AWS_KEY" | "GITHUB_TOKEN")[] | undefined;
            allowList?: string[] | undefined;
        } | undefined;
        injection?: {
            enabled?: boolean | undefined;
            threshold?: number | undefined;
            blockOnDetect?: boolean | undefined;
        } | undefined;
        command?: {
            enabled?: boolean | undefined;
            mode?: "strip" | "escape" | "block" | undefined;
        } | undefined;
        loop?: {
            enabled?: boolean | undefined;
            maxIdenticalCalls?: number | undefined;
            maxSequenceRepeats?: number | undefined;
            windowSize?: number | undefined;
        } | undefined;
        neural?: {
            enabled?: boolean | undefined;
            threshold?: number | undefined;
            modelId?: string | undefined;
        } | undefined;
    }>>;
    policy: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        defaultEffect: z.ZodDefault<z.ZodEnum<["allow", "deny", "prompt"]>>;
        rules: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            effect: z.ZodEnum<["allow", "deny", "prompt"]>;
            tools: z.ZodArray<z.ZodString, "many">;
            conditions: z.ZodOptional<z.ZodObject<{
                params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
                    matches: z.ZodOptional<z.ZodString>;
                    startsWith: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    matches?: string | undefined;
                    startsWith?: string | undefined;
                }, {
                    matches?: string | undefined;
                    startsWith?: string | undefined;
                }>>>;
                time: z.ZodOptional<z.ZodObject<{
                    after: z.ZodOptional<z.ZodString>;
                    before: z.ZodOptional<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    after?: string | undefined;
                    before?: string | undefined;
                }, {
                    after?: string | undefined;
                    before?: string | undefined;
                }>>;
            }, "strip", z.ZodTypeAny, {
                params?: Record<string, {
                    matches?: string | undefined;
                    startsWith?: string | undefined;
                }> | undefined;
                time?: {
                    after?: string | undefined;
                    before?: string | undefined;
                } | undefined;
            }, {
                params?: Record<string, {
                    matches?: string | undefined;
                    startsWith?: string | undefined;
                }> | undefined;
                time?: {
                    after?: string | undefined;
                    before?: string | undefined;
                } | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            effect: "allow" | "deny" | "prompt";
            tools: string[];
            name?: string | undefined;
            conditions?: {
                params?: Record<string, {
                    matches?: string | undefined;
                    startsWith?: string | undefined;
                }> | undefined;
                time?: {
                    after?: string | undefined;
                    before?: string | undefined;
                } | undefined;
            } | undefined;
        }, {
            effect: "allow" | "deny" | "prompt";
            tools: string[];
            name?: string | undefined;
            conditions?: {
                params?: Record<string, {
                    matches?: string | undefined;
                    startsWith?: string | undefined;
                }> | undefined;
                time?: {
                    after?: string | undefined;
                    before?: string | undefined;
                } | undefined;
            } | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        defaultEffect: "allow" | "deny" | "prompt";
        rules: {
            effect: "allow" | "deny" | "prompt";
            tools: string[];
            name?: string | undefined;
            conditions?: {
                params?: Record<string, {
                    matches?: string | undefined;
                    startsWith?: string | undefined;
                }> | undefined;
                time?: {
                    after?: string | undefined;
                    before?: string | undefined;
                } | undefined;
            } | undefined;
        }[];
    }, {
        enabled?: boolean | undefined;
        defaultEffect?: "allow" | "deny" | "prompt" | undefined;
        rules?: {
            effect: "allow" | "deny" | "prompt";
            tools: string[];
            name?: string | undefined;
            conditions?: {
                params?: Record<string, {
                    matches?: string | undefined;
                    startsWith?: string | undefined;
                }> | undefined;
                time?: {
                    after?: string | undefined;
                    before?: string | undefined;
                } | undefined;
            } | undefined;
        }[] | undefined;
    }>>;
    hitl: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        timeout: z.ZodDefault<z.ZodNumber>;
        sessionAllowList: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        timeout: number;
        sessionAllowList: boolean;
    }, {
        enabled?: boolean | undefined;
        timeout?: number | undefined;
        sessionAllowList?: boolean | undefined;
    }>>;
    audit: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        logFile: z.ZodOptional<z.ZodString>;
        redactLogs: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        redactLogs: boolean;
        logFile?: string | undefined;
    }, {
        enabled?: boolean | undefined;
        logFile?: string | undefined;
        redactLogs?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    version: "1.0";
    detection: {
        pii: {
            enabled: boolean;
            patterns: ("EMAIL" | "SSN" | "CREDIT_CARD" | "PHONE_US" | "IP_ADDRESS" | "AWS_KEY" | "GITHUB_TOKEN")[];
            allowList: string[];
        };
        injection: {
            enabled: boolean;
            threshold: number;
            blockOnDetect: boolean;
        };
        command: {
            enabled: boolean;
            mode: "strip" | "escape" | "block";
        };
        loop: {
            enabled: boolean;
            maxIdenticalCalls: number;
            maxSequenceRepeats: number;
            windowSize: number;
        };
        neural: {
            enabled: boolean;
            threshold: number;
            modelId: string;
        };
    };
    policy: {
        enabled: boolean;
        defaultEffect: "allow" | "deny" | "prompt";
        rules: {
            effect: "allow" | "deny" | "prompt";
            tools: string[];
            name?: string | undefined;
            conditions?: {
                params?: Record<string, {
                    matches?: string | undefined;
                    startsWith?: string | undefined;
                }> | undefined;
                time?: {
                    after?: string | undefined;
                    before?: string | undefined;
                } | undefined;
            } | undefined;
        }[];
    };
    hitl: {
        enabled: boolean;
        timeout: number;
        sessionAllowList: boolean;
    };
    audit: {
        enabled: boolean;
        redactLogs: boolean;
        logFile?: string | undefined;
    };
}, {
    version?: "1.0" | undefined;
    detection?: {
        pii?: {
            enabled?: boolean | undefined;
            patterns?: ("EMAIL" | "SSN" | "CREDIT_CARD" | "PHONE_US" | "IP_ADDRESS" | "AWS_KEY" | "GITHUB_TOKEN")[] | undefined;
            allowList?: string[] | undefined;
        } | undefined;
        injection?: {
            enabled?: boolean | undefined;
            threshold?: number | undefined;
            blockOnDetect?: boolean | undefined;
        } | undefined;
        command?: {
            enabled?: boolean | undefined;
            mode?: "strip" | "escape" | "block" | undefined;
        } | undefined;
        loop?: {
            enabled?: boolean | undefined;
            maxIdenticalCalls?: number | undefined;
            maxSequenceRepeats?: number | undefined;
            windowSize?: number | undefined;
        } | undefined;
        neural?: {
            enabled?: boolean | undefined;
            threshold?: number | undefined;
            modelId?: string | undefined;
        } | undefined;
    } | undefined;
    policy?: {
        enabled?: boolean | undefined;
        defaultEffect?: "allow" | "deny" | "prompt" | undefined;
        rules?: {
            effect: "allow" | "deny" | "prompt";
            tools: string[];
            name?: string | undefined;
            conditions?: {
                params?: Record<string, {
                    matches?: string | undefined;
                    startsWith?: string | undefined;
                }> | undefined;
                time?: {
                    after?: string | undefined;
                    before?: string | undefined;
                } | undefined;
            } | undefined;
        }[] | undefined;
    } | undefined;
    hitl?: {
        enabled?: boolean | undefined;
        timeout?: number | undefined;
        sessionAllowList?: boolean | undefined;
    } | undefined;
    audit?: {
        enabled?: boolean | undefined;
        logFile?: string | undefined;
        redactLogs?: boolean | undefined;
    } | undefined;
}>;
export type ShieldConfig = z.input<typeof ShieldConfigSchema>;
export type ResolvedConfig = z.output<typeof ShieldConfigSchema>;
export type PIIConfig = z.output<typeof PIIConfigSchema>;
export type InjectionConfig = z.output<typeof InjectionConfigSchema>;
export type PolicyConfig = z.output<typeof PolicyConfigSchema>;
export type HITLConfig = z.output<typeof HITLConfigSchema>;
export type AuditConfig = z.output<typeof AuditConfigSchema>;
export type CommandConfig = z.output<typeof CommandConfigSchema>;
export type LoopConfig = z.output<typeof LoopConfigSchema>;
export type NeuralConfig = z.output<typeof NeuralConfigSchema>;
//# sourceMappingURL=schema.d.ts.map