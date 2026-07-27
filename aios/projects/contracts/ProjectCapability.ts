/**
 * ProjectCapability represents a capability required by a project.
 * Currently represented as a string for simplicity, but designed to allow
 * future expansion into a CapabilityDescriptor interface (e.g., id, category, level)
 * when Agent Router requires more complex matching.
 */
export type ProjectCapability = string;
