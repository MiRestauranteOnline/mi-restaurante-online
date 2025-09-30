import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getAllArticles } from '@/data/articles';
import { Loader2, Play, Eye, AlertCircle, CheckCircle } from 'lucide-react';

interface GenerationLog {
  id: string;
  type: string;
  status: string;
  article_id?: string;
  content_gap_id?: string;
  details?: any;
  error_message?: string;
  processing_time_ms?: number;
  created_at: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  created_at: string;
  publish_date?: string;
}

interface ContentGap {
  id: string;
  topic: string;
  category: string;
  priority_score: number;
  status: string;
  created_at: string;
}

const BlogGenerationAdmin: React.FC = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [isRegeneratingImages, setIsRegeneratingImages] = useState(false);
  const [logs, setLogs] = useState<GenerationLog[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [contentGaps, setContentGaps] = useState<ContentGap[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [logsResponse, articlesResponse, gapsResponse] = await Promise.all([
        supabase
          .from('generation_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('generated_articles')
          .select('id, title, slug, category, status, created_at, publish_date')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('content_gaps')
          .select('*')
          .order('priority_score', { ascending: false })
          .limit(10)
      ]);

      if (logsResponse.data) setLogs(logsResponse.data);
      if (articlesResponse.data) setArticles(articlesResponse.data);
      if (gapsResponse.data) setContentGaps(gapsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateDaily = async () => {
    if (isAnalyzing || isGenerating || isSeeding || isCleaningUp) {
      toast({
        title: "Operation in progress",
        description: "Please wait for the current operation to complete",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('daily-blog-generator');
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;
      
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
        await fetchData(); // Refresh data
      } else {
        throw new Error(result.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Error generating daily blog:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to generate daily blog',
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyzeGaps = async () => {
    if (isAnalyzing || isGenerating || isSeeding || isCleaningUp) {
      toast({
        title: "Operation in progress",
        description: "Please wait for the current operation to complete",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await supabase.functions.invoke('analyze-content-gaps');
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;
      
      if (result.success) {
        toast({
          title: "Content Gaps Analyzed",
          description: `Found ${result.gaps.length} new content opportunities`,
        });
        await fetchData();
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing gaps:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to analyze content gaps',
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSeedKeywords = async () => {
    if (isAnalyzing || isGenerating || isSeeding || isCleaningUp) {
      toast({
        title: "Operation in progress",
        description: "Please wait for the current operation to complete",
        variant: "destructive",
      });
      return;
    }

    setIsSeeding(true);
    try {
      const response = await supabase.functions.invoke('seed-keywords');
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;
      
      if (result.success) {
        toast({
          title: "Keywords Seeded",
          description: `Added ${result.total_keywords} target keywords for restaurant industry`,
        });
        await fetchData();
      } else {
        throw new Error(result.error || 'Seeding failed');
      }
    } catch (error) {
      console.error('Error seeding keywords:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to seed keywords',
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCleanupStuck = async () => {
    if (isAnalyzing || isGenerating || isSeeding || isCleaningUp) {
      toast({
        title: "Operation in progress",
        description: "Please wait for the current operation to complete",
        variant: "destructive",
      });
      return;
    }

    setIsCleaningUp(true);
    try {
      const response = await supabase.functions.invoke('fix-stuck-generations');
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;
      
      if (result.success) {
        toast({
          title: "Cleanup Completed",
          description: `Fixed ${result.stuck_generations_cleaned + result.stuck_gaps_reset} stuck operations and published ${result.articles_published} articles`,
        });
        await fetchData();
      } else {
        throw new Error(result.error || 'Cleanup failed');
      }
    } catch (error) {
      console.error('Error in cleanup:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to cleanup stuck operations',
        variant: "destructive",
      });
    } finally {
      setIsCleaningUp(false);
    }
  };

  const handleRegenerateImages = async () => {
    if (!confirm('This will regenerate ALL article images with improved quality using Lovable AI. This may take several minutes. Continue?')) {
      return;
    }

    setIsRegeneratingImages(true);
    try {
      toast({
        title: "Starting Image Regeneration",
        description: "This may take a while. You can continue working...",
      });
      
      const response = await supabase.functions.invoke('regenerate-article-images', {
        body: { regenerateAll: true }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;
      
      if (result.success) {
        toast({
          title: "Image Regeneration Complete",
          description: `Successfully regenerated ${result.successCount} images! ${result.failureCount > 0 ? `${result.failureCount} failed.` : ''}`,
        });
        await fetchData();
      } else {
        throw new Error(result.error || 'Image regeneration failed');
      }
    } catch (error) {
      console.error('Error regenerating images:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to regenerate images',
        variant: "destructive",
      });
    } finally {
      setIsRegeneratingImages(false);
    }
  };

  const handleTestArticles = async () => {
    try {
      console.log('Testing article fetch...');
      const allArticles = await getAllArticles();
      console.log('Articles found:', allArticles.length);
      console.log('Article titles:', allArticles.map(a => a.title));
      
      toast({
        title: "Articles Test",
        description: `Found ${allArticles.length} articles. Check console for details.`,
      });
    } catch (error) {
      console.error('Error testing articles:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to test articles',
        variant: "destructive",
      });
    }
  };

  const handleTestBlogFetch = async () => {
    try {
      console.log('Testing direct Supabase fetch for blog...');
      
      const { data, error } = await supabase
        .from('generated_articles')
        .select('*')
        .eq('status', 'published')
        .order('publish_date', { ascending: false });

      console.log('Direct fetch result:', { data, error });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: "Blog Fetch Test",
        description: `Found ${data?.length || 0} published articles. Check console for details.`,
      });
    } catch (error) {
      console.error('Error testing blog fetch:', error);
      toast({
        title: "Error", 
        description: error instanceof Error ? error.message : 'Failed to test blog fetch',
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'started':
        return <Badge variant="secondary"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Started</Badge>;
      case 'published':
        return <Badge className="bg-blue-100 text-blue-800">Published</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'identified':
        return <Badge variant="secondary">Identified</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading blog generation admin...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Generation Admin</h1>
          <p className="text-muted-foreground">Manage automated blog content generation</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button 
          onClick={handleGenerateDaily}
          disabled={isGenerating || isAnalyzing || isSeeding || isCleaningUp}
          className="flex items-center gap-2"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          Generate Daily Article
        </Button>
        <Button 
          variant="outline"
          onClick={handleAnalyzeGaps}
          disabled={isGenerating || isAnalyzing || isSeeding || isCleaningUp}
        >
          {isAnalyzing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Eye className="w-4 h-4 mr-2" />
          )}
          Analyze Content Gaps
        </Button>
        <Button 
          variant="outline"
          onClick={handleSeedKeywords}
          disabled={isGenerating || isAnalyzing || isSeeding}
        >
          {isSeeding ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Eye className="w-4 h-4 mr-2" />
          )}
          Seed Keywords
        </Button>
        <Button 
          variant="outline"
          onClick={handleCleanupStuck}
          disabled={isGenerating || isAnalyzing || isSeeding || isCleaningUp}
        >
          {isCleaningUp ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <AlertCircle className="w-4 h-4 mr-2" />
          )}
          Fix Stuck Operations
        </Button>
        <Button 
          variant="outline"
          onClick={handleTestArticles}
        >
          🔍 Test Article Fetch
        </Button>
        <Button 
          variant="outline"
          onClick={handleTestBlogFetch}
        >
          🔍 Test Blog Fetch
        </Button>
        <Button 
          onClick={handleRegenerateImages}
          disabled={isRegeneratingImages}
          variant="secondary"
          className="flex items-center gap-2"
        >
          {isRegeneratingImages ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          Regenerate All Images
        </Button>
      </div>

      {/* Content Gaps */}
      <Card>
        <CardHeader>
          <CardTitle>Content Gaps</CardTitle>
          <CardDescription>Topics identified for article creation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {contentGaps.length === 0 ? (
              <p className="text-muted-foreground">No content gaps identified yet. Run gap analysis first.</p>
            ) : (
              contentGaps.map((gap) => (
                <div key={gap.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{gap.topic}</h4>
                    <p className="text-sm text-muted-foreground">
                      Category: {gap.category} • Priority: {gap.priority_score}/10
                    </p>
                  </div>
                  {getStatusBadge(gap.status)}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generated Articles */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Articles</CardTitle>
          <CardDescription>Recently generated blog articles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {articles.length === 0 ? (
              <p className="text-muted-foreground">No articles generated yet.</p>
            ) : (
              articles.map((article) => (
                <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{article.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Category: {article.category} • Created: {new Date(article.created_at).toLocaleDateString()}
                      {article.publish_date && ` • Published: ${new Date(article.publish_date).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(article.status)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/guia/${article.category}/${article.slug}`, '_blank')}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generation Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Generation Logs</CardTitle>
          <CardDescription>Recent system activity and logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {logs.length === 0 ? (
              <p className="text-muted-foreground">No logs available.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{log.type.replace('_', ' ')}</span>
                      {getStatusBadge(log.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                      {log.processing_time_ms && ` • ${log.processing_time_ms}ms`}
                    </p>
                    {log.error_message && (
                      <p className="text-sm text-red-600 mt-1">{log.error_message}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogGenerationAdmin;