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
      { label: 'none', value: 'none', unit: '' },
      {
        label: 'short',
        value: 'short',
        unit: '',
      },
      { label: 'percent (0-100)', value: 'percent', unit: '%' },
      { label: 'percent (0.0-1.0)', value: 'percentunit', unit: '%' },
    ],
  },
  {
    label: 'Data (IEC)',
    children: [
      { label: 'bits', value: 'bits', unit: 'b' },
      { label: 'bytes', value: 'bytes', unit: 'B' },
      { label: 'kibibytes', value: 'kbytes', unit: 'KiB' },
      { label: 'mebibytes', value: 'mbytes', unit: 'MiB' },
      { label: 'gibibytes', value: 'gbytes', unit: 'GiB' },
      { label: 'tebibytes', value: 'tbytes', unit: 'TiB' },
      { label: 'pebibytes', value: 'pbytes', unit: 'PiB' },
    ],
  },
  {
    label: 'Data (Metric)',
    children: [
      { label: 'bits', value: 'decbits', unit: 'b' },
      { label: 'bytes', value: 'decbytes', unit: 'B' },
      { label: 'kilobytes', value: 'deckbytes', unit: 'KB' },
      { label: 'megabytes', value: 'decmbytes', unit: 'MB' },
      { label: 'gigabytes', value: 'decgbytes', unit: 'GB' },
      { label: 'terabytes', value: 'dectbytes', unit: 'TB' },
      { label: 'petabytes', value: 'decpbytes', unit: 'PB' },
    ],
  },
  {
    label: 'Data Rate',
    children: [
      { label: 'packets/sec', value: 'pps', unit: 'p/s' },
      { label: 'bits/sec', value: 'bps', unit: 'b/s' },
      { label: 'bytes/sec', value: 'Bps', unit: 'B/s' },
      { label: 'kilobytes/sec', value: 'KBs', unit: 'KB/s' },
      { label: 'kilobits/sec', value: 'Kbits', unit: 'Kb/s' },
      { label: 'megabytes/sec', value: 'MBs', unit: 'MB/s' },
      { label: 'megabits/sec', value: 'Mbits', unit: 'Mb/s' },
      { label: 'gigabytes/sec', value: 'GBs', unit: 'GB/s' },
      { label: 'gigabits/sec', value: 'Gbits', unit: 'Gb/s' },
      { label: 'terabytes/sec', value: 'TBs', unit: 'TB/s' },
      { label: 'terabits/sec', value: 'Tbits', unit: 'Tb/s' },
      { label: 'petabytes/sec', value: 'PBs', unit: 'PB/s' },
      { label: 'petabits/sec', value: 'Pbits', unit: 'Pb/s' },
    ],
  },
  {
    label: 'Temperature',
    children: [
      { label: 'Celsius (°C)', value: 'celsius', unit: '°C' },
      { label: 'Fahrenheit (°F)', value: 'fahrenheit', unit: '°F' },
      { label: 'Kelvin (K)', value: 'kelvin', unit: 'K' },
    ],
  },
  {
    label: 'Time',
    children: [
      { label: 'Hertz (1/s)', value: 'hertz', unit: 'hz' },
      { label: 'nanoseconds (ns)', value: 'ns', unit: 'ns' },
      { label: 'microseconds (µs)', value: 'µs', unit: 'µs' },
      { label: 'milliseconds (ms)', value: 'ms', unit: 'ms' },
      { label: 'seconds (s)', value: 's', unit: 's' },
      { label: 'minutes (m)', value: 'm', unit: 'min' },
      { label: 'hours (h)', value: 'h', unit: 'hour' },
      { label: 'days (d)', value: 'd', unit: 'day' },
    ],
  },
  {
    label: 'Throughput',
    children: [
      { label: 'counts/sec (cps)', value: 'cps', unit: 'cps' },
      { label: 'ops/sec (ops)', value: 'ops', unit: 'ops' },
      { label: 'requests/sec (rps)', value: 'reqps', unit: 'reqps' },
      { label: 'reads/sec (rps)', value: 'rps', unit: 'rps' },
      { label: 'writes/sec (wps)', value: 'wps', unit: 'wps' },
      { label: 'I/O ops/sec (iops)', value: 'iops', unit: 'iops' },
      { label: 'counts/min (cpm)', value: 'cpm', unit: 'cpm' },
      { label: 'ops/min (opm)', value: 'opm', unit: 'opm' },
      { label: 'reads/min (rpm)', value: 'rpm', unit: 'rpm' },
      { label: 'writes/min (wpm)', value: 'wpm', unit: 'wpm' },
    ],
  },
];

const INDEX_CONFIG = [
  {
    name: 'Host',
    id: 1,
    dashboardDisplay: [
      {
        indexId: 'env.procs',
        displayType: 'single',
        displayDimension: [],
      },
      {
        indexId: 'load1',
        displayType: 'dashboard',
        displayDimension: [],
      },
      {
        indexId: 'load5',
        displayType: 'dashboard',
        displayDimension: [],
      },
      {
        indexId: 'disk.used',
        displayType: 'table',
        displayDimension: ['device'],
      },
      {
        indexId: 'cpu_summary.usage',
        displayType: 'lineChart',
        displayDimension: ['cpu'],
      },
      {
        indexId: 'disk.is_use',
        displayType: 'lineChart',
        displayDimension: ['device '],
      },
      {
        indexId: 'mem.pct_usable',
        displayType: 'lineChart',
        displayDimension: ['device '],
      },
      {
        indexId: 'io.util',
        displayType: 'lineChart',
        displayDimension: ['device '],
      },
      {
        indexId: 'net.speed_sent',
        displayType: 'lineChart',
        displayDimension: ['device '],
      },
      {
        indexId: 'net.speed_recv',
        displayType: 'lineChart',
        displayDimension: ['device '],
      },
    ],
    tableDiaplay: ['cpu_summary.usage', 'mem.pct_usable', 'load5'],
  },
  {
    name: 'HTTP',
    id: 2,
    dashboardDisplay: [
      {
        indexId: 'http_success.rate',
        displayType: 'single',
        displayDimension: [],
      },
      {
        indexId: 'http_total.duration',
        displayType: 'single',
        displayDimension: [],
      },
      {
        indexId: 'http_ssl',
        displayType: 'single',
        displayDimension: [],
      },
      {
        indexId: 'http_status_code',
        displayType: 'lineChart',
        displayDimension: [],
      },
      {
        indexId: 'http_dns.lookup.time',
        displayType: 'lineChart',
        displayDimension: [],
      },
    ],
    tableDiaplay: ['http_success.rate', 'http_total.duration'],
  },
];

export { FREQUENCY_LIST, CONDITION_LIST, UNIT_LIST, INDEX_CONFIG };
