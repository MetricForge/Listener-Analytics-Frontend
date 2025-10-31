import React from 'react';

interface PageSelectorProps {
  selectedPage: string;
  setSelectedPage: (page: string) => void;
  onClose?: () => void;
}

const PageSelector: React.FC<PageSelectorProps> = ({ selectedPage, setSelectedPage, onClose }) => { 
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPage(e.target.value);
    if (onClose) onClose();
  };

  return (
<div className="page-selector flex items-center gap-2">
    {/* Home icon button */}
    <a
      href="https://metricforge.dev/"
      title="Back to Home"
      className="p-2 text-gray-400 hover:text-blue-400 rounded-md transition-colors flex-shrink-0"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    </a>

      <select
        onChange={handleChange}
        value={selectedPage}
        className="
          bg-gradient-to-r from-blue-600 to-blue-800 
          border border-gray-500 
          text-white 
          text-sm 
          font-semibold 
          rounded-lg 
          px-2 
          py-2 
          h-11 
          min-w-[130px] 
          focus:ring-blue-400 
          focus:ring-2 
          focus:border-blue-400 
          hover:border-blue-400 
          shadow-md 
          transition-all 
          duration-200 
          leading-normal
        "
      >
        <option value="Summary" className="bg-gray-800 hover:bg-blue-600 text-center">Summary</option>
        <option value="ArtistAnalytics" className="bg-gray-800 hover:bg-blue-600 text-center">Artist Analytics</option>
        <option value="TrackAlbumAnalytics" className="bg-gray-800 hover:bg-blue-600 text-center">Track & Album Analytics</option>
        <option value="TemporalAnalytics" className="bg-gray-800 hover:bg-blue-600 text-center">Temporal Analytics</option>
        <option value="BehavioralAnalytics" className="bg-gray-800 hover:bg-blue-600 text-center">Behavioral Analytics</option>
        <option value="YearInMusic" className="bg-gray-800 hover:bg-blue-600 text-center">Year in Music</option>
        <option value="Methodology" className="bg-gray-800 hover:bg-blue-600 text-center">Methodology</option>
      </select>

    </div>
  );
};

export default PageSelector;