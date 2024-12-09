import { ListItem } from '@/types';
import {
  LevelMap,
  UnitMap,
  StateMap,
  MonitorGroupMap,
  ObjectIconMap,
} from '@/types/monitor';
const FREQUENCY_LIST: ListItem[] = [
  { label: 'off', value: 0 },
  { label: '1m', value: 60000 },
  { label: '5m', value: 300000 },
  { label: '10m', value: 600000 },
];

const TIME_RANGE_LIST: ListItem[] = [
  { label: 'The past 15 minutes', value: 15 },
  { label: 'The past 30 minutes', value: 30 },
  { label: 'The past 1 hour', value: 60 },
  { label: 'The past 6 hours', value: 360 },
  { label: 'The past 12 hours', value: 720 },
  { label: 'The past 1 day', value: 1440 },
  { label: 'The past 7 days', value: 10080 },
  { label: 'The past 30 days', value: 43200 },
  { label: 'Custom', value: 0 },
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
        sortIndex: 0,
        displayDimension: [],
      },
      {
        indexId: 'load1',
        displayType: 'dashboard',
        sortIndex: 1,
        displayDimension: [],
        segments: [
          { value: 1, color: '#27C274' }, // 绿色区域
          { value: 2, color: '#FF9214' }, // 黄色区域
          { value: 4, color: '#D97007' }, // 黄色区域
          { value: 20, color: '#F43B2C' }, // 红色区域
        ],
      },
      {
        indexId: 'load5',
        displayType: 'dashboard',
        sortIndex: 2,
        displayDimension: [],
        segments: [
          { value: 1.5, color: '#27C274' }, // 绿色区域
          { value: 3, color: '#FF9214' }, // 黄色区域
          { value: 5, color: '#D97007' }, // 黄色区域
          { value: 20, color: '#F43B2C' }, // 红色区域
        ],
      },
      {
        indexId: 'disk.used',
        displayType: 'table',
        sortIndex: 3,
        displayDimension: ['Device', 'Value'],
      },
      {
        indexId: 'cpu_summary.usage',
        displayType: 'lineChart',
        sortIndex: 4,
        displayDimension: ['cpu'],
      },
      {
        indexId: 'disk.is_use',
        displayType: 'lineChart',
        sortIndex: 5,
        displayDimension: ['device '],
      },
      {
        indexId: 'mem.pct_usable',
        displayType: 'lineChart',
        sortIndex: 6,
        displayDimension: ['device '],
      },
      {
        indexId: 'io.util',
        displayType: 'lineChart',
        sortIndex: 7,
        displayDimension: ['device '],
      },
      {
        indexId: 'net.speed_sent',
        displayType: 'lineChart',
        sortIndex: 8,
        displayDimension: ['device '],
      },
      {
        indexId: 'net.speed_recv',
        displayType: 'lineChart',
        sortIndex: 9,
        displayDimension: ['device '],
      },
    ],
    tableDiaplay: [
      { type: 'progress', key: 'cpu_summary.usage' },
      { type: 'progress', key: 'mem.pct_usable' },
      { type: 'value', key: 'load5' },
    ],
  },
  {
    name: 'Website',
    id: 2,
    dashboardDisplay: [
      {
        indexId: 'http_success.rate',
        displayType: 'single',
        sortIndex: 11,
        displayDimension: [],
      },
      {
        indexId: 'http_total.duration',
        displayType: 'single',
        sortIndex: 12,
        displayDimension: [],
      },
      {
        indexId: 'http_ssl',
        displayType: 'single',
        sortIndex: 13,
        displayDimension: [],
      },
      {
        indexId: 'http_status_code',
        displayType: 'lineChart',
        sortIndex: 14,
        displayDimension: [],
      },
      {
        indexId: 'http_dns.lookup.time',
        displayType: 'lineChart',
        sortIndex: 15,
        displayDimension: [],
      },
    ],
    tableDiaplay: [
      {
        type: 'enum',
        key: 'http_success.rate',
        list: [
          {
            value: '1',
            label: 'Success',
          },
          {
            value: '0',
            label: 'Fail',
          },
        ],
      },
      { type: 'value', key: 'http_total.duration' },
    ],
  },
  {
    name: 'Pod',
    id: 3,
    dashboardDisplay: [
      {
        indexId: 'pod_status',
        displayType: 'single',
        sortIndex: 16,
        displayDimension: [],
      },
      {
        indexId: 'pod_cpu_utilization',
        displayType: 'lineChart',
        sortIndex: 17,
        displayDimension: [],
      },
      {
        indexId: 'pod_memory_utilization',
        displayType: 'lineChart',
        sortIndex: 18,
        displayDimension: [],
      },
      {
        indexId: 'pod_io_writes',
        displayType: 'lineChart',
        sortIndex: 19,
        displayDimension: [],
      },
      {
        indexId: 'pod_io_read',
        displayType: 'lineChart',
        sortIndex: 20,
        displayDimension: [],
      },
    ],
    tableDiaplay: [
      { type: 'value', key: 'pod_status' },
      { type: 'progress', key: 'pod_cpu_utilization' },
      { type: 'progress', key: 'pod_memory_utilization' },
    ],
  },
  {
    name: 'Node',
    id: 4,
    dashboardDisplay: [
      {
        indexId: 'node_status_condition',
        displayType: 'single',
        sortIndex: 21,
        displayDimension: [],
      },
      {
        indexId: 'node_cpu_load1',
        displayType: 'dashboard',
        sortIndex: 22,
        displayDimension: [],
        segments: [
          { value: 1, color: '#27C274' }, // 绿色区域
          { value: 2, color: '#FF9214' }, // 黄色区域
          { value: 4, color: '#D97007' }, // 黄色区域
          { value: 20, color: '#F43B2C' }, // 红色区域
        ],
      },
      {
        indexId: 'node_cpu_load5',
        displayType: 'dashboard',
        sortIndex: 23,
        displayDimension: [],
        segments: [
          { value: 1.5, color: '#27C274' }, // 绿色区域
          { value: 3, color: '#FF9214' }, // 黄色区域
          { value: 5, color: '#D97007' }, // 黄色区域
          { value: 20, color: '#F43B2C' }, // 红色区域
        ],
      },
      {
        indexId: 'node_cpu_utilization',
        displayType: 'lineChart',
        sortIndex: 24,
        displayDimension: [],
      },
      {
        indexId: 'node_app_memory_utilization',
        displayType: 'lineChart',
        sortIndex: 25,
        displayDimension: [],
      },
      {
        indexId: 'node_io_current',
        displayType: 'lineChart',
        sortIndex: 26,
        displayDimension: [],
      },
      {
        indexId: 'node_network_receive',
        displayType: 'lineChart',
        sortIndex: 27,
        displayDimension: [],
      },
      {
        indexId: 'node_network_transmit',
        displayType: 'lineChart',
        sortIndex: 28,
        displayDimension: [],
      },
    ],
    tableDiaplay: [
      { type: 'value', key: 'node_status_condition' },
      { type: 'progress', key: 'node_cpu_utilization' },
      { type: 'progress', key: 'node_app_memory_usage' },
    ],
  },
  {
    name: 'Cluster',
    id: 5,
    dashboardDisplay: [
      {
        indexId: 'cluster_pod_count',
        displayType: 'single',
        sortIndex: 29,
        displayDimension: [],
      },
      {
        indexId: 'cluster_node_count',
        displayType: 'single',
        sortIndex: 30,
        displayDimension: [],
      },
      {
        indexId: 'k8s_cluster',
        displayType: 'lineChart',
        sortIndex: 31,
        displayDimension: [],
      },
    ],
    tableDiaplay: [
      { type: 'value', key: 'cluster_pod_count' },
      { type: 'value', key: 'cluster_node_count' },
    ],
  },
  {
    name: 'Switch',
    id: 6,
    dashboardDisplay: [
      {
        indexId: 'sysUpTime',
        displayType: 'single',
        sortIndex: 32,
        displayDimension: [],
      },
      {
        indexId: 'iftotalInOctets',
        displayType: 'lineChart',
        sortIndex: 33,
        displayDimension: [],
      },
      {
        indexId: 'iftotalOutOctets',
        displayType: 'lineChart',
        sortIndex: 34,
        displayDimension: [],
      },
    ],
    tableDiaplay: [
      { type: 'value', key: 'sysUpTime' },
      { type: 'value', key: 'iftotalInOctets' },
      { type: 'value', key: 'iftotalOutOctets' },
    ],
  },
  {
    name: 'Loadbalance',
    id: 7,
    dashboardDisplay: [
      {
        indexId: 'sysUpTime',
        displayType: 'single',
        sortIndex: 35,
        displayDimension: [],
      },
      {
        indexId: 'iftotalInOctets',
        displayType: 'lineChart',
        sortIndex: 36,
        displayDimension: [],
      },
      {
        indexId: 'iftotalOutOctets',
        displayType: 'lineChart',
        sortIndex: 37,
        displayDimension: [],
      },
    ],
    tableDiaplay: [
      { type: 'value', key: 'sysUpTime' },
      { type: 'value', key: 'iftotalInOctets' },
      { type: 'value', key: 'iftotalOutOctets' },
    ],
  },
  {
    name: 'Router',
    id: 8,
    dashboardDisplay: [
      {
        indexId: 'sysUpTime',
        displayType: 'single',
        sortIndex: 38,
        displayDimension: [],
      },
      {
        indexId: 'iftotalInOctets',
        displayType: 'lineChart',
        sortIndex: 39,
        displayDimension: [],
      },
      {
        indexId: 'iftotalOutOctets',
        displayType: 'lineChart',
        sortIndex: 40,
        displayDimension: [],
      },
    ],
    tableDiaplay: [
      { type: 'value', key: 'sysUpTime' },
      { type: 'value', key: 'iftotalInOctets' },
      { type: 'value', key: 'iftotalOutOctets' },
    ],
  },
  {
    name: 'Firewall',
    id: 9,
    dashboardDisplay: [
      {
        indexId: 'sysUpTime',
        displayType: 'single',
        sortIndex: 41,
        displayDimension: [],
      },
      {
        indexId: 'iftotalInOctets',
        displayType: 'lineChart',
        sortIndex: 42,
        displayDimension: [],
      },
      {
        indexId: 'iftotalOutOctets',
        displayType: 'lineChart',
        sortIndex: 43,
        displayDimension: [],
      },
    ],
    tableDiaplay: [
      { type: 'value', key: 'sysUpTime' },
      { type: 'value', key: 'iftotalInOctets' },
      { type: 'value', key: 'iftotalOutOctets' },
    ],
  },
];

