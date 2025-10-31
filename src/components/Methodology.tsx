// components/Methodology.tsx

const Methodology = () => {
    const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="px-4 py-8">
      <div className="space-y-6">
        
        {/* Quick Navigation */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 mb-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-3">📑 Quick Navigation</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button 
              onClick={() => scrollToSection('overview')}
              className="text-left text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800/50 rounded p-2 transition-colors"
            >
              📋 Overview
            </button>
            <button 
              onClick={() => scrollToSection('challenge')}
              className="text-left text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800/50 rounded p-2 transition-colors"
            >
              🎯 Challenge
            </button>
            <button 
              onClick={() => scrollToSection('architecture')}
              className="text-left text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800/50 rounded p-2 transition-colors"
            >
              🏗️ Architecture
            </button>
            <button 
              onClick={() => scrollToSection('specs')}
              className="text-left text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800/50 rounded p-2 transition-colors"
            >
              ⚙️ Specifications
            </button>
            <button 
              onClick={() => scrollToSection('visualizations')}
              className="text-left text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800/50 rounded p-2 transition-colors"
            >
              📊 Visualizations
            </button>
            <button 
              onClick={() => scrollToSection('limitations')}
              className="text-left text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800/50 rounded p-2 transition-colors"
            >
              ⚠️ Limitations
            </button>
            <button 
              onClick={() => scrollToSection('takeaways')}
              className="text-left text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800/50 rounded p-2 transition-colors"
            >
              💡 Takeaways
            </button>
            <button 
              onClick={() => scrollToSection('stack')}
              className="text-left text-sm text-gray-300 hover:text-blue-400 hover:bg-gray-800/50 rounded p-2 transition-colors"
            >
              🛠️ Tech Stack
            </button>
          </div>
        </div>

        {/* Project Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-blue-500/30 hover:border-blue-500 transition-colors">
            <p className="text-gray-400 text-xs mb-1">Data Sources</p>
            <p className="text-white text-2xl font-bold">1</p>
            <p className="text-blue-300 text-xs">Spotify Web API</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/30 hover:border-purple-500 transition-colors">
            <p className="text-gray-400 text-xs mb-1">Components</p>
            <p className="text-white text-2xl font-bold">20+</p>
            <p className="text-purple-300 text-xs">React Visualizations</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 border border-green-500/30 hover:border-green-500 transition-colors">
            <p className="text-gray-400 text-xs mb-1">Architecture Layers</p>
            <p className="text-white text-2xl font-bold">4</p>
            <p className="text-green-300 text-xs">API → ETL → Storage → UI</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/30 hover:border-cyan-500 transition-colors">
            <p className="text-gray-400 text-xs mb-1">Tech Stack</p>
            <p className="text-white text-2xl font-bold">8+</p>
            <p className="text-cyan-300 text-xs">Languages & Tools</p>
          </div>
        </div>
        
        {/* Section 1: Project Overview */}
        <div id="overview" className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-blue-500/50 transition-colors scroll-mt-6">
          <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
            <span className="text-3xl">📋</span> How Listener Analytics Works
          </h2>
          
          <div className="space-y-4 text-gray-300">
            <p className="text-lg leading-relaxed">
              Listener Analytics is a personal music analytics dashboard I built to answer a simple question:{' '}
              <span className="text-blue-400 font-semibold">what does my music taste actually look like in data?</span>
            </p>
            <p className="leading-relaxed">
              What started as curiosity about my listening habits evolved into a comprehensive music analytics 
              platform that demonstrates how I approach BA work—understanding the{' '}
              <span className="text-blue-400 font-semibold">'why'</span> behind data requirements before 
              building the{' '}
              <span className="text-blue-400 font-semibold">'what'</span>.
            </p>
          </div>
        </div>

        {/* Section 2: The Challenge */}
        <div id="challenge" className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-blue-500/50 transition-colors scroll-mt-6">
          <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
            <span className="text-3xl">🎯</span> The Challenge
          </h2>
          
          <div className="space-y-4 text-gray-300">
            <p className="leading-relaxed">
              As someone who listens to music daily across multiple devices (desktop, mobile, smart speakers), 
              I realized I had no idea about my actual listening patterns. Spotify Wrapped comes once a year, 
              but I wanted continuous insights.
            </p>
            
            <div>
              <h3 className="text-xl font-semibold mb-3 text-blue-400">Questions I needed answered:</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Which artists do I actually listen to most, not just remember most?</li>
                <li>When do I listen to music throughout the day and week?</li>
                <li>How diverse is my music taste really?</li>
                <li>Which featured artists appear most often in my listening?</li>
                <li>Are there patterns in my listening behavior I'm not aware of?</li>
                <li>How much time do I actually spend listening to music?</li>
              </ul>
            </div>

            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mt-4">
              <h3 className="text-lg font-semibold mb-2 text-red-400">The Core Problem:</h3>
              <p className="leading-relaxed">
                There was no solution that continuously tracked my listening history AND transformed it into 
                actionable insights about my music taste. Spotify's API provides the data, but no one builds 
                dashboards that tell the story.
              </p>
            </div>
          </div>
        </div>

        {/* Quote Section */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-l-4 border-blue-500 rounded-lg p-6">
          <blockquote className="italic text-gray-300 text-lg">
            "At the end of the day, dashboards are just expensive reporting if they don't help people make 
            better decisions. I needed a tool that would tell me the story behind my listening patterns—not 
            just show me numbers."
          </blockquote>
        </div>

        {/* Data Flow Diagram */}
        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-center text-lg font-semibold text-gray-300 mb-6">🔄 Data Flow Architecture</h3>
          <div className="flex items-center justify-center gap-3 md:gap-6 flex-wrap">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-900/30 border-2 border-green-500 rounded-lg flex items-center justify-center mb-2 hover:scale-110 transition-transform">
                <span className="text-3xl">🎵</span>
              </div>
              <p className="text-xs text-gray-300 font-semibold">Spotify API</p>
              <p className="text-[10px] text-gray-500">Recently Played</p>
            </div>
            
            <span className="text-2xl text-blue-400">→</span>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-900/30 border-2 border-purple-500 rounded-lg flex items-center justify-center mb-2 hover:scale-110 transition-transform">
                <span className="text-3xl">🐍</span>
              </div>
              <p className="text-xs text-gray-300 font-semibold">Python ETL</p>
              <p className="text-[10px] text-gray-500">Transform</p>
            </div>
            
            <span className="text-2xl text-blue-400">→</span>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-900/30 border-2 border-blue-500 rounded-lg flex items-center justify-center mb-2 hover:scale-110 transition-transform">
                <span className="text-3xl">☁️</span>
              </div>
              <p className="text-xs text-gray-300 font-semibold">R2 Storage</p>
              <p className="text-[10px] text-gray-500">CSV Files</p>
            </div>
            
            <span className="text-2xl text-blue-400">→</span>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-pink-900/30 border-2 border-pink-500 rounded-lg flex items-center justify-center mb-2 hover:scale-110 transition-transform">
                <span className="text-3xl">⚛️</span>
              </div>
              <p className="text-xs text-gray-300 font-semibold">React UI</p>
              <p className="text-[10px] text-gray-500">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Section 3: Technical Architecture */}
        <div id="architecture" className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-blue-500/50 transition-colors scroll-mt-6">
          <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
            <span className="text-3xl">🏗️</span> Technical Architecture
          </h2>
          
          <div className="space-y-4 text-gray-300">
            <p className="leading-relaxed">
              My solution required building an end-to-end data pipeline—not just a dashboard, but a complete 
              ETL system with API integration, cloud infrastructure, and automated collection.
            </p>

            {/* Layer 1: Spotify API */}
            <div className="bg-gray-900/50 rounded-lg p-5 border-l-4 border-green-500">
              <h3 className="text-xl font-bold mb-3 text-green-400 flex items-center gap-2">
                <span>📊</span> Layer 1: Spotify Web API Integration
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-cyan-400 mb-1">Decision: Spotify Web API Integration</p>
                </div>
                
                <div>
                  <p className="font-semibold text-blue-400 mb-1">Why:</p>
                  <p className="text-sm">
                    Needed automated access to recently played tracks with complete metadata (artists, albums, 
                    durations, timestamps). Spotify's API provides millisecond-precision timestamps and rich 
                    track metadata including featured artists.
                  </p>
                </div>
                
                <div>
                  <p className="font-semibold text-blue-400 mb-1 italic">Business Reasoning:</p>
                  <p className="text-sm italic">
                    Manual tracking is impossible for music listening. API integration ensures 100% data 
                    completeness while eliminating user friction. OAuth authentication keeps data secure and 
                    follows industry best practices.
                  </p>
                </div>
              </div>
            </div>

            {/* Layer 2: Python ETL Pipeline */}
            <div className="bg-gray-900/50 rounded-lg p-5 border-l-4 border-purple-500">
              <h3 className="text-xl font-bold mb-3 text-purple-400 flex items-center gap-2">
                <span>🔄</span> Layer 2: ETL Pipeline (Python Script)
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-cyan-400 mb-1">Data Transformation Pipeline</p>
                </div>
                
                <p className="text-sm">
                  Custom Python script handles the complete ETL process—extracting recent plays from Spotify API, 
                  transforming them into analytics-ready format, deduplicating events, and loading to cloud storage.
                </p>
                
                <div className="bg-gray-950/50 rounded p-3">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400">→</span>
                      <div>
                        <span className="font-semibold">Extract:</span> Pulls data from Spotify API
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400">→</span>
                      <div>
                        <span className="font-semibold">Transform:</span> Separates featured artists, deduplicates timestamps
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400">→</span>
                      <div>
                        <span className="font-semibold">Enrich:</span> Calculates listening metrics and patterns
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400">→</span>
                      <div>
                        <span className="font-semibold">Load:</span> Exports to CSV and uploads to Cloudflare R2
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-cyan-400 mb-1">Environment & Security</p>
                  <p className="text-sm">
                    Uses environment variables and secrets management for API keys and R2 credentials—no hardcoded credentials in code.
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-blue-400 mb-1 italic">Business Reasoning:</p>
                  <p className="text-sm italic">
                    Separating data processing from visualization allows independent scaling and easier debugging. 
                    Pipeline can run on schedule without frontend dependency. Deduplication ensures accurate 
                    metrics even with overlapping API calls.
                  </p>
                </div>
              </div>
            </div>

            {/* Layer 3: R2 Storage */}
            <div className="bg-gray-900/50 rounded-lg p-5 border-l-4 border-blue-500">
              <h3 className="text-xl font-bold mb-3 text-blue-400 flex items-center gap-2">
                <span>☁️</span> Layer 3: Cloud Storage (Cloudflare R2)
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-cyan-400 mb-1">Decision: Cloudflare R2 Object Storage</p>
                </div>
                
                <div>
                  <p className="font-semibold text-blue-400 mb-1">Why:</p>
                  <p className="text-sm">
                    S3-compatible storage without egress fees. Stores processed CSV files that frontend consumes. 
                    Public read access enables direct dashboard consumption without backend server.
                  </p>
                </div>
                
                <div>
                  <p className="font-semibold text-blue-400 mb-1 italic">Business Reasoning:</p>
                  <p className="text-sm italic">
                    Decouples data storage from application hosting. Frontend can be static (fast, cheap) while 
                    data remains centralized and versioned. Single source of truth for listening history across 
                    multiple dashboard instances.
                  </p>
                </div>
              </div>
            </div>

            {/* Layer 4: Frontend */}
            <div className="bg-gray-900/50 rounded-lg p-5 border-l-4 border-pink-500">
              <h3 className="text-xl font-bold mb-3 text-pink-400 flex items-center gap-2">
                <span>🎨</span> Layer 4: Frontend (React + TypeScript)
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-cyan-400 mb-1">Frontend Architecture</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-gray-950/50 rounded p-3">
                    <h4 className="font-semibold mb-1 text-purple-400 text-sm">React + TypeScript</h4>
                    <p className="text-xs mb-1"><strong>Why:</strong> Type safety, component reusability</p>
                    <p className="text-xs text-gray-400">Add visualizations without breaking existing ones</p>
                  </div>

                  <div className="bg-gray-950/50 rounded p-3">
                    <h4 className="font-semibold mb-1 text-purple-400 text-sm">Recharts Library</h4>
                    <p className="text-xs mb-1"><strong>Why:</strong> Declarative, composable charts</p>
                    <p className="text-xs text-gray-400">Faster iteration on user feedback</p>
                  </div>

                  <div className="bg-gray-950/50 rounded p-3">
                    <h4 className="font-semibold mb-1 text-purple-400 text-sm">TailwindCSS</h4>
                    <p className="text-xs mb-1"><strong>Why:</strong> Rapid, consistent UI</p>
                    <p className="text-xs text-gray-400">Professional appearance without CSS overhead</p>
                  </div>

                  <div className="bg-gray-950/50 rounded p-3">
                    <h4 className="font-semibold mb-1 text-purple-400 text-sm">Modular Components</h4>
                    <p className="text-xs mb-1"><strong>Why:</strong> Each viz is independent</p>
                    <p className="text-xs text-gray-400">Easy to test, maintain, extend</p>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-blue-400 mb-1 italic">Business Reasoning:</p>
                  <p className="text-sm italic">
                    Frontend fetches processed CSV data from R2, performs client-side calculations for interactivity, 
                    and renders visualization components organized by analytical theme. Static hosting keeps costs low while maintaining performance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Specifications */}
        <div id="specs" className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-blue-500/50 transition-colors scroll-mt-6">
          <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
            <span className="text-3xl">⚙️</span> System Specifications
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-4 border-l-4 border-green-500">
              <h3 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                <span>🔄</span> Update Frequency
              </h3>
              <p className="text-sm text-gray-300 mb-1">ETL runs every 30 minutes</p>
              <p className="text-xs text-gray-400">Ensures near real-time data with API rate limit respect</p>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-4 border-l-4 border-purple-500">
              <h3 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
                <span>📦</span> Data Retention
              </h3>
              <p className="text-sm text-gray-300 mb-1">Full history since Oct 2024</p>
              <p className="text-xs text-gray-400">~50,000+ listening events tracked</p>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-4 border-l-4 border-blue-500">
              <h3 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                <span>⚡</span> Processing Time
              </h3>
              <p className="text-sm text-gray-300 mb-1">&lt; 2 seconds per run</p>
              <p className="text-xs text-gray-400">Efficient deduplication and enrichment</p>
            </div>
          </div>
        </div>

        {/* Section 5: Supporting Visualizations */}
        <div id="visualizations" className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-blue-500/50 transition-colors scroll-mt-6">
          <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
            <span className="text-3xl">📊</span> Supporting Analytics
          </h2>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-4 border-l-4 border-blue-500 hover:bg-gray-900/70 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-900/30 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-400 mb-1">Top Tracks List</h3>
                  <p className="text-sm text-gray-300 mb-2">Most played songs with album artwork and play counts</p>
                  <span className="text-xs text-gray-500">Component: TopTracksList.tsx</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 border-l-4 border-purple-500 hover:bg-gray-900/70 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-purple-900/30 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⏱️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-purple-400 mb-1">Listening Stats Cards</h3>
                  <p className="text-sm text-gray-300 mb-2">Total time, track count, unique artists, average session</p>
                  <span className="text-xs text-gray-500">Component: ListeningStats.tsx</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 border-l-4 border-green-500 hover:bg-gray-900/70 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-green-900/30 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📈</span>
                </div>
                <div>
                  <h3 className="font-semibold text-green-400 mb-1">Artist Trends Chart</h3>
                  <p className="text-sm text-gray-300 mb-2">Weekly listening patterns for top artists over time</p>
                  <span className="text-xs text-gray-500">Component: ArtistTrendsChart.tsx</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 border-l-4 border-pink-500 hover:bg-gray-900/70 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-pink-900/30 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎵</span>
                </div>
                <div>
                  <h3 className="font-semibold text-pink-400 mb-1">Recent Plays Feed</h3>
                  <p className="text-sm text-gray-300 mb-2">Scrollable list of recent tracks with album art and today metrics</p>
                  <span className="text-xs text-gray-500">Component: RecentPlaysFeed.tsx</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 border-l-4 border-yellow-500 hover:bg-gray-900/70 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-yellow-900/30 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🔍</span>
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-400 mb-1">Discovery Rate</h3>
                  <p className="text-sm text-gray-300 mb-2">Monthly new artist and track discovery metrics</p>
                  <span className="text-xs text-gray-500">Component: DiscoveryRate.tsx</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 border-l-4 border-cyan-500 hover:bg-gray-900/70 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-cyan-900/30 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🕐</span>
                </div>
                <div>
                  <h3 className="font-semibold text-cyan-400 mb-1">Listening Rhythm Heatmap</h3>
                  <p className="text-sm text-gray-300 mb-2">30-minute interval heatmap showing daily patterns</p>
                  <span className="text-xs text-gray-500">Component: ListeningRhythmHeatmap.tsx</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Limitations Section */}
        <div id="limitations" className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-yellow-500/50 transition-colors scroll-mt-6">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
            <span className="text-3xl">⚠️</span> Known Limitations
          </h2>
          
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start gap-3 bg-gray-900/50 rounded-lg p-4">
              <span className="text-yellow-400 mt-1 text-xl flex-shrink-0">•</span>
              <div>
                <p className="font-semibold mb-1">Spotify API Limit</p>
                <p className="text-sm">Only captures last 50 tracks per request (mitigated by frequent 30-min polling)</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-gray-900/50 rounded-lg p-4">
              <span className="text-yellow-400 mt-1 text-xl flex-shrink-0">•</span>
              <div>
                <p className="font-semibold mb-1">Private Sessions</p>
                <p className="text-sm">Tracks played in private/incognito mode are not captured by API</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-gray-900/50 rounded-lg p-4">
              <span className="text-yellow-400 mt-1 text-xl flex-shrink-0">•</span>
              <div>
                <p className="font-semibold mb-1">Historical Data - Enrichment In Progress</p>
                <p className="text-sm">Full listening history available from 2019 onwards. Recent tracks (October 2025+) are fully enriched. Older tracks contain play history but are awaiting metadata enrichment (album images, genres, artist details).</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-gray-900/50 rounded-lg p-4">
              <span className="text-yellow-400 mt-1 text-xl flex-shrink-0">•</span>
              <div>
                <p className="font-semibold mb-1">Skip Detection</p>
                <p className="text-sm">Cannot distinguish between fully listened tracks vs skips (all played tracks are counted), using 95% duration rate.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Projects Section */}
        <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <span className="text-3xl">🔗</span> Related Projects
          </h2>
          
          <div className="bg-gray-900/50 rounded-lg p-5 border-l-4 border-cyan-500">
            <h3 className="text-lg font-semibold text-cyan-400 mb-2 flex items-center gap-2">
              <span>💻</span> Visual Stream
            </h3>
            <p className="text-sm text-gray-300 mb-3">
              Listener Analytics is built on the same technical foundation as <span className="text-cyan-400 font-semibold">Visual Stream</span>, 
              my development activity analytics platform that tracks coding time across projects using ActivityWatch data.
            </p>
            <p className="text-xs text-gray-400 italic">
              By reusing architecture patterns (ETL → Cloud Storage → React Frontend), I was able 
              to build Listener Analytics in 1/3 of the time it took to build Visual Stream. This demonstrates 
              the power of building reusable frameworks instead of one-off solutions.
            </p>
          </div>
        </div>

        {/* Section 6: BA Takeaways */}
        <div id="takeaways" className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-blue-500/50 transition-colors scroll-mt-6">
          <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
            <span className="text-3xl">💡</span> Key BA Takeaways
          </h2>
          
          <div className="space-y-4 text-gray-300">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 text-blue-400">
                1. Understanding the 'why' is more important than the 'what'
              </h3>
              <p className="text-sm leading-relaxed">
                Users don't want dashboards—they want answers. By focusing on specific questions about music 
                taste and listening patterns, I created visualizations that drive insights rather than just 
                displaying data. This mirrors professional BA work: always start with the business problem, 
                not the solution.
              </p>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 text-blue-400">
                2. Data quality determines insight quality
              </h3>
              <p className="text-sm leading-relaxed">
                Extracting featured artists separately and implementing deduplication logic ensures accurate 
                metrics. The difference between "tracks played" and "unique listening events" matters for 
                meaningful analytics. Good BAs understand data quality issues before building solutions.
              </p>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 text-blue-400">
                3. Continuous collection beats one-time snapshots
              </h3>
              <p className="text-sm leading-relaxed">
                Spotify Wrapped is fun once a year, but continuous tracking reveals trends and patterns over 
                time. Building for ongoing data collection (not just historical analysis) enables trend 
                detection and behavioral insights that point-in-time snapshots can't provide.
              </p>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 text-blue-400">
                4. Reusable architecture accelerates delivery
              </h3>
              <p className="text-sm leading-relaxed">
                By building on the same foundation as Visual Stream, I demonstrated that good system design 
                enables rapid development of new analytical products. This is exactly how professional analytics 
                teams scale—build reusable frameworks, not one-off solutions.
              </p>
            </div>
          </div>
        </div>

        {/* Section 7: Professional Application */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
            <span className="text-3xl">🎯</span> Professional Application
          </h2>
          
          <div className="space-y-4 text-gray-300">
            <blockquote className="italic text-lg border-l-4 border-blue-500 pl-4">
              "This project reinforced my core belief about analytics work: dashboards are just expensive 
              reporting if they don't help people make better decisions. We analysts aren't doing our jobs 
              if we don't understand the data at a fundamental level. You can't create stories if you don't 
              understand the plot yourself."
            </blockquote>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-blue-400">How This Applies to Professional BA Work:</h3>
              <p className="text-sm leading-relaxed">
                The same principles I applied here—understanding stakeholder needs (my own questions about music 
                taste), designing for actionability (every chart answers a specific question), implementing data 
                quality controls (deduplication, featured artist extraction), and building scalable architecture 
                (reusable components, cloud storage, automated collection)—are exactly what I bring to business 
                analysis roles. Whether it's music analytics, operational dashboards, or business intelligence, 
                the process is the same: listen, analyze, build, deliver, refine.
              </p>
            </div>
          </div>
        </div>

        {/* Section 8: Technology Stack */}
        <div id="stack" className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-blue-500/50 transition-colors scroll-mt-6">
          <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
            <span className="text-3xl">🛠️</span> Complete Technology Stack
          </h2>
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-950/30 rounded-lg p-4 border border-blue-500/30 hover:border-blue-500 transition-all">
              <h3 className="font-bold text-blue-400 mb-3 flex items-center gap-2">
                <span className="text-xl">📡</span> Data Collection
              </h3>
              <ul className="text-sm text-gray-300 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">•</span> Spotify Web API
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">•</span> Python + Spotipy
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">•</span> OAuth 2.0 Authentication
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">•</span> Scheduled collection (30min)
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-purple-950/30 rounded-lg p-4 border border-purple-500/30 hover:border-purple-500 transition-all">
              <h3 className="font-bold text-purple-400 mb-3 flex items-center gap-2">
                <span className="text-xl">🔄</span> Data Pipeline
              </h3>
              <ul className="text-sm text-gray-300 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">•</span> Pandas (transformation)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">•</span> Boto3 (R2 upload)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">•</span> Hashlib (change detection)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">•</span> Environment variables
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-950/30 rounded-lg p-4 border border-cyan-500/30 hover:border-cyan-500 transition-all">
              <h3 className="font-bold text-cyan-400 mb-3 flex items-center gap-2">
                <span className="text-xl">☁️</span> Storage & Hosting
              </h3>
              <ul className="text-sm text-gray-300 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">•</span> Cloudflare R2
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">•</span> Kinsta hosting
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">•</span> GitHub (version control)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">•</span> Custom domain + CDN
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-pink-900/30 to-pink-950/30 rounded-lg p-4 border border-pink-500/30 hover:border-pink-500 transition-all">
              <h3 className="font-bold text-pink-400 mb-3 flex items-center gap-2">
                <span className="text-xl">🎨</span> Frontend
              </h3>
              <ul className="text-sm text-gray-300 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="text-pink-400">•</span> React + TypeScript
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-pink-400">•</span> Vite (build tool)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-pink-400">•</span> Recharts (visualizations)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-pink-400">•</span> TailwindCSS (styling)
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-900/30 to-green-950/30 rounded-lg p-4 border border-green-500/30 hover:border-green-500 transition-all">
              <h3 className="font-bold text-green-400 mb-3 flex items-center gap-2">
                <span className="text-xl">🚀</span> DevOps
              </h3>
              <ul className="text-sm text-gray-300 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">•</span> CI/CD (GitHub → Kinsta)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">•</span> Discord webhooks
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">•</span> Secrets management
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">•</span> Automated deployment
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-950/30 rounded-lg p-4 border border-yellow-500/30 hover:border-yellow-500 transition-all">
              <h3 className="font-bold text-yellow-400 mb-3 flex items-center gap-2">
                <span className="text-xl">📊</span> Analytics
              </h3>
              <ul className="text-sm text-gray-300 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="text-yellow-400">•</span> Date-fns (date handling)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-400">•</span> Client-side aggregation
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-400">•</span> Time series analysis
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-yellow-400">•</span> Pattern detection
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Methodology;
