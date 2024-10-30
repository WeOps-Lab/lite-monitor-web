import { useSession } from 'next-auth/react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const useLocalizedTime = () => {
  const { data: session } = useSession();

  const convertToLocalizedTime = (isoString: string): string => {
    if (!session || !session.user || !session.zoneinfo) {
      return dayjs(isoString).format('YYYY-MM-DD HH:mm:ss');
    }

    const date = dayjs(isoString).tz(session.zoneinfo);
    return date.format('YYYY-MM-DD HH:mm:ss');
  };

  return {
    convertToLocalizedTime,
  };
};