const METHOD_LIST: ListItem[] = [
  { label: 'SUM', value: 'sum' },
  { label: 'AVG', value: 'avg' },
  { label: 'MAX', value: 'max' },
  { label: 'MIN', value: 'min' },
  //   { label: 'NEW', value: 'new' },
];

const SCHEDULE_LIST: ListItem[] = [
  { label: 'Minute(s)', value: 'min' },
  { label: 'Hour(s)', value: 'hour' },
  { label: 'Day(s)', value: 'day' },
];

const SCHEDULE_UNIT_MAP: UnitMap = {
  minMin: 1,
  minMax: 59,
  hourMin: 1,
  hourMax: 23,
  dayMin: 1,
  dayMax: 1,
};

const PERIOD_LIST: ListItem[] = [
  { label: '1min', value: 60 },
  { label: '5min', value: 300 },
  { label: '15min', value: 900 },
  { label: '30min', value: 1800 },
  { label: '1hour', value: 3600 },
  { label: '6hour', value: 21600 },
  { label: '12hour', value: 43200 },
  { label: '24hour', value: 86400 },
];

const COMPARISON_METHOD: ListItem[] = [
  { label: '>', value: '>' },
  { label: '<', value: '<' },
  { label: '=', value: '=' },
  { label: '≠', value: '!=' },
  { label: '≥', value: '>=' },
  { label: '≤', value: '<=' },
];

