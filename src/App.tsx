import './index.css';
import { useEffect, useState } from 'react';
import Papa from 'papaparse';


//Overview The landing page - high-level insights at a glance
//Answer "What's my listening looking like recently?"
import ListeningStats from './components/ListeningStats';             //Listening Stats Cards (top row)
import ListeningHeatmap from './components/ListeningHeatmap'; //Listening Timeline Heatmap (hero visual)
import RecentPlaysFeed from './components/RecentPlaysFeed';     //Recent Plays Feed 


//ArtistAnalytics aka Artists
//Answer "Which artists do I actually listen to?"
import ArtistStatsCards from './components/ArtistStatsCards';          //Top Artists Bar Chart (hero visual)
import TopArtistsChart from './components/TopArtistsChart';            //Featured Artist Collaboration Network (hero visual)
import FeaturedArtistsChart from './components/FeaturedArtistsChart';  //Artist Play Count Over Time (line chart)
import ArtistTrendsChart from './components/ArtistTrendsChart';        //Artist Stats Cards

//TrackAlbumAnalytics aka Track & Album Analytics
//Answer "What songs/albums am I obsessed with?
import TopTracksList from './components/TopTracksList'; //Top Tracks List (main component)
import AlbumGallery from './components/AlbumGallery';   //Album Artwork Gallery
import TrackLengthDistribution from './components/TrackLengthDistribution';     //Track Length Distribution

 
//TemporalAnalytics aka Temporal Analytics
//Answer "When and how do I listen to music"
import ListeningRhythmHeatmap from './components/ListeningRhythmHeatmap'; //Hour × Day of Week with average plays per hour
import TimeOfDayDistribution from './components/TimeOfDayDistribution';   //Morning/Afternoon/Evening/Night pie chart
import ListeningPersonalityProfile from './components/ListeningPersonalityProfile';             //Current streak, longest streak, days active
import WeekdayWeekendComparison from './components/WeekdayWeekendComparison'; //Distribution of listening session lengths
import DeepDiveSessionsTimeline from './components/DeepDiveSessionsTimeline';             //Bar chart of total plays by day
 
//BehavioralAnalytics aka Behavioral Analytics
//Answer "when do I listen to music"
import ListeningVelocityChart from './components/ListeningVelocityChart'; //Hour × Day of Week with average plays per hour
import DiscoveryRate from './components/DiscoveryRate';   
import RepeatRatio from './components/RepeatRatio';             
import ConsistencyVariance from './components/ConsistencyVariance'; 


//Patterns aka Patterns
//Answer "When and how do I listen to music?"
import YearInMusic from './components/YearInMusic';  //Daily Activity Timeline (line chart)


//Methodology aka Methodology
import Methodology from './components/Methodology';


// Filters & Page Selector & Exclusions
import PageSelector from './components/PageSelector';


// Footer
import Footer from './components/Footer';

// Microsoft Clarity
import clarity from "@microsoft/clarity";



