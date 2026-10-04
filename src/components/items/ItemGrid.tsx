import { Link } from 'react-router';
import type { Item } from '../../db/types';
import { ItemThumb } from './ItemThumb';

export function ItemGrid({ items }: { items: Item[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {items.map((item) => (
        <li key={item.id}>
          <Link to={`/closet/${item.id}`} className="tap block">
            <ItemThumb item={item} />
            <p className="mt-1.5 truncate px-1 text-sm">{item.name}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
