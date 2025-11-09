import { Analyzer } from "../analyzers/analyzer.interface";
import { MetadataAnalyzer } from "../analyzers/metadata-analyzer";
import { ImagesAnalyzer } from "../analyzers/images-analyzer";
import { SocialAnalyzer } from "../analyzers/social-analyzer";
import { StructureAnalyzer } from "../analyzers/structure-analyzer";
import { FramerNode, SEOAnalysisResult, SEOCategory, SEOIssue, SEOAnalyzerOptions } from "../types/seo-types";
import { framer, AnyNode } from "framer-plugin";
import { ContentAnalyzer } from "../analyzers/content-analyzer";
import { AccessibilityAnalyzer } from "../analyzers/accessibility-analyzer";
import { LinksAnalyzer } from "../analyzers/links-analyzer";
import { PerformanceAnalyzer } from "../analyzers/performance-analyzer";
import { MobileAnalyzer } from "../analyzers/mobile-analyzer";
import { SecurityAnalyzer } from "../analyzers/security-analyzer";
import { SchemaAnalyzer } from "../analyzers/schema-analyzer";
import { InternationalAnalyzer } from "../analyzers/international-analyzer";

export class SEOAnalyzerService {
    private analyzers: Partial<Record<SEOCategory, Analyzer>> = {
        metadata: new MetadataAnalyzer(),
        structure: new StructureAnalyzer(),
        social: new SocialAnalyzer(),
        images: new ImagesAnalyzer(),
        content: new ContentAnalyzer(),
        accessibility: new AccessibilityAnalyzer(),
        links: new LinksAnalyzer(),
        performance: new PerformanceAnalyzer(),
        mobile: new MobileAnalyzer(),
        security: new SecurityAnalyzer(),
        schema: new SchemaAnalyzer(),
        // International analyzer is assigned to metadata category since that's what it returns
        // This allows us to include its checks without needing to modify the UI for a new category
    };
    
    constructor() {
        // Add the international analyzer to the list of analyzers
        // It doesn't need its own category in the results because it reports issues under "metadata"
        const internationalAnalyzer = new InternationalAnalyzer();
        // We'll run it when analyzing metadata
        const existingMetadataAnalyzer = this.analyzers.metadata;
        
        // Create a composite analyzer for metadata that runs both
        if (existingMetadataAnalyzer) {
            this.analyzers.metadata = {
                category: "metadata",
                analyze: (nodes: FramerNode[]) => {
                    const metadataIssues = existingMetadataAnalyzer.analyze(nodes);
                    const internationalIssues = internationalAnalyzer.analyze(nodes);
                    return [...metadataIssues, ...internationalIssues];
                }
            };
        }
    }
    
    async analyzeNodes(nodes: FramerNode[], options: SEOAnalyzerOptions = {}): Promise<SEOAnalysisResult> {
        const allIssues: SEOIssue[] = [];
        const categories: Record<SEOCategory, { issues: SEOIssue[], score: number }> = {
            metadata: { issues: [], score: 0 },
            headings: { issues: [], score: 0 },
            images: { issues: [], score: 0 },
            links: { issues: [], score: 0 },
            structure: { issues: [], score: 0 },
            content: { issues: [], score: 0 },
            performance: { issues: [], score: 0 },
            accessibility: { issues: [], score: 0 },
            mobile: { issues: [], score: 0 },
            social: { issues: [], score: 0 },
            security: { issues: [], score: 0 },
            favicon: { issues: [], score: 0 },
            schema: { issues: [], score: 0 },
            international: { issues: [], score: 0 }
        };
        
        // Run all analyzers and collect issues
        for (const [category, analyzer] of Object.entries(this.analyzers)) {
            // Skip if filtered out
            if (options.filter && !options.filter.includes(category as SEOCategory)) {
                continue;
            }
            
            if (analyzer) {
                const categoryIssues = analyzer.analyze(nodes);
                
                // Enrich issues with element positions and screenshots where possible
                const enrichedIssues = await this.enrichIssuesWithVisualInfo(categoryIssues, nodes);
                
                allIssues.push(...enrichedIssues);
                categories[category as SEOCategory].issues = enrichedIssues;
            }
        }
        
        // Calculate scores for each category
        for (const category of Object.keys(categories) as SEOCategory[]) {
            categories[category].score = this.calculateScoreForCategory(categories[category].issues);
        }
        
        // Calculate overall score
        const score = this.calculateOverallScore(categories);
        
        return {
            issues: allIssues,
            score,
            categories
        };
    }
    
