# Listener Analytics - Music Intelligence Platform

> Advanced Spotify analytics platform demonstrating data visualization expertise and full-stack development capabilities. Features 30+ interactive visualizations, behavioral pattern analysis, and personalized listening insights.

**Live Demo:** [https://music.metricforge.dev](https://music.metricforge.dev)

---

## 🎵 Overview

Listener Analytics is a production-grade music analytics dashboard built to transform raw Spotify listening data into comprehensive insights about music consumption patterns. The platform processes extended streaming history to provide deep behavioral analysis through interactive visualizations, temporal pattern detection, and discovery metrics.

### Key Features

- **7 Comprehensive Pages** - Overview, Artists, Tracks, Listening Patterns, Deep Dive, and Year-in-Review timeline
- **20+ Interactive Visualizations** - Heatmaps, trend charts, session analysis, and predictive analytics
- **Behavioral Pattern Analysis** - 30-minute listening rhythms, session clustering, and consistency tracking
- **Discovery Metrics** - New artist/track discovery rate, repeat ratios, and exploration patterns
- **Temporal Intelligence** - Time-of-day preferences, streak tracking, and velocity charts
- **Responsive Design** - Mobile-first interface optimized for all screen sizes

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Component-based UI architecture
- **TypeScript** - Type-safe development
- **Recharts** - Data visualization library
- **Tailwind CSS** - Utility-first styling
- **Vite** - Next-generation build tool
- **PapaParse** - CSV parsing for streaming history

### Backend & Infrastructure
- **Python** - Data processing and ETL pipeline
- **Cloudflare Workers** - Serverless API endpoints (optional)
- **R2 Storage** - CSV data hosting (optional)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Git
- Spotify extended streaming history (request via account privacy settings)
- A code editor (VS Code recommended)

### Installation

**1. Clone the repository**

git clone https://github.com/MetricForge/Listener-Analytics.git
cd Listener-Analytics

---

**2. Install dependencies**

npm install

---

**3. Set up environment variables**

Create a `.env.local` file in the root directory with:

VITE_API_BASE_URL=https://data.yourdomain.dev
VITE_CLARITY_PROJECT_ID=your-clarity-project-id
VITE_CREATOR=Your Name
VITE_CREATOR_DOMAIN=https://linkedin.com/in/yourprofile
VITE_START_YEAR=2025
VITE_GITHUB_URL=https://github.com/YourUsername/Listener-Analytics

---

**4. Prepare your Spotify data**

Place your Spotify extended streaming history CSV files in the `public/data/` directory:
- `spotify_listening_history.csv`

**5. Run the development server**

npm run dev

---

**6. Open your browser**

Navigate to `http://localhost:xxx` to see the application.

---

## 📦 Build & Deploy

### Production Build

npm run build

---

### Preview Production Build

npm run preview

---

## 📁 Project Structure

listener-analytics/
├── public/ # Static assets & data files
│ └── data/ # Spotify CSV files
├── src/
│ ├── components/ # React components (30+)
│ ├── App.tsx # Main application
│ ├── main.tsx # Entry point
│ └── index.css # Global styles
├── scripts/ # Python data processing
│ └── musicspotify.py
├── index.html # HTML template
├── package.json # Dependencies
├── tsconfig.json # TypeScript config
├── tailwind.config.js # Tailwind config
├── vite.config.ts # Vite config
└── README.md # Documentation
---

## 🎨 Key Components

### Page 1: Overview Dashboard
- **RecentPlaysFeed** - Live feed of recent tracks with play counts and metrics
- **ArtistStatsCards** - Quick stats on top artists and listening totals
- **TopArtistsChart** - Bar chart visualization of most-played artists

### Page 2: Artists Deep Dive
- **ArtistTrendsChart** - Historical trends showing artist listening over time
- **AlbumGallery** - Visual gallery of top albums with play statistics
- **TopArtistsList** - Ranked list with detailed play counts and percentages

### Page 3: Track Analytics
- **TopTracksList** - Most-played tracks with position tracking
- **TrackLengthDistribution** - Histogram of listening preferences by track duration
- **TrackMovement** - Position changes and trending indicators

### Page 4: Listening Patterns
- **ListeningRhythmHeatmap** - 30-minute block heatmap showing temporal patterns
- **TimeOfDayDistribution** - Breakdown of morning/afternoon/evening/night preferences
- **ListeningStreaks** - Current and longest consecutive listening days
- **SessionLengthAnalysis** - Duration patterns and session clustering

### Page 5: Deep Dive Analytics
- **ListeningVelocityChart** - Daily play counts with trend analysis
- **DiscoveryRate** - New artists and tracks discovered per month
- **RepeatRatio** - Balance between repeated favorites and unique tracks
- **ConsistencyVariance** - Daily listening habit stability metrics

### Page 6: Year in Music
- **YourYearInMusic** - Timeline-style visualization of monthly top artists
- **MilestoneTracking** - First plays, discovery months, and achievement badges
- **MonthlyBreakdown** - Detailed stats per month with year filtering

---

## 📊 Analytics Capabilities

### Behavioral Insights
- Session duration tracking and clustering
- Time-of-day preference analysis
- Listening consistency and variance metrics
- Streak tracking and momentum analysis

### Discovery & Exploration
- New artist/track discovery rate
- Repeat listening patterns
- Artist rotation and diversity scores
- Exploration vs familiarity balance

### Temporal Analysis
- 30-minute listening rhythm heatmaps
- Weekly and monthly trend detection
- Seasonal pattern identification
- Velocity and acceleration metrics

---

## 🔒 Data Privacy

- All data processing happens locally in your browser
- No personal listening data is transmitted to external servers
- Spotify data remains under your control
- Optional cloud hosting for CSV files only

---

## 🤝 Contributing

This is a portfolio project, but suggestions and feedback are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👤 Author

**Your Name**
- LinkedIn: [Kevin Hsueh](https://www.linkedin.com/in/kevinkhsueh/)
- GitHub: [@MetricForge](https://github.com/MetricForge)
- Portfolio: [metricforge.dev](https://metricforge.dev)

---

## 🙏 Acknowledgments

- [Spotify](https://www.spotify.com/) - Music streaming and data source
- [Recharts](https://recharts.org/) - Visualization library
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Vite](https://vitejs.dev/) - Build tool

---

## 📊 Project Stats

- **30+ Components** - Modular, reusable React components
- **7 Pages** - Comprehensive analytics coverage
- **TypeScript** - 100% type coverage
- **Responsive** - Mobile, tablet, and desktop optimized
- **Production Ready** - Deployable to any static hosting platform

---

**Built with ❤️ for Music Analytics and Data Visualization**