const ExploreButton = ({ setHasEntered }: { setHasEntered: (val: boolean) => void }) => {
  const [progress, setProgress] = useState(0);
  const [waveOffset, setWaveOffset] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const duration = 1500;
    const interval = 20;
    const increment = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 102) {
          clearInterval(timer);
          return 102;
        }
        return Math.min(prev + increment, 102);
      });

      setWaveOffset((prev) => (prev + 2) % 360);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const createWave = (offset: number, amplitude = 2, points = 15) => {
    return Array.from({ length: points }, (_, i) => {
      const y = (i / (points - 1)) * 100;
      const wave = Math.sin((y * 5 + offset) * 0.15) * amplitude;
      return `${progress + wave + 2}% ${y}%`;
    }).join(', ');
  };

  return (
    <button
      onClick={() => {
        console.log('Entered!');
        setHasEntered(true);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      type="button"
      className="relative z-20 overflow-hidden text-white font-bold text-xl py-4 px-16 rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl cursor-pointer active:scale-95 bg-gray-900/40 border border-gray-700"
    >
      {/* Neon liquid waves */}
      {[1, 2, 3].map((i) => {
        const amplitude = 2 + i;
        const opacity = 0.4 + i * 0.2;
        const offset = waveOffset + i * 20;
        const blur = 10 + i * 5;
        return (
          <div
            key={i}
            className="absolute inset-0 rounded-full transition-all duration-300"
            style={{
              clipPath: `polygon(
                0% 0%, 
                ${createWave(offset, amplitude)}, 
                ${progress + amplitude + 2}% 100%, 
                0% 100%
              )`,
              background: 'linear-gradient(90deg, #ff0080, #7928ca, #00c6ff)',
              boxShadow: isHovered 
                ? '0 0 25px #ff0080, 0 0 40px #7928ca, 0 0 60px #00c6ff'
                : '0 0 15px #ff0080, 0 0 25px #7928ca, 0 0 35px #00c6ff',
              opacity: isHovered ? opacity + 0.2 : opacity,
              filter: `blur(${isHovered ? blur - 3 : blur}px) brightness(${isHovered ? 1.2 : 1})`,
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              zIndex: 0,
            }}
          />
        );
      })}

      {/* Ripple effect on hover */}
      {isHovered && (
        <div
          className="absolute inset-0 rounded-full animate-ping"
          style={{
            background: 'radial-gradient(circle, rgba(255,0,128,0.4) 0%, transparent 70%)',
            animationDuration: '1s',
          }}
        />
      )}

      {/* Shimmer overlay */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-500"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
          transform: isHovered ? 'translateX(200%)' : 'translateX(-200%)',
          transition: 'transform 0.8s ease-in-out',
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* Button text with glow */}
      <span 
        className="relative z-10 transition-all duration-300"
        style={{
          textShadow: isHovered 
            ? '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,0,128,0.6)'
            : 'none',
        }}
      >
        Explore My Music
      </span>
    </button>
  );
};

// cache busters
const cacheBusted = (url: string) =>
  `${url}${url.includes("?") ? "&" : "?"}cb=${Date.now()}`;






function App() {
    const [showPageSelector, setShowPageSelector] = useState(false);
const [hasEntered, setHasEntered] = useState(false); 

const [showError, setShowError] = useState(false);
  const [awData, setAwData] = useState<any[]>([]);


  const [selectedPage, setSelectedPage] = useState('Summary');
// Load Spotify listening data
useEffect(() => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://your-api-endpoint.workers.dev';

  fetch(cacheBusted(`${API_BASE_URL}/spotify_listening_history.csv`))
    .then((res) => res.text())
    .then((text) => {
      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results: Papa.ParseResult<any>) => {
          const parsed = results.data
            .filter((d: any) => !!d.played_at) // Filter rows with valid played_at
            .map((d: any) => ({
              played_at: d.played_at, // Keep as string, convert to Date in components if needed
              track_name: d.track_name || 'Unknown Track',
              artist_name: d.artist_name || 'Unknown Artist',
              artist_image_url: d.artist_image_url || '',
              album_name: d.album_name || 'Unknown Album',
              duration_ms: d.duration_ms || 0,
              album_image_url: d.album_image_url || '',
              featured_artists: d.featured_artists || null,
              album_release_year: d.album_release_year || null,
              genres: d.genres || null,
            }));
          setAwData(parsed);
        },
      });
    })
    .catch((err) => {
      console.error('Failed to load Spotify data:', err);
      setShowError(true);
    });
}, []);





// Clarity tracking init - only in production
useEffect(() => {
  const clarityProjectId = import.meta.env.VITE_CLARITY_PROJECT_ID;
  
  // Only initialize if we have a project ID and we're in production
  if (clarityProjectId && import.meta.env.PROD) {
    clarity.init(clarityProjectId);
  }
}, []);




  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => setShowError(false), 30000);
      return () => clearTimeout(timer);
    }
  }, [showError]);