    async createNodesFromFramerSelection(): Promise<FramerNode[]> {
        // Get the actual page structure from Framer
        // This now fetches ALL nodes from the page, not just selection
        const allNodes: FramerNode[] = [];
        
        try {
            // Get the canvas root to analyze the entire page
            const root = await framer.getCanvasRoot();
            
            // Get all text nodes from the page to analyze headings, content, etc.
            const textNodes = await root.getNodesWithType("TextNode");
            
            // IMPORTANT: Filter out replicas (breakpoint variants)
            // Framer creates replica nodes for tablet/mobile breakpoints
            // We only want to analyze the original (desktop) nodes to avoid duplicates
            const originalTextNodes = textNodes.filter(node => !node.isReplica);
            
            console.log(`Found ${textNodes.length} text nodes total, ${originalTextNodes.length} originals (filtered out ${textNodes.length - originalTextNodes.length} replicas)`);
            
            // Convert each text node to our format
            for (const textNode of originalTextNodes) {
                const converted = await this.convertTextNodeWithData(textNode);
                if (converted) {
                    allNodes.push(converted);
                }
            }
            
            // Get custom code (meta tags, title, etc.)
            const customCode = await framer.getCustomCode();
            
            // Parse custom code for meta tags
            const metaNodes = this.parseCustomCodeForMeta(customCode);
            allNodes.push(...metaNodes);
            
            // Get all nodes with images
            const imageNodes = await root.getNodesWithAttributeSet("backgroundImage");
            const originalImageNodes = imageNodes.filter(node => !node.isReplica);
            
            console.log(`Found ${imageNodes.length} image nodes total, ${originalImageNodes.length} originals (filtered out ${imageNodes.length - originalImageNodes.length} replicas)`);
            
            for (const imageNode of originalImageNodes) {
                const converted = await this.convertImageNode(imageNode);
                if (converted) {
                    allNodes.push(converted);
                }
            }
            
            // Get all nodes with links
            const linkNodes = await root.getNodesWithAttributeSet("link");
            const originalLinkNodes = linkNodes.filter(node => !node.isReplica);
            
            console.log(`Found ${linkNodes.length} link nodes total, ${originalLinkNodes.length} originals (filtered out ${linkNodes.length - originalLinkNodes.length} replicas)`);
            
            for (const linkNode of originalLinkNodes) {
                const converted = await this.convertLinkNode(linkNode);
                if (converted) {
                    allNodes.push(converted);
                }
            }
            
            console.log(`✅ Analysis complete: ${allNodes.length} unique nodes analyzed (replicas filtered out)`);
            
        } catch (error) {
            console.error("Error fetching page structure:", error);
            // Fallback to empty array if API fails
            return [];
        }
        
        return allNodes;
    }
    
    private async convertTextNodeWithData(textNode: AnyNode): Promise<FramerNode | null> {
        try {
            // Type guard to ensure it's a TextNode
            if (!('getText' in textNode)) {
                return null;
            }
            
            // Get the actual text content
            const text = await (textNode as {getText: () => Promise<string | null>}).getText();
            
            // Determine the HTML tag based on Framer's text style
            // TextNodes have an inlineTextStyle with a tag property
            let htmlTag = "p"; // default
            const nodeAny = textNode as unknown as Record<string, unknown>;
            if (nodeAny.inlineTextStyle && typeof nodeAny.inlineTextStyle === 'object' && nodeAny.inlineTextStyle !== null) {
                const style = nodeAny.inlineTextStyle as {tag?: string};
                if (style.tag) {
                    htmlTag = style.tag; // h1, h2, h3, h4, h5, h6, p
                }
            }
            
            return {
                id: textNode.id,
                name: htmlTag, // Use the HTML tag as the name for analyzers
                text: text || "",
                type: "text",
                style: {
                    fontSize: nodeAny.font && typeof nodeAny.font === 'object' ? (nodeAny.font as {weight?: number}).weight : undefined,
                },
                // Store the original tag for structure analysis
                metadata: {
                    htmlTag: htmlTag
                }
            };
        } catch (error) {
            console.error("Error converting text node:", error);
            return null;
        }
    }
    
    private async convertImageNode(imageNode: AnyNode): Promise<FramerNode | null> {
        try {
            const nodeAny = imageNode as unknown as Record<string, unknown>;
            return {
                id: imageNode.id,
                name: "image",
                type: "image",
                alt: "", // Framer doesn't have alt text in the same way
                style: {
                    width: nodeAny.width && typeof nodeAny.width === 'object' ? (nodeAny.width as {value?: number}).value : undefined,
                    height: nodeAny.height && typeof nodeAny.height === 'object' ? (nodeAny.height as {value?: number}).value : undefined
                }
            };
        } catch (error) {
            console.error("Error converting image node:", error);
            return null;
        }
    }
    
