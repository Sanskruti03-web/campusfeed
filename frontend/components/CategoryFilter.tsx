'use client';

import { useRouter } from 'next/navigation';

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

const categories = [
  'All',
  'Academics',
  'Events',
  'Clubs',
  'Sports',
  'Placements',
  'General',
  'Announcements',
  'Food',
  'Hostel',
];

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const router = useRouter();

  const handleCategoryClick = (category: string) => {
    const newCategory = category === 'All' ? '' : category;
    onSelect(newCategory);
    if (newCategory) {
      router.push(`/?category=${encodeURIComponent(newCategory)}`);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleCategoryClick(category)}
          className={`category-pill whitespace-nowrap transition-all ${
            (category === 'All' && selected === '') || selected === category
              ? 'bg-[var(--color-highlight)] text-white'
              : ''
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
