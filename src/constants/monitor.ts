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

const UNIT_LIST = [
  {
    label: 'Misc',
    children: [
      { label: 'none', value: 'none' },
      {
        label: 'short',
        value: 'short',
      },
      { label: 'percent (0-100)', value: 'percent' },
      { label: 'percent (0.0-1.0)', value: 'percentunit' },
    ],
  },
  {
    label: 'Data (IEC)',
    children: [
      { label: 'bits', value: 'bits' },
      { label: 'bytes', value: 'bytes' },
      { label: 'kibibytes', value: 'kbytes' },
      { label: 'mebibytes', value: 'mbytes' },
      { label: 'gibibytes', value: 'gbytes' },
      { label: 'tebibytes', value: 'tbytes' },
      { label: 'pebibytes', value: 'pbytes' },
    ],
  },
  {
    label: 'Data (Metric)',
    children: [
      { label: 'bits', value: 'decbits' },
      { label: 'bytes', value: 'decbytes' },
      { label: 'kilobytes', value: 'deckbytes' },
      { label: 'megabytes', value: 'decmbytes' },
      { label: 'gigabytes', value: 'decgbytes' },
      { label: 'terabytes', value: 'dectbytes' },
      { label: 'petabytes', value: 'decpbytes' },
    ],
  },
  {
    label: 'Data Rate',
    children: [
      { label: 'packets/sec', value: 'pps' },
      { label: 'bits/sec', value: 'bps' },
      { label: 'bytes/sec', value: 'Bps' },
      { label: 'kilobytes/sec', value: 'KBs' },
      { label: 'kilobits/sec', value: 'Kbits' },
      { label: 'megabytes/sec', value: 'MBs' },
      { label: 'megabits/sec', value: 'Mbits' },
      { label: 'gigabytes/sec', value: 'GBs' },
      { label: 'gigabits/sec', value: 'Gbits' },
      { label: 'terabytes/sec', value: 'TBs' },
      { label: 'terabits/sec', value: 'Tbits' },
      { label: 'petabytes/sec', value: 'PBs' },
      { label: 'petabits/sec', value: 'Pbits' },
    ],
  },
  {
    label: 'Temperature',
    children: [
      { label: 'Celsius (°C)', value: 'celsius' },
      { label: 'Fahrenheit (°F)', value: 'fahrenheit' },
      { label: 'Kelvin (K)', value: 'kelvin' },
    ],
  },
  {
    label: 'Time',
    children: [
      { label: 'Hertz (1/s)', value: 'hertz' },
      { label: 'nanoseconds (ns)', value: 'ns' },
      { label: 'microseconds (µs)', value: 'µs' },
      { label: 'milliseconds (ms)', value: 'ms' },
      { label: 'seconds (s)', value: 's' },
      { label: 'minutes (m)', value: 'm' },
      { label: 'hours (h)', value: 'h' },
      { label: 'days (d)', value: 'd' },
    ],
  },
  {
    label: 'Throughput',
    children: [
      { label: 'counts/sec (cps)', value: 'cps' },
      { label: 'ops/sec (ops)', value: 'ops' },
      { label: 'requests/sec (rps)', value: 'reqps' },
      { label: 'reads/sec (rps)', value: 'rps' },
      { label: 'writes/sec (wps)', value: 'wps' },
      { label: 'I/O ops/sec (iops)', value: 'iops' },
      { label: 'counts/min (cpm)', value: 'cpm' },
      { label: 'ops/min (opm)', value: 'opm' },
      { label: 'reads/min (rpm)', value: 'rpm' },
      { label: 'writes/min (wpm)', value: 'wpm' },
    ],
  },
];

export { FREQUENCY_LIST, CONDITION_LIST, UNIT_LIST };