    private async convertLinkNode(linkNode: AnyNode): Promise<FramerNode | null> {
        try {
            const nodeAny = linkNode as unknown as Record<string, unknown>;
            const text = 'getText' in linkNode ? await (linkNode as {getText: () => Promise<string | null>}).getText() : "";
            
            return {
                id: linkNode.id,
                name: "link",
                type: "link",
                href: typeof nodeAny.link === 'string' ? nodeAny.link : "",
                text: text || "",
                rel: nodeAny.linkOpenInNewTab ? "noopener noreferrer" : undefined
            };
        } catch (error) {
            console.error("Error converting link node:", error);
            return null;
        }
    }
    
    private parseCustomCodeForMeta(customCode: Record<string, {html: string | null; disabled: boolean}>): FramerNode[] {
        const metaNodes: FramerNode[] = [];
        
        // Parse head start and head end for meta tags
        const headHTML = (customCode.headStart?.html || "") + (customCode.headEnd?.html || "");
        
        // Extract title tag
        const titleMatch = headHTML.match(/<title[^>]*>(.*?)<\/title>/i);
        if (titleMatch) {
            metaNodes.push({
                id: "meta-title",
                name: "title",
                text: titleMatch[1],
                type: "meta"
            });
        }
        
        // Extract meta description
        const descMatch = headHTML.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
        if (descMatch) {
            metaNodes.push({
                id: "meta-description",
                name: "meta-description",
                type: "meta",
                metadata: {
                    name: "description",
                    content: descMatch[1]
                }
            });
        }
        
        // Extract viewport meta
        if (headHTML.includes('name="viewport"')) {
            metaNodes.push({
                id: "meta-viewport",
                name: "meta-viewport",
                type: "meta",
                metadata: {
                    name: "viewport"
                }
            });
        }
        
        // Extract canonical URL
        const canonicalMatch = headHTML.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i);
        if (canonicalMatch) {
            metaNodes.push({
                id: "meta-canonical",
                name: "canonical",
                type: "meta",
                href: canonicalMatch[1]
            });
        }
        
        // Extract Open Graph tags
        const ogMatches = headHTML.matchAll(/<meta\s+property=["'](og:[^"']*)["']\s+content=["']([^"']*)["']/gi);
        for (const match of ogMatches) {
            metaNodes.push({
                id: `meta-${match[1]}`,
                name: match[1],
                type: "meta",
                metadata: {
                    property: match[1],
                    content: match[2]
                }
            });
        }
        
        // Extract Twitter Card tags
        const twitterMatches = headHTML.matchAll(/<meta\s+name=["'](twitter:[^"']*)["']\s+content=["']([^"']*)["']/gi);
        for (const match of twitterMatches) {
            metaNodes.push({
                id: `meta-${match[1]}`,
                name: match[1],
                type: "meta",
                metadata: {
                    name: match[1],
                    content: match[2]
                }
            });
        }
        
