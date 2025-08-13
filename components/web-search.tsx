'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, ExternalLink, Globe, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SearchResult {
  title: string;
  url: string;
  source: string;
}

interface SearchResponse {
  query: string;
  source: string;
  results: SearchResult[];
}

export function WebSearch() {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('wiby');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search/web`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query.trim(),
          source: source
        })
      });

      if (response.ok) {
        const data: SearchResponse = await response.json();
        setResults(data.results);
        
        if (data.results.length === 0) {
          toast.info('No results found. Try a different query or search engine.');
        } else {
          toast.success(`Found ${data.results.length} results`);
        }
      } else {
        const error = await response.json();
        
        if (response.status === 403) {
          toast.error('Web search is disabled by administrator');
        } else {
          toast.error(error.error || 'Search failed');
        }
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search request failed. Please try again.');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  const openLink = (url: string) => {
    // Ensure the URL is properly formatted
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      fullUrl = 'https://' + url;
    }
    
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  const getSourceInfo = (sourceKey: string) => {
    switch (sourceKey) {
      case 'wiby':
        return {
          name: 'Wiby.me',
          description: 'Search the old-school web',
          color: 'bg-purple-500'
        };
      case 'duckduckgo':
        return {
          name: 'DuckDuckGo',
          description: 'Privacy-focused search',
          color: 'bg-orange-500'
        };
      default:
        return {
          name: 'Unknown',
          description: 'Unknown source',
          color: 'bg-gray-500'
        };
    }
  };

  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Globe className="h-8 w-8 text-[#FF00FF]" />
          <h1 className="text-3xl font-bold font-space-mono text-white">
            Web Search Terminal
          </h1>
        </div>

        <Card className="bg-black/40 border-[#722F37]/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Search the Web</span>
            </CardTitle>
            <CardDescription className="text-gray-300">
              Search across multiple sources while maintaining privacy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your search query..."
                  className="bg-black/50 border-[#722F37] text-white placeholder:text-gray-400 focus:border-[#003B6F]"
                  disabled={isSearching}
                />
              </div>
              <Select value={source} onValueChange={setSource} disabled={isSearching}>
                <SelectTrigger className="w-48 bg-black/50 border-[#722F37] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-[#722F37]">
                  <SelectItem value="wiby" className="text-white">
                    Wiby.me - Classic Web
                  </SelectItem>
                  <SelectItem value="duckduckgo" className="text-white">
                    DuckDuckGo - Privacy
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={performSearch}
                disabled={isSearching || !query.trim()}
                className="bg-[#003B6F] hover:bg-[#004080] text-white px-6"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>

            {/* Search Source Info */}
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <AlertCircle className="h-4 w-4" />
              <span>
                Searching with {getSourceInfo(source).name} - {getSourceInfo(source).description}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {hasSearched && (
          <Card className="bg-black/40 border-[#722F37]/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Search Results</span>
                {results.length > 0 && (
                  <Badge variant="outline" className="text-gray-300">
                    {results.length} results
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isSearching ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF00FF] mx-auto mb-4" />
                  <p className="text-gray-400">Searching the web...</p>
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  {hasSearched ? (
                    <div className="space-y-2">
                      <Search className="h-12 w-12 mx-auto text-gray-600" />
                      <p>No results found</p>
                      <p className="text-sm">Try a different search term or search engine</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Globe className="h-12 w-12 mx-auto text-gray-600" />
                      <p>Ready to search</p>
                      <p className="text-sm">Enter a query above to get started</p>
                    </div>
                  )}
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {results.map((result, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border border-[#722F37]/30 hover:border-[#003B6F]/50 transition-colors cursor-pointer group"
                        onClick={() => openLink(result.url)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium group-hover:text-[#FF00FF] transition-colors line-clamp-2">
                              {result.title}
                            </h3>
                            <p className="text-[#003B6F] text-sm mt-1 truncate">
                              {result.url}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getSourceInfo(result.source).color} text-white border-current`}
                              >
                                {getSourceInfo(result.source).name}
                              </Badge>
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-[#003B6F] transition-colors ml-4 flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        )}

        {/* Search Tips */}
        <Card className="bg-black/40 border-[#722F37]/30">
          <CardHeader>
            <CardTitle className="text-white text-lg">Search Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-white font-medium mb-2">Wiby.me</h4>
                <ul className="space-y-1">
                  <li>• Searches classic, old-school websites</li>
                  <li>• Great for finding unique, personal sites</li>
                  <li>• Focuses on text-based content</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-medium mb-2">DuckDuckGo</h4>
                <ul className="space-y-1">
                  <li>• Privacy-focused search</li>
                  <li>• No tracking or data collection</li>
                  <li>• Comprehensive web coverage</li>
                </ul>
              </div>
            </div>
            <div className="pt-2 border-t border-[#722F37]/30">
              <p className="text-gray-400 text-xs">
                <AlertCircle className="h-3 w-3 inline mr-1" />
                Some domains may be blocked by administrator settings
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}