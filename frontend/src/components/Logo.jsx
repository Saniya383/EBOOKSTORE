import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ className = "", size = "default" }) => {
  const sizeClasses = {
    small: "text-xl",
    default: "text-2xl",
    large: "text-3xl"
  };

  return (
    <Link 
      to='/' 
      className={`font-bold text-emerald-400 items-center space-x-2 flex group ${sizeClasses[size]} ${className}`}
    >
      {/* Custom Book Icon with Enhanced Design */}
      <div className="relative">
        {/* Main Book Shape */}
        <svg 
          width="32" 
          height="32" 
          viewBox="0 0 32 32" 
          className="transition-all duration-300 group-hover:scale-110"
        >
          {/* Book Cover */}
          <rect 
            x="6" 
            y="4" 
            width="20" 
            height="24" 
            rx="2" 
            fill="currentColor" 
            className="text-emerald-500"
          />
          
          {/* Book Pages */}
          <rect 
            x="8" 
            y="6" 
            width="16" 
            height="20" 
            rx="1" 
            fill="currentColor" 
            className="text-emerald-100"
          />
          
          {/* Book Spine */}
          <rect 
            x="6" 
            y="4" 
            width="3" 
            height="24" 
            rx="1" 
            fill="currentColor" 
            className="text-emerald-600"
          />
          
          {/* Page Lines */}
          <line 
            x1="10" 
            y1="10" 
            x2="22" 
            y2="10" 
            stroke="currentColor" 
            strokeWidth="0.5" 
            className="text-emerald-400"
          />
          <line 
            x1="10" 
            y1="13" 
            x2="20" 
            y2="13" 
            stroke="currentColor" 
            strokeWidth="0.5" 
            className="text-emerald-400"
          />
          <line 
            x1="10" 
            y1="16" 
            x2="22" 
            y2="16" 
            stroke="currentColor" 
            strokeWidth="0.5" 
            className="text-emerald-400"
          />
          
          {/* Decorative Bookmark */}
          <rect 
            x="23" 
            y="4" 
            width="2" 
            height="12" 
            fill="currentColor" 
            className="text-yellow-400"
          />
          <polygon 
            points="23,16 25,16 24,18" 
            fill="currentColor" 
            className="text-yellow-400"
          />
        </svg>
        
        {/* Floating Sparkle Effect */}
        <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path 
              d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" 
              fill="currentColor" 
              className="text-yellow-300"
            />
          </svg>
        </div>
      </div>
      
      {/* Enhanced Text with Gradient Effect */}
      <span className="relative">
        <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent font-extrabold tracking-wide">
          Book
        </span>
        <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent font-extrabold tracking-wide">
          oria
        </span>
        
        {/* Subtle Underline Animation */}
        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 group-hover:w-full transition-all duration-300"></div>
      </span>
      
      {/* Optional Tagline for larger sizes */}
      {size === "large" && (
        <span className="text-xs text-emerald-300 font-normal ml-2 opacity-75">
          Your Digital Library
        </span>
      )}
    </Link>
  );
};

export default Logo;