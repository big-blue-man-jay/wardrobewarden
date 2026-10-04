import { Link } from 'react-router';
import type { Item } from '../../db/types';
import { HeartIcon } from '../ui/icons';
import { ItemThumb } from './ItemThumb';

export function ItemGrid({ items }: { items: Item[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {items.map((item) => (
        <li key={item.id} className="animate-page">
          <Link to={`/closet/${item.id}`} className="tap relative block">
            <ItemThumb item={item} />
            {item.favorite && (
              <HeartIcon filled size={18} className="absolute top-2.5 right-2.5 text-accent" aria-label="Favorite" />
            )}
            <p className="mt-1.5 truncate px-1 text-sm">{item.name}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
