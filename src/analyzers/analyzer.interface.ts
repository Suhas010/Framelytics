import { FramerNode, SEOIssue, SEOCategory } from "../types/seo-types";

export interface Analyzer {
    category: SEOCategory;
    analyze(nodes: FramerNode[]): SEOIssue[];
} 