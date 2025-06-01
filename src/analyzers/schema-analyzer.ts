import { Analyzer } from "./analyzer.interface";
import { FramerNode, SEOIssue, SEOCategory } from "../types/seo-types";

export class SchemaAnalyzer implements Analyzer {
    category: SEOCategory = "schema";

    analyze(nodes: FramerNode[]): SEOIssue[] {
        const issues: SEOIssue[] = [];
        
        // Check for presence of schema markup
        this.checkSchemaMarkupPresence(nodes, issues);
        
        // Check for common schemas based on content type
        this.checkCommonSchemas(nodes, issues);
        
        // Check for local business schema if applicable
        this.checkLocalBusinessSchema(nodes, issues);
        
        // Check for organization schema
        this.checkOrganizationSchema(nodes, issues);
        
        // Check for breadcrumb schema
        this.checkBreadcrumbSchema(nodes, issues);
        
        return issues;
    }
    
    private checkSchemaMarkupPresence(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Look for schema.org indicators
        const schemaIndicators = [
            "schema.org",
            "itemscope",
            "itemtype",
            "itemprop",
            "application/ld+json",
            "@context",
            "@type"
        ];
        
        let hasSchemaMarkup = false;
        
        for (const node of nodes) {
            const nodeText = node.text || "";
            const nodeName = node.name || "";
            
            if (schemaIndicators.some(indicator => 
                nodeText.includes(indicator) || nodeName.includes(indicator))) {
                hasSchemaMarkup = true;
                break;
            }
        }
        
        if (!hasSchemaMarkup) {
            issues.push({
                type: "warning",
                message: "No schema markup detected",
                category: this.category,
                recommendation: "Implement structured data using schema.org vocabulary to enhance search results with rich snippets",
                priority: "important",
                externalResourceLink: "https://developers.google.com/search/docs/advanced/structured-data/intro-structured-data",
                externalResourceTitle: "Google: Introduction to structured data"
            });
        }
    }
    
    private checkCommonSchemas(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Detect page type
        const isArticle = nodes.some(node => 
            node.name.toLowerCase().includes("article") || 
            node.name.toLowerCase().includes("blog") || 
            node.name.toLowerCase().includes("post"));
            
        const isProduct = nodes.some(node => 
            node.name.toLowerCase().includes("product") || 
            node.name.toLowerCase().includes("item") || 
            node.name.toLowerCase().includes("price") || 
            node.name.toLowerCase().includes("buy"));
            
        const isEvent = nodes.some(node => 
            node.name.toLowerCase().includes("event") || 
            node.name.toLowerCase().includes("schedule") || 
            node.name.toLowerCase().includes("calendar"));
            
        const isRecipe = nodes.some(node => 
            node.name.toLowerCase().includes("recipe") || 
            node.name.toLowerCase().includes("ingredients") || 
            node.name.toLowerCase().includes("cooking"));
            
        // Look for schema type indicators
        const hasArticleSchema = nodes.some(node => 
            node.text?.includes("Article") || 
            node.text?.includes("BlogPosting") || 
            node.name.toLowerCase().includes("article schema"));
            
        const hasProductSchema = nodes.some(node => 
            node.text?.includes("Product") || 
            node.name.toLowerCase().includes("product schema"));
            
        const hasEventSchema = nodes.some(node => 
            node.text?.includes("Event") || 
            node.name.toLowerCase().includes("event schema"));
            
        const hasRecipeSchema = nodes.some(node => 
            node.text?.includes("Recipe") || 
            node.name.toLowerCase().includes("recipe schema"));
            
        // Suggest appropriate schemas based on content
        if (isArticle && !hasArticleSchema) {
            issues.push({
                type: "warning",
                message: "Article content without Article schema",
                category: this.category,
                recommendation: "Implement Article or BlogPosting schema for article content to enhance visibility in search results",
                priority: "important",
                externalResourceLink: "https://developers.google.com/search/docs/advanced/structured-data/article",
                externalResourceTitle: "Google: Article structured data"
            });
        }
        
        if (isProduct && !hasProductSchema) {
            issues.push({
                type: "warning",
                message: "Product content without Product schema",
                category: this.category,
                recommendation: "Implement Product schema for product pages to enable rich product results in search",
                priority: "important",
                externalResourceLink: "https://developers.google.com/search/docs/advanced/structured-data/product",
                externalResourceTitle: "Google: Product structured data"
            });
        }
        
        if (isEvent && !hasEventSchema) {
            issues.push({
                type: "info",
                message: "Event content without Event schema",
                category: this.category,
                recommendation: "Implement Event schema for event information to display event details in search results",
                priority: "nice-to-have",
                externalResourceLink: "https://developers.google.com/search/docs/advanced/structured-data/event",
                externalResourceTitle: "Google: Event structured data"
            });
        }
        
        if (isRecipe && !hasRecipeSchema) {
            issues.push({
                type: "info",
                message: "Recipe content without Recipe schema",
                category: this.category,
                recommendation: "Implement Recipe schema for recipe content to display rich recipe information in search results",
                priority: "nice-to-have",
                externalResourceLink: "https://developers.google.com/search/docs/advanced/structured-data/recipe",
                externalResourceTitle: "Google: Recipe structured data"
            });
        }
    }
    
    private checkLocalBusinessSchema(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Detect if the page has local business information
        const hasAddress = nodes.some(node => 
            node.name.toLowerCase().includes("address") || 
            node.text?.match(/\d+\s+[A-Za-z\s]+,\s+[A-Za-z\s]+,\s+[A-Z]{2}\s+\d{5}/));
            
        const hasPhone = nodes.some(node => 
            node.name.toLowerCase().includes("phone") || 
            node.text?.match(/\(\d{3}\)\s*\d{3}-\d{4}/) || 
            node.text?.match(/\d{3}-\d{3}-\d{4}/));
            
        const hasBusinessHours = nodes.some(node => 
            node.name.toLowerCase().includes("hours") || 
            node.name.toLowerCase().includes("opening") || 
            node.text?.match(/mon|tue|wed|thu|fri|sat|sun.*?\d{1,2}:\d{2}/i));
            
        const isLocalBusiness = hasAddress || hasPhone || hasBusinessHours;
        
        // Look for LocalBusiness schema
        const hasLocalBusinessSchema = nodes.some(node => 
            node.text?.includes("LocalBusiness") || 
            node.name.toLowerCase().includes("localbusiness schema"));
            
        if (isLocalBusiness && !hasLocalBusinessSchema) {
            issues.push({
                type: "warning",
                message: "Local business information without LocalBusiness schema",
                category: this.category,
                recommendation: "Implement LocalBusiness schema to improve local search visibility and enable rich features like business hours",
                priority: "important",
                externalResourceLink: "https://developers.google.com/search/docs/advanced/structured-data/local-business",
                externalResourceTitle: "Google: Local business structured data"
            });
        }
    }
    
    private checkOrganizationSchema(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Detect organization indicators
        const hasLogo = nodes.some(node => 
            node.name.toLowerCase().includes("logo") || 
            node.alt?.toLowerCase().includes("logo"));
            
        const hasCompanyName = nodes.some(node => 
            node.name.toLowerCase().includes("company name") || 
            node.name.toLowerCase().includes("organization name") || 
            node.name.toLowerCase().includes("brand name"));
            
        const hasSocialProfiles = nodes.some(node => 
            node.name.toLowerCase().includes("social") || 
            node.href?.includes("facebook.com") || 
            node.href?.includes("twitter.com") || 
            node.href?.includes("linkedin.com") || 
            node.href?.includes("instagram.com"));
            
        const isOrganization = hasLogo || hasCompanyName || hasSocialProfiles;
        
        // Look for Organization schema
        const hasOrganizationSchema = nodes.some(node => 
            node.text?.includes("Organization") || 
            node.text?.includes("Corporation") || 
            node.name.toLowerCase().includes("organization schema"));
            
        if (isOrganization && !hasOrganizationSchema) {
            issues.push({
                type: "info",
                message: "Organization information without Organization schema",
                category: this.category,
                recommendation: "Implement Organization schema to establish your brand identity for search engines",
                priority: "nice-to-have",
                externalResourceLink: "https://schema.org/Organization",
                externalResourceTitle: "Schema.org: Organization"
            });
        }
    }
    
    private checkBreadcrumbSchema(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Detect breadcrumb navigation
        const hasBreadcrumbUI = nodes.some(node => 
            node.name.toLowerCase().includes("breadcrumb") || 
            node.name.toLowerCase().includes("navigation") || 
            (node.name.toLowerCase().includes("ul") && node.name.toLowerCase().includes("nav")));
            
        // Look for BreadcrumbList schema
        const hasBreadcrumbSchema = nodes.some(node => 
            node.text?.includes("BreadcrumbList") || 
            node.name.toLowerCase().includes("breadcrumb schema"));
            
        if (hasBreadcrumbUI && !hasBreadcrumbSchema) {
            issues.push({
                type: "info",
                message: "Breadcrumb navigation without BreadcrumbList schema",
                category: this.category,
                recommendation: "Implement BreadcrumbList schema to enhance breadcrumb display in search results",
                priority: "nice-to-have",
                externalResourceLink: "https://developers.google.com/search/docs/advanced/structured-data/breadcrumb",
                externalResourceTitle: "Google: Breadcrumb structured data"
            });
        }
    }
} 