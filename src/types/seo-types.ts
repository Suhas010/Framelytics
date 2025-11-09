export type SEOIssueType = "error" | "warning" | "info" | "success";
export type SEOIssuePriority = "critical" | "important" | "nice-to-have";

export interface SEOIssue {
    type: SEOIssueType;
    message: string;
    category: SEOCategory;
    element?: string;
    recommendation?: string;
    elementId?: string;
    elementPosition?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    screenshot?: string; // Base64 encoded image
    priority: SEOIssuePriority;
    externalResourceLink?: string;
    externalResourceTitle?: string;
}

export type SEOCategory = 
    | "metadata"
    | "headings"
    | "images"
    | "links"
    | "structure"
    | "content"
    | "performance"
    | "accessibility"
    | "mobile"
    | "social"
    | "security"
    | "favicon"
    | "schema"
    | "international";

export interface SEOAnalysisResult {
    issues: SEOIssue[];
    score: number;
    categories: Record<SEOCategory, {
        issues: SEOIssue[];
        score: number;
    }>;
}

export interface FramerNode {
    id?: string;
    name: string;
    text?: string;
    type?: string;
    alt?: string;
    href?: string;
    rel?: string;
    ariaLabel?: string;
    role?: string;
    style?: {
        fontSize?: number;
        color?: string;
        backgroundColor?: string;
        width?: number;
        height?: number;
    };
    // Metadata properties
    metadata?: {
        name?: string;
        content?: string;
        property?: string;
        htmlTag?: string;
        [key: string]: string | undefined;
    };
    children?: FramerNode[];
}

export interface SEOAnalyzerOptions {
    includeMobile?: boolean;
    includePerformance?: boolean;
    includeAccessibility?: boolean;
    detailedReport?: boolean;
    filter?: SEOCategory[] | string[]; // Categories to include in analysis
} 