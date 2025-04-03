import { useState } from "react";
import { cn } from "@/lib/utils";

interface RatingScaleProps {
  value: number | null;
  onChange: (value: number) => void;
  maxValue?: number;
}

export default function RatingScale({ 
  value, 
  onChange, 
  maxValue = 5 
}: RatingScaleProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  
  const handleMouseEnter = (rating: number) => {
    setHoveredValue(rating);
  };
  
  const handleMouseLeave = () => {
    setHoveredValue(null);
  };
  
  const getButtonClassName = (rating: number) => {
    const isActive = 
      (hoveredValue !== null && rating <= hoveredValue) || 
      (hoveredValue === null && value !== null && rating <= value);
    
    return cn(
      "w-8 h-8 rounded-full border-2 flex items-center justify-center",
      isActive 
        ? "border-indigo-500 text-indigo-600 font-medium" 
        : "border-gray-300 hover:border-indigo-500 text-gray-700"
    );
  };
  
  return (
    <div className="flex space-x-1" onMouseLeave={handleMouseLeave}>
      {Array.from({ length: maxValue }, (_, i) => i + 1).map((rating) => (
        <button
          key={rating}
          type="button"
          className={getButtonClassName(rating)}
          onClick={() => onChange(rating)}
          onMouseEnter={() => handleMouseEnter(rating)}
        >
          {rating}
        </button>
      ))}
    </div>
  );
}
