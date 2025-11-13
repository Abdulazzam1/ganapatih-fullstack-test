// src/components/TimeAgo.tsx
import { formatDistanceToNow } from 'date-fns';

interface TimeAgoProps {
  timestamp: string; // Ini adalah tanggal ISO string dari backend
}

export default function TimeAgo({ timestamp }: TimeAgoProps) {
  let timeAgo = '';
  if (timestamp) {
    try {
      const date = new Date(timestamp);
      // formatDistanceToNow akan menghasilkan "about 5 minutes ago"
      timeAgo = formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      console.error("Invalid timestamp format:", timestamp, e);
      // Fallback jika format tanggal salah
      timeAgo = new Date(timestamp).toLocaleDateString();
    }
  }

  return (
    <span title={timestamp} className="text-sm text-gray-500">
      {timeAgo}
    </span>
  );
}