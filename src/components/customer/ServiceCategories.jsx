import React from 'react';
import { useBooking } from '../../context/BookingContext';
import { SERVICE_CATEGORIES } from '../../data/servicesData';
import { Grid, Scissors, Crown, Flower2, Heart } from 'lucide-react';

const iconMap = {
  Grid: Grid,
  Scissors: Scissors,
  Crown: Crown,
  Flower2: Flower2,
  Heart: Heart,
};

export const ServiceCategories = () => {
  const { selectedCategory, setSelectedCategory } = useBooking();

  return (
    <div className="py-2 overflow-x-auto no-scrollbar flex items-center justify-start sm:justify-center gap-2 sm:gap-2.5 px-2">
      {SERVICE_CATEGORIES.map((cat) => {
        const IconComponent = iconMap[cat.icon] || Grid;
        const isSelected = selectedCategory === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 ${
              isSelected
                ? 'bg-stone-900 text-white shadow-card ring-2 ring-stone-900'
                : 'bg-white hover:bg-stone-50 text-stone-700 border border-[#E8DFC8] shadow-soft'
            }`}
          >
            <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-[#E8C2A0]' : 'text-stone-400'}`} />
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
};