const TypewriterLoader = () => {
    const messages = [
      "Loading your music data...",
      "Analyzing your listening trends...",
      "Processing playback history...",
      "Calculating music statistics...",
      "Compiling dashboard insights...",
      "Syncing Spotify metrics...",
      "Generating genre breakdowns...",
      "Visualizing musical footprint...",
    ];

  const [messageIndex, setMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    const currentMessage = messages[messageIndex];
    let timeout: NodeJS.Timeout;

    if (displayedText.length < currentMessage.length) {
      timeout = setTimeout(() => {
        setDisplayedText(currentMessage.slice(0, displayedText.length + 1));
      }, 80); // Typing speed
    } else {
      // Pause at 5 seconds before moving to next message
      timeout = setTimeout(() => {
        if (messageIndex < messages.length - 1) {
          setMessageIndex(messageIndex + 1);
          setDisplayedText("");
        }
      }, 5000);
    }

    return () => clearTimeout(timeout);
  }, [displayedText, messageIndex]);

  return (
    <div className="flex-grow flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Pulsing Rings + Sound Wave Loader */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Outer pulsing rings */}
          <div className="absolute w-full h-full border-2 border-green-500 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]"></div>
          <div className="absolute w-3/4 h-3/4 border-2 border-green-400 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" style={{animationDelay: '0.2s'}}></div>
          
          {/* Sound wave inside */}
          <div className="flex items-center justify-center gap-1 h-12">
            <div className="w-1 bg-green-500 rounded-full animate-[wave1_1s_ease-in-out_infinite]" style={{height: '6px'}}></div>
            <div className="w-1 bg-green-500 rounded-full animate-[wave2_1s_ease-in-out_infinite]" style={{height: '12px'}}></div>
            <div className="w-1 bg-green-500 rounded-full animate-[wave3_1s_ease-in-out_infinite]" style={{height: '18px'}}></div>
            <div className="w-1 bg-green-500 rounded-full animate-[wave4_1s_ease-in-out_infinite]" style={{height: '12px'}}></div>
            <div className="w-1 bg-green-500 rounded-full animate-[wave5_1s_ease-in-out_infinite]" style={{height: '6px'}}></div>
          </div>
        </div>
        
        {/* Typewriter Text */}
        <div className="flex flex-col items-center gap-1 text-center min-h-14">
          <p className="text-white text-lg font-medium h-7">
            {displayedText}
            {messageIndex === messages.length - 1 && displayedText === messages[messageIndex] ? (
              <span className="animate-[blink_1s_ease-in-out_infinite]">...</span>
            ) : (
              <span className="animate-pulse">|</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

  // Define the render function for each page
  const renderPageContent = () => {
    switch (selectedPage) {
      
        case 'Summary':
          return (
            <div className="bg-gray-900 p-4 rounded-xl space-y-6 overflow-visible">
              {/* Title */}
              <h1 className="text-5xl font-extrabold font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-sky-400 drop-shadow-sm tracking-tight text-center leading-tight pb-2">
                Dashboard
              </h1>

              {/* Page Selector Only (no Filters for AW data) */}
                <div className="fixed top-4 right-4 z-50">
                  <button 
                    onClick={() => setShowPageSelector(!showPageSelector)}
                    className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-full p-3 hover:bg-gray-700 transition-all shadow-lg hover:scale-105"
                    aria-label="Page Navigation"
                  >
                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
  
                  {showPageSelector && (
                    <>
                      {/* Backdrop to close on click outside */}
                      <div 
                        className="fixed inset-0 -z-10" 
                        onClick={() => setShowPageSelector(false)}
                      />
                      <div className="absolute top-0 right-full mr-2 min-w-[200px]">
                        <PageSelector 
                  selectedPage={selectedPage} 
                  setSelectedPage={setSelectedPage}
                  onClose={() => setShowPageSelector(false)}
                />
                      </div>
                    </>
                  )}
                </div>

            {/* KPI Cards */}
            <div className="space-y-6">
              <ListeningStats data={awData} />
            </div>

            {/* Middle Row - 2 Charts in Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ListeningHeatmap data={awData} />
            <RecentPlaysFeed data={awData} limit={15} />
            </div>

            </div>
          );

        //Page 2
        case 'ArtistAnalytics':
          return (
            <div className="bg-gray-900 p-4 rounded-xl space-y-6 overflow-visible">
              {/* Title */}
              <h1 className="text-5xl font-extrabold font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-sky-400 drop-shadow-sm tracking-tight text-center leading-tight pb-2">
                Artist Analytics
              </h1>

              {/* Page Selector Only (no Filters for AW data) */}
                <div className="fixed top-4 right-4 z-50">
                  <button 
                    onClick={() => setShowPageSelector(!showPageSelector)}
                    className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-full p-3 hover:bg-gray-700 transition-all shadow-lg hover:scale-105"
                    aria-label="Page Navigation"
                  >
                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
  
                  {showPageSelector && (
                    <>
                      {/* Backdrop to close on click outside */}
                      <div 
                        className="fixed inset-0 -z-10" 
                        onClick={() => setShowPageSelector(false)}
                      />
                      <div className="absolute top-0 right-full mr-2 min-w-[200px]">
                        <PageSelector 
                  selectedPage={selectedPage} 
                  setSelectedPage={setSelectedPage}
                  onClose={() => setShowPageSelector(false)}
                />
                      </div>
                    </>
                  )}
                </div>

          {/* KPI Cards */}
            <div className="space-y-6">
              <ArtistStatsCards data={awData} />
            </div>

          {/* Middle Row - 2 Charts in Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <TopArtistsChart data={awData} />
            <FeaturedArtistsChart data={awData} limit={15} />
            </div>
          {/* Trends Chart - Full Width */}
            <ArtistTrendsChart data={awData} topN={5} />

            </div>
          );

//Page 3
        case 'TrackAlbumAnalytics':
          return (
            <div className="bg-gray-900 p-4 rounded-xl space-y-6 overflow-visible">
              {/* Title */}
              <h1 className="text-5xl font-extrabold font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-sky-400 drop-shadow-sm tracking-tight text-center leading-tight pb-2">
                Track & Album Analytics
              </h1>

              {/* Page Selector Only (no Filters for AW data) */}
                <div className="fixed top-4 right-4 z-50">
                  <button 
                    onClick={() => setShowPageSelector(!showPageSelector)}
                    className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-full p-3 hover:bg-gray-700 transition-all shadow-lg hover:scale-105"
                    aria-label="Page Navigation"
                  >
                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
  
                  {showPageSelector && (
                    <>
                      {/* Backdrop to close on click outside */}
                      <div 
                        className="fixed inset-0 -z-10" 
                        onClick={() => setShowPageSelector(false)}
                      />
                      <div className="absolute top-0 right-full mr-2 min-w-[200px]">
                        <PageSelector 
                  selectedPage={selectedPage} 
                  setSelectedPage={setSelectedPage}
                  onClose={() => setShowPageSelector(false)}
                />
                      </div>
                    </>
                  )}
                </div>

          {/* KPI Cards */}

            <div className="space-y-6">
            <AlbumGallery data={awData} />
            </div>
          {/* Middle Row - 2 Charts in Grid */}
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <TrackLengthDistribution  data={awData} limit={15} />
            <TopTracksList data={awData} />

            </div>
            </div>
          );
//Page 4
        case 'TracksAlbums':
          return (
            <div className="bg-gray-900 p-4 rounded-xl space-y-6 overflow-visible">
              {/* Title */}
              <h1 className="text-5xl font-extrabold font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-sky-400 drop-shadow-sm tracking-tight text-center leading-tight pb-2">
                Music Summary
              </h1>

              {/* Page Selector Only (no Filters for AW data) */}
                <div className="fixed top-4 right-4 z-50">
                  <button 
                    onClick={() => setShowPageSelector(!showPageSelector)}
                    className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-full p-3 hover:bg-gray-700 transition-all shadow-lg hover:scale-105"
                    aria-label="Page Navigation"
                  >
                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
  
                  {showPageSelector && (
                    <>
                      {/* Backdrop to close on click outside */}
                      <div 
                        className="fixed inset-0 -z-10" 
                        onClick={() => setShowPageSelector(false)}
                      />
                      <div className="absolute top-0 right-full mr-2 min-w-[200px]">
                        <PageSelector 
                  selectedPage={selectedPage} 
                  setSelectedPage={setSelectedPage}
                  onClose={() => setShowPageSelector(false)}
                />
                      </div>
                    </>
                  )}
                </div>

          {/* KPI Cards */}

            <div className="space-y-6">
            <AlbumGallery data={awData} />
            </div>
          {/* Middle Row - 2 Charts in Grid */}
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <TrackLengthDistribution  data={awData} />
            <TopTracksList data={awData} />

            </div>
            </div>
          );

//Page 5
        case 'TemporalAnalytics':
          return (
            <div className="bg-gray-900 p-4 rounded-xl space-y-6 overflow-visible">
              {/* Title */}
              <h1 className="text-5xl font-extrabold font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-sky-400 drop-shadow-sm tracking-tight text-center leading-tight pb-2">
                Temporal Analytics
              </h1>

              {/* Page Selector Only (no Filters for AW data) */}
                <div className="fixed top-4 right-4 z-50">
                  <button 
                    onClick={() => setShowPageSelector(!showPageSelector)}
                    className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-full p-3 hover:bg-gray-700 transition-all shadow-lg hover:scale-105"
                    aria-label="Page Navigation"
                  >
                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
  
                  {showPageSelector && (
                    <>
                      {/* Backdrop to close on click outside */}
                      <div 
                        className="fixed inset-0 -z-10" 
                        onClick={() => setShowPageSelector(false)}
                      />
                      <div className="absolute top-0 right-full mr-2 min-w-[200px]">
                        <PageSelector 
                  selectedPage={selectedPage} 
                  setSelectedPage={setSelectedPage}
                  onClose={() => setShowPageSelector(false)}
                />
                      </div>
                    </>
                  )}
                </div>

          {/* KPI Cards */}

<div className="space-y-6">
  {/* Row 1: Heatmap (3/5) + Profile (2/5) */}
  <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
    <div className="xl:col-span-3">
      <ListeningRhythmHeatmap data={awData} />
    </div>
    <div className="xl:col-span-2">
      <ListeningPersonalityProfile data={awData} />
    </div>
  </div>

  {/* Row 2: Time + Sessions */}
  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
    <TimeOfDayDistribution data={awData} />
    <DeepDiveSessionsTimeline data={awData} />
  </div>

  {/* Row 3: Weekday/Weekend Comparison - Full Width */}
  <WeekdayWeekendComparison data={awData} />
</div>


            </div>
          );

//Page 6
        case 'BehavioralAnalytics':
          return (
            <div className="bg-gray-900 p-4 rounded-xl space-y-6 overflow-visible">
              {/* Title */}
              <h1 className="text-5xl font-extrabold font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-sky-400 drop-shadow-sm tracking-tight text-center leading-tight pb-2">
                Behavioral Analytics
              </h1>

              {/* Page Selector Only (no Filters for AW data) */}
                <div className="fixed top-4 right-4 z-50">
                  <button 
                    onClick={() => setShowPageSelector(!showPageSelector)}
                    className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-full p-3 hover:bg-gray-700 transition-all shadow-lg hover:scale-105"
                    aria-label="Page Navigation"
                  >
                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
  
                  {showPageSelector && (
                    <>
                      {/* Backdrop to close on click outside */}
                      <div 
                        className="fixed inset-0 -z-10" 
                        onClick={() => setShowPageSelector(false)}
                      />
                      <div className="absolute top-0 right-full mr-2 min-w-[200px]">
                        <PageSelector 
                  selectedPage={selectedPage} 
                  setSelectedPage={setSelectedPage}
                  onClose={() => setShowPageSelector(false)}
                />
                      </div>
                    </>
                  )}
                </div>

          {/* KPI Cards */}

        <div className="space-y-6">
          {/* Row 1: Velocity Chart */}
          <ListeningVelocityChart data={awData} />
  
          {/* Row 2: 3 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <DiscoveryRate data={awData} />
            <RepeatRatio data={awData} />
            <ConsistencyVariance data={awData} />
          </div>
        </div>

            </div>
          );

      

//Page 7
        case 'YearInMusic':
          return (
            <div className="bg-gray-900 p-4 rounded-xl space-y-6 overflow-visible">
              {/* Title */}
              <h1 className="text-5xl font-extrabold font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-sky-400 drop-shadow-sm tracking-tight text-center leading-tight pb-2">
                Your Year in Music
              </h1>

              {/* Page Selector Only (no Filters for AW data) */}
                <div className="fixed top-4 right-4 z-50">
                  <button 
                    onClick={() => setShowPageSelector(!showPageSelector)}
                    className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-full p-3 hover:bg-gray-700 transition-all shadow-lg hover:scale-105"
                    aria-label="Page Navigation"
                  >
                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
  
                  {showPageSelector && (
                    <>
                      {/* Backdrop to close on click outside */}
                      <div 
                        className="fixed inset-0 -z-10" 
                        onClick={() => setShowPageSelector(false)}
                      />
                      <div className="absolute top-0 right-full mr-2 min-w-[200px]">
                        <PageSelector 
                  selectedPage={selectedPage} 
                  setSelectedPage={setSelectedPage}
                  onClose={() => setShowPageSelector(false)}
                />
                      </div>
                    </>
                  )}
                </div>

          {/* KPI Cards */}

        <div className="space-y-6">
          {/* Row 1: Velocity Chart */}
          <YearInMusic data={awData} /> 
        </div>

            </div>
          );          

        case 'Methodology':
          return (
            <div className="bg-gray-900 p-4 rounded-xl space-y-6 overflow-visible">
              {/* Title */}
              <h1 className="text-5xl font-extrabold font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 drop-shadow-sm tracking-tight text-center leading-tight pb-2">
                Project Methodology
              </h1>
              <p className="text-center text-gray-400 text-lg -mt-4 pb-4">
                A Business Analyst's Approach to Building Listener Analytics
              </p>

              {/* Page Selector */}
              <div className="fixed top-4 right-4 z-50">
                <button 
                  onClick={() => setShowPageSelector(!showPageSelector)}
                  className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-full p-3 hover:bg-gray-700 transition-all shadow-lg hover:scale-105"
                  aria-label="Page Navigation"
                >
                  <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {showPageSelector && (
                  <>
                    <div 
                      className="fixed inset-0 -z-10" 
                      onClick={() => setShowPageSelector(false)}
                    />
                    <div className="absolute top-0 right-full mr-2 min-w-[200px]">
                      <PageSelector 
                        selectedPage={selectedPage} 
                        setSelectedPage={setSelectedPage}
                        onClose={() => setShowPageSelector(false)}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Methodology Content */}
              <Methodology />
            </div>
          );



              default:
                return null;
            }
          };
          if (!hasEntered) {
            return (
        <div className="relative flex items-center justify-center min-h-screen w-full overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
          <div className="relative z-10 text-center space-y-8 p-8 max-w-2xl">
            <div className="overflow-visible py-4">
              <h1 className="text-6xl md:text-7xl font-extrabold font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 drop-shadow-lg tracking-tight leading-tight animate-pulse">
                Listener Analytics
              </h1>
            </div>
            <p className="text-slate-300 text-lg max-w-md mx-auto drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]">
              Visualizing <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.3)]">musical footprint</span> in <span className="text-sky-300 drop-shadow-[0_0_8px_rgba(125,211,252,0.4)]">real-time</span>
            </p>

<ExploreButton setHasEntered={setHasEntered} />

  </div>
</div>

    );
  }

  // {awData.length === 0 || true ? (  
  // {awData.length === 0 ? (  
        return (
          <div className="flex flex-col min-h-screen bg-gray-950 text-white">
            <main className="flex-grow flex flex-col space-y-4 p-4 overflow-hidden">
      
              {awData.length === 0 ? (  

          <TypewriterLoader />
        ) : (
        <>
          {renderPageContent()}
        </>
      )}
    </main>
    <Footer />
  </div>
);


}

export default App;