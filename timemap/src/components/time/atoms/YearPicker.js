import React, { useState, useEffect } from "react";

const YearPicker = ({ events, dims, onYearSelect, onShowFullRange, currentYear }) => {
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isInternalUpdate, setIsInternalUpdate] = useState(false);
  const [isFullRange, setIsFullRange] = useState(currentYear === null);
  
  // Generate years from event data
  const getYearRange = () => {
    if (!events || events.length === 0) {
      return [];
    }
    
    const validDates = events
      .filter(event => event.datetime instanceof Date && !isNaN(event.datetime))
      .map(event => event.datetime.getFullYear());
    
    if (validDates.length === 0) {
      return [];
    }
    
    const minYear = Math.min(...validDates);
    const maxYear = Math.max(...validDates);
    
    const years = [];
    for (let year = minYear; year <= maxYear; year++) {
      years.push(year);
    }
    
    return years;
  };

  const years = getYearRange();
  const itemHeight = 15; // Height of each year item
  const visibleItems = 5; // Number of visible items
  const centerIndex = Math.floor(visibleItems / 2); // Index of center item (2)
  
  // Initialize selected year only when currentYear changes externally
  useEffect(() => {
    if (isInternalUpdate) {
      setIsInternalUpdate(false);
      return;
    }
    
    if (currentYear === null) {
      // Full range state
      setIsFullRange(true);
      setSelectedYear(null);
    } else if (currentYear && years.includes(currentYear)) {
      setIsFullRange(false);
      setSelectedYear(currentYear);
    } else if (years.length > 0 && !selectedYear && currentYear !== null) {
      const middleYear = years[Math.floor(years.length / 2)];
      setIsFullRange(false);
      setSelectedYear(middleYear);
    }
  }, [currentYear, years, isInternalUpdate, selectedYear]);

  // Handle year selection
  const handleYearClick = (year) => {
    setIsInternalUpdate(true);
    setIsFullRange(false);
    setSelectedYear(year);
    onYearSelect(year);
  };

  // Handle full range selection
  const handleFullRangeClick = () => {
    setIsInternalUpdate(true);
    setIsFullRange(true);
    setSelectedYear(null);
    onShowFullRange();
  };

  // Handle scroll wheel events
  const handleWheel = (event) => {
    event.preventDefault();
    
    if (isFullRange) {
      // If in full range, scroll down goes to first year
      const delta = event.deltaY > 0 ? 1 : -1;
      if (delta > 0 && years.length > 0) {
        // Scroll down - go to first year
        setIsInternalUpdate(true);
        setIsFullRange(false);
        setSelectedYear(years[0]);
        onYearSelect(years[0]);
      }
      return;
    }
    
    const delta = event.deltaY > 0 ? 1 : -1;
    const currentIndex = years.indexOf(selectedYear);
    
    if (delta < 0 && currentIndex === 0) {
      // Scroll up from first year - go to full range
      setIsInternalUpdate(true);
      setIsFullRange(true);
      setSelectedYear(null);
      onShowFullRange();
      return;
    }
    
    const newIndex = Math.max(0, Math.min(years.length - 1, currentIndex + delta));
    
    if (newIndex !== currentIndex && years[newIndex]) {
      setIsInternalUpdate(true);
      setSelectedYear(years[newIndex]);
      onYearSelect(years[newIndex]);
    }
  };

  // Handle arrow navigation
  const handleArrowClick = (direction) => {
    if (isFullRange) {
      // If in full range and going down, go to first year
      if (direction === 'down' && years.length > 0) {
        setIsInternalUpdate(true);
        setIsFullRange(false);
        setSelectedYear(years[0]);
        onYearSelect(years[0]);
      }
      return;
    }
    
    const currentIndex = years.indexOf(selectedYear);
    
    if (direction === 'up' && currentIndex === 0) {
      // If at first year and going up, go to full range
      setIsInternalUpdate(true);
      setIsFullRange(true);
      setSelectedYear(null);
      onShowFullRange();
      return;
    }
    
    const newIndex = direction === 'up' 
      ? Math.max(0, currentIndex - 1)
      : Math.min(years.length - 1, currentIndex + 1);
    
    if (newIndex !== currentIndex && years[newIndex]) {
      setIsInternalUpdate(true);
      setSelectedYear(years[newIndex]);
      onYearSelect(years[newIndex]);
    }
  };

  if (years.length === 0) {
    return null;
  }

  // Calculate which years to show
  let visibleYears = [];
  let adjustedStartIndex = 0;
  
  if (isFullRange) {
    // In full range mode, show first few years after "All"
    visibleYears = years.slice(0, Math.min(visibleItems - 1, years.length));
    adjustedStartIndex = 0;
  } else {
    // In year mode, calculate normally but always leave room for "All" at top
    const selectedIndex = years.indexOf(selectedYear);
    const startIndex = Math.max(0, selectedIndex - centerIndex + 1); // +1 to leave room for "All"
    
    adjustedStartIndex = Math.max(0, Math.min(startIndex, years.length - visibleItems + 1));
    
    visibleYears = years.slice(adjustedStartIndex, adjustedStartIndex + visibleItems - 1);
  }
  
  // Position for the year picker
  const xPosition = dims.width - dims.width_controls + 40;
  const yPosition = 20;

  return (
    <g 
      transform={`translate(${xPosition}, ${yPosition})`}
      onWheel={handleWheel}
      style={{ cursor: 'pointer' }}
    >
      {/* Background for scroll area */}
      <rect
        x="-25"
        y="0"
        width="50"
        height={visibleItems * itemHeight}
        fill="transparent"
        stroke="none"
      />
      
      {/* Always render "All Years" option at the top */}
      <g key="all-years">
        {isFullRange && (
          <rect
            x="-20"
            y="2"
            width="40"
            height={itemHeight - 2}
            fill="rgba(255, 255, 255, 0.1)"
            rx="3"
            ry="3"
          />
        )}
        <text
          className="year-picker-item"
          x="0"
          y={itemHeight/2 + 4}
          textAnchor="middle"
          fontSize={isFullRange ? "12px" : "10px"}
          fontWeight={isFullRange ? "bold" : "normal"}
          fill="#ffffff"
          opacity={isFullRange ? 1 : 0.4}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            letterSpacing: '0.05em'
          }}
          onClick={handleFullRangeClick}
        >
          All
        </text>
      </g>
      
      {/* Render visible years, starting from position 1 */}
      {visibleYears.map((year, index) => {
        const actualIndex = index + 1; // Always offset by 1 to make room for "All"
        const isCenter = !isFullRange && year === selectedYear;
        const selectedIndex = years.indexOf(selectedYear);
        const distanceFromCenter = isFullRange ? 
          1 : Math.abs(adjustedStartIndex + index - selectedIndex);
        
        let fontSize = "10px";
        let opacity = 0.4;
        let fontWeight = "normal";
        
        if (isCenter) {
          fontSize = "12px";
          opacity = 1;
          fontWeight = "bold";
        } else if (!isFullRange && distanceFromCenter === 1) {
          fontSize = "11px";
          opacity = 0.7;
          fontWeight = "normal";
        } else if (!isFullRange && distanceFromCenter === 2) {
          fontSize = "10px";
          opacity = 0.5;
          fontWeight = "normal";
        }

        return (
          <g key={year}>
            {/* Background highlight for center year */}
            {isCenter && (
              <rect
                x="-20"
                y={actualIndex * itemHeight + 2}
                width="40"
                height={itemHeight - 2}
                fill="rgba(255, 255, 255, 0.1)"
                rx="3"
                ry="3"
              />
            )}
            
            {/* Year text */}
            <text
              className="year-picker-item"
              x="0"
              y={actualIndex * itemHeight + itemHeight/2 + 4}
              textAnchor="middle"
              fontSize={fontSize}
              fontWeight={fontWeight}
              fill="#ffffff"
              opacity={opacity}
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                letterSpacing: '0.05em'
              }}
              onClick={() => handleYearClick(year)}
            >
              {year}
            </text>
          </g>
        );
      })}
      
      {/* Scroll indicators */}
      {(!isFullRange && years.indexOf(selectedYear) > 0) && (
        <text
          x="0"
          y="-5"
          textAnchor="middle"
          fontSize="8px"
          fill="#666666"
          style={{ cursor: 'pointer' }}
          onClick={() => handleArrowClick('up')}
        >
          ↑
        </text>
      )}
      
      {(!isFullRange && years.indexOf(selectedYear) < years.length - 1) && (
        <text
          x="0"
          y={visibleItems * itemHeight + 15}
          textAnchor="middle"
          fontSize="8px"
          fill="#666666"
          style={{ cursor: 'pointer' }}
          onClick={() => handleArrowClick('down')}
        >
          ↓
        </text>
      )}
      
      {/* Show down arrow when in full range (can navigate to years) */}
      {isFullRange && years.length > 0 && (
        <text
          x="0"
          y={visibleItems * itemHeight + 15}
          textAnchor="middle"
          fontSize="8px"
          fill="#666666"
          style={{ cursor: 'pointer' }}
          onClick={() => handleArrowClick('down')}
        >
          ↓
        </text>
      )}
    </g>
  );
};

export default YearPicker; 