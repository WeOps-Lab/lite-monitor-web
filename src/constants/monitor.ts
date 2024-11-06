import { ListItem } from '@/types';
const FREQUENCY_LIST: ListItem[] = [
  { label: 'off', value: 0 },
  { label: '1m', value: 60000 },
  { label: '5m', value: 300000 },
  { label: '10m', value: 600000 },
];

const CONDITION_LIST: ListItem[] = [
  { id: '=', name: '=' },
  { id: '!=', name: '!=' },
  { id: '=~', name: 'include' },
  { id: '!~', name: 'exclude' },
];

export { FREQUENCY_LIST, CONDITION_LIST };