const LEVEL_LIST: ListItem[] = [
  { label: 'Critical', value: 'critical' },
  { label: 'Error', value: 'error' },
  { label: 'Warning', value: 'warning' },
];

const MONITOR_GROUPS_MAP: MonitorGroupMap = {
  Host: {
    list: ['instance_id'],
    default: ['instance_id'],
  },
  Website: {
    list: ['instance_id'],
    // list: ['instance_id', 'instance_name', 'host'],
    default: ['instance_id'],
  },
  Cluster: {
    list: ['instance_id'],
    default: ['instance_id'],
  },
  Pod: {
    // list: ['instance_id', 'uid'],
    // default: ['instance_id', 'uid'],
    list: ['uid'],
    default: ['uid'],
  },
  Node: {
    // list: ['instance_id', 'node'],
    // default: ['instance_id', 'node'],
    list: ['node'],
    default: ['node'],
  },
  Switch: {
    list: ['instance_id'],
    default: ['instance_id'],
  },
  Router: {
    list: ['instance_id'],
    default: ['instance_id'],
  },
  Loadbalance: {
    list: ['instance_id'],
    default: ['instance_id'],
  },
  Firewall: {
    list: ['instance_id'],
    default: ['instance_id'],
  },
};

const LEVEL_MAP: LevelMap = {
  critical: '#F43B2C',
  error: '#D97007',
  warning: '#FFAD42',
};

const STATE_MAP: StateMap = {
  new: 'New',
  recovery: 'Recovery',
  closed: 'Closed',
};

const OBJECT_ICON_MAP: ObjectIconMap = {
  Host: 'Host',
  Website: 'Website',
  Cluster: 'K8S',
  Router: 'Router',
  Switch: 'Switch',
  Firewall: 'Firewall',
  Loadbalance: 'Loadbalance',
};

export {
  FREQUENCY_LIST,
  CONDITION_LIST,
  UNIT_LIST,
  INDEX_CONFIG,
  TIME_RANGE_LIST,
  METHOD_LIST,
  SCHEDULE_LIST,
  PERIOD_LIST,
  COMPARISON_METHOD,
  LEVEL_MAP,
  LEVEL_LIST,
  SCHEDULE_UNIT_MAP,
  STATE_MAP,
  MONITOR_GROUPS_MAP,
  OBJECT_ICON_MAP,
};