        return metaNodes;
    }
    
    private calculateScoreForCategory(issues: SEOIssue[]): number {
        if (issues.length === 0) return 100;
        
        // Calculate the score based on the number and severity of issues
        // Start with a perfect score and subtract points for each issue
        let score = 100;
        
        const criticalIssues = issues.filter(issue => issue.priority === "critical");
        const importantIssues = issues.filter(issue => issue.priority === "important");
        const niceToHaveIssues = issues.filter(issue => issue.priority === "nice-to-have");
        
        // Each critical issue subtracts 20 points
        score -= criticalIssues.length * 20;
        
        // Each important issue subtracts 10 points
        score -= importantIssues.length * 10;
        
        // Each nice-to-have issue subtracts 5 points
        score -= niceToHaveIssues.length * 5;
        
        // Ensure the score doesn't go below 0
        return Math.max(0, score);
    }
    
    private calculateOverallScore(categories: Record<SEOCategory, { issues: SEOIssue[], score: number }>): number {
        // Calculate the weighted average of all category scores
        const categoryWeights: Partial<Record<SEOCategory, number>> = {
            metadata: 1.5,
            headings: 1.2,
            structure: 1.2,
            links: 1.2,
            content: 1.2,
            images: 1,
            social: 1,
            accessibility: 1,
            mobile: 1,
            performance: 1,
            security: 0.8,
            favicon: 0.5,
            schema: 1,
            international: 1
        };
        
        let totalWeight = 0;
        let weightedScore = 0;
        
        for (const [category, data] of Object.entries(categories)) {
            if (data.issues.length > 0) {
                const weight = categoryWeights[category as SEOCategory] || 1;
                totalWeight += weight;
                weightedScore += data.score * weight;
            }
        }
        
        return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 100;
    }
    
    // Enrich issues with visual information
    private async enrichIssuesWithVisualInfo(issues: SEOIssue[], nodes: FramerNode[]): Promise<SEOIssue[]> {
        const enrichedIssues: SEOIssue[] = [];
        
        for (const issue of issues) {
            // If the issue has an elementId, try to add position and screenshot
            if (issue.elementId) {
                const node = nodes.find(n => n.id === issue.elementId);
                
                if (node) {
                    try {
                        // Get element position from Framer
                        const rect = await framer.getRect(issue.elementId);
                        if (rect) {
                            issue.elementPosition = {
                                x: rect.x,
                                y: rect.y,
                                width: rect.width,
                                height: rect.height
                            };
                        }
                        
                        // Get actual screenshot using Framer's API
                        issue.screenshot = await this.getElementScreenshot(issue.elementId);
                    } catch (error) {
                        console.error("Failed to capture visual info:", error);
                    }
                }
            }
            
            enrichedIssues.push(issue);
        }
        
        return enrichedIssues;
    }
    
    // Use Framer's API to get a real screenshot
    private async getElementScreenshot(nodeId: string): Promise<string> {
        try {
            // Highlight the element in Framer by zooming to it
            // This helps with visualization even if we can't get a real screenshot
            await framer.zoomIntoView(nodeId);
            
            // Framer doesn't provide a direct API for capturing screenshots of elements
            // So we'll use our fallback method to create a visual representation
            return await this.fallbackScreenshotMethod(nodeId);
        } catch (error) {
            console.error("Failed to capture screenshot:", error);
            return ''; // Return empty string on error
        }
    }
    
    // Fallback method when direct screenshot capture isn't available
    private async fallbackScreenshotMethod(nodeId: string): Promise<string> {
        try {
            // Get the element's dimensions and position to help create a visual representation
            const rect = await framer.getRect(nodeId);
            
            // Create a canvas and draw a representation based on the element's properties
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
                // Draw a colored rectangle
                const colors = ['#FF5733', '#33FF57', '#3357FF', '#F3FF33'];
                const colorIndex = Math.floor(Math.random() * colors.length);
                ctx.fillStyle = colors[colorIndex];
                ctx.fillRect(0, 0, 200, 100);
                
                // Add text with element info
                ctx.fillStyle = '#000000';
                ctx.font = '14px sans-serif';
                ctx.fillText(`Element ID: ${nodeId.substring(0, 8)}...`, 10, 30);
                
                if (rect) {
                    ctx.fillText(`Size: ${Math.round(rect.width)}×${Math.round(rect.height)}`, 10, 50);
                    ctx.fillText(`Position: (${Math.round(rect.x)}, ${Math.round(rect.y)})`, 10, 70);
                }
            }
            
            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error("Error creating fallback screenshot:", error);
            
            // Return a very simple colored rectangle if all else fails
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#dddddd';
                ctx.fillRect(0, 0, 200, 100);
                ctx.fillStyle = '#555555';
                ctx.font = '12px sans-serif';
                ctx.fillText('Element preview not available', 10, 50);
            }
            return canvas.toDataURL('image/png');
        }
    }
    
    // ============================================================================
    // SAMPLE DATA FOR TESTING - COMMENTED OUT FOR PRODUCTION
    // ============================================================================
    // Uncomment this method and the call in createNodesFromFramerSelection() above
    // to enable sample data for testing purposes
    // ============================================================================
    
    // private getSampleNodes(): FramerNode[] {
    //     return [
    //         {
    //             id: "title",
    //             name: "title",
    //             text: "Welcome to our website",
    //             type: "text",
    //             style: {
    //                 fontSize: 32
    //             }
    //         },
    //         {
    //             id: "meta-description",
    //             name: "meta-description",
    //             metadata: {
    //                 name: "description",
    //                 content: "This is a sample meta description for demonstration purposes."
    //             }
    //         },
    //         {
    //             id: "hero-image",
    //             name: "hero-image",
    //             type: "image",
    //             alt: "Hero image"
    //         },
    //         {
    //             id: "heading1",
    //             name: "h1",
    //             text: "Main Heading",
    //             type: "text",
    //             style: {
    //                 fontSize: 24
    //             }
    //         },
    //         {
    //             id: "paragraph1",
    //             name: "paragraph",
    //             text: "This is a sample paragraph with some content for the SEO analyzer to evaluate.",
    //             type: "text"
    //         }
    //     ];
    // }
} 