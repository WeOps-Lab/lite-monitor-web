import { useTranslation } from '@/utils/i18n';
import { useMemo } from 'react';
import { ListItem } from '@/types';
import {
  LevelMap,
  UnitMap,
  StateMap,
  MonitorGroupMap,
  ObjectIconMap,
} from '@/types/monitor';

const useFrequencyList = (): ListItem[] => {
  const { t } = useTranslation();
  return useMemo(
    () => [
      { label: t('common.timeSelector.off'), value: 0 },
      { label: '1m', value: 60000 },
      { label: '5m', value: 300000 },
      { label: '10m', value: 600000 },
    ],
    [t]
  );
};

const useTimeRangeList = (): ListItem[] => {
  const { t } = useTranslation();
  return useMemo(
    () => [
      { label: t('common.timeSelector.15Minutes'), value: 15 },
      { label: t('common.timeSelector.30Minutes'), value: 30 },
      { label: t('common.timeSelector.1Hour'), value: 60 },
      { label: t('common.timeSelector.6Hours'), value: 360 },
      { label: t('common.timeSelector.12Hours'), value: 720 },
      { label: t('common.timeSelector.1Day'), value: 1440 },
      { label: t('common.timeSelector.7Days'), value: 10080 },
      { label: t('common.timeSelector.30Days'), value: 43200 },
      { label: t('common.timeSelector.custom'), value: 0 },
    ],
    [t]
  );
};

const useConditionList = (): ListItem[] => {
  const { t } = useTranslation();
  return useMemo(
    () => [
      { id: '=', name: '=' },
      { id: '!=', name: '!=' },
      { id: '=~', name: t('monitor.include') },
      { id: '!~', name: t('monitor.exclude') },
    ],
    [t]
  );
};

const useKeyMetricLabelMap = (): ObjectIconMap => {
  const { t } = useTranslation();
  return useMemo(
    () => ({
      'cpu_summary.usage': t('monitor.views.cpu_summary.usage'),
      'mem.pct_usable': t('monitor.views.mem.pct_usable'),
      load5: t('monitor.views.load5'),
      sysUpTime: t('monitor.views.sysUpTime'),
      iftotalInOctets: t('monitor.views.iftotalInOctets'),
      iftotalOutOctets: t('monitor.views.iftotalOutOctets'),
      'http_success.rate': t('monitor.views.http_success.rate'),
      'http_total.duration': t('monitor.views.http_total.duration'),
      pod_status: t('monitor.views.pod_status'),
      pod_cpu_utilization: t('monitor.views.pod_cpu_utilization'),
      pod_memory_utilization: t('monitor.views.pod_memory_utilization'),
      node_status_condition: t('monitor.views.node_status_condition'),
      node_cpu_utilization: t('monitor.views.node_cpu_utilization'),
      node_memory_utilization: t('monitor.views.node_memory_utilization'),
      cluster_pod_count: t('monitor.views.cluster_pod_count'),
      cluster_node_count: t('monitor.views.cluster_node_count'),
    }),
    [t]
  );
};

const useStateMap = (): StateMap => {
  const { t } = useTranslation();
  return useMemo(
    () => ({
      new: t('monitor.events.new'),
      recovered: t('monitor.events.recovery'),
      closed: t('monitor.events.closed'),
    }),
    [t]
  );
};

const useLevelList = (): ListItem[] => {
  const { t } = useTranslation();
  return useMemo(
    () => [
      { label: t('monitor.events.critical'), value: 'critical' },
      { label: t('monitor.events.error'), value: 'error' },
      { label: t('monitor.events.warning'), value: 'warning' },
    ],
    [t]
  );
};

const useMethodList = (): ListItem[] => {
  const { t } = useTranslation();
  return useMemo(
    () => [
      { label: t('monitor.events.sum'), value: 'sum' },
      { label: t('monitor.events.avg'), value: 'avg' },
      { label: t('monitor.events.max'), value: 'max' },
      { label: t('monitor.events.min'), value: 'min' },
      { label: t('monitor.events.newValue'), value: 'new' },
    ],
    [t]
  );
};

const useScheduleList = (): ListItem[] => {
  const { t } = useTranslation();
  return useMemo(
    () => [
      { label: t('monitor.events.minutes'), value: 'min' },
      { label: t('monitor.events.hours'), value: 'hour' },
      { label: t('monitor.events.days'), value: 'day' },
    ],
    [t]
  );
};

const useInterfaceLabelMap = (): ObjectIconMap => {
  const { t } = useTranslation();
  return useMemo(
    () => ({
      interface: t('monitor.views.interface'),
      ifOperStatus: t('monitor.views.ifOperStatus'),
      ifHighSpeed: t('monitor.views.ifHighSpeed'),
      ifInErrors: t('monitor.views.ifInErrors'),
      ifOutErrors: t('monitor.views.ifOutErrors'),
      ifInUcastPkts: t('monitor.views.ifInUcastPkts'),
      ifOutUcastPkts: t('monitor.views.ifOutUcastPkts'),
      ifInOctets: t('monitor.views.ifInOctets'),
      ifOutOctets: t('monitor.views.ifOutOctets'),
    }),
    [t]
  );
};

const LEVEL_MAP: LevelMap = {
  critical: '#F43B2C',
  error: '#D97007',
  warning: '#FFAD42',
};

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
        style: {
          height: '200px',
          width: '15%',
        },
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
        style: {
          height: '200px',
          width: '15%',
        },
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
        style: {
          height: '200px',
          width: '15%',
        },
      },
      {
        indexId: 'disk.used',
        displayType: 'table',
        sortIndex: 3,
        displayDimension: ['Device', 'Value'],
        style: {
          height: '200px',
          width: '48%',
        },
      },
      {
        indexId: 'cpu_summary.usage',
        displayType: 'lineChart',
        sortIndex: 4,
        displayDimension: ['cpu'],
        style: {
          height: '200px',
          width: '32%',
        },
      },
      {
        indexId: 'disk.is_use',
        displayType: 'lineChart',
        sortIndex: 5,
        displayDimension: ['device '],
        style: {
          height: '200px',
          width: '32%',
        },
      },
      {
        indexId: 'mem.pct_usable',
        displayType: 'lineChart',
        sortIndex: 6,
        displayDimension: ['device '],
        style: {
          height: '200px',
          width: '32%',
        },
      },
      {
        indexId: 'io.util',
        displayType: 'lineChart',
        sortIndex: 7,
        displayDimension: ['device '],
        style: {
          height: '200px',
          width: '32%',
        },
      },
      {
        indexId: 'net.speed_sent',
        displayType: 'lineChart',
        sortIndex: 8,
        displayDimension: ['device '],
        style: {
          height: '200px',
          width: '32%',
        },
      },
      {
        indexId: 'net.speed_recv',
        displayType: 'lineChart',
        sortIndex: 9,
        displayDimension: ['device '],
        style: {
          height: '200px',
          width: '32%',
        },
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
        sortIndex: 0,
        displayDimension: [],
        style: {
          height: '200px',
          width: '15%',
        },
      },
      {
        indexId: 'http_total.duration',
        displayType: 'single',
        sortIndex: 1,
        displayDimension: [],
        style: {
          height: '200px',
          width: '15%',
        },
      },
      {
        indexId: 'http_ssl',
        displayType: 'single',
        sortIndex: 2,
        displayDimension: [],
        style: {
          height: '200px',
          width: '15%',
        },
      },
      {
        indexId: 'http_status_code',
        displayType: 'lineChart',
        sortIndex: 3,
        displayDimension: [],
        style: {
          height: '200px',
          width: '48%',
        },
      },
      {
        indexId: 'http_dns.lookup.time',
        displayType: 'lineChart',
        sortIndex: 4,
        displayDimension: [],
        style: {
          height: '200px',
          width: '48%',
        },
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
        sortIndex: 0,
        displayDimension: [],
        style: {
          height: '200px',
          width: '15%',
        },
      },
      {
        indexId: 'pod_cpu_utilization',
        displayType: 'lineChart',
        sortIndex: 1,
        displayDimension: [],
        style: {
          height: '200px',
          width: '32%',
        },
      },
      {
        indexId: 'pod_memory_utilization',
        displayType: 'lineChart',
        sortIndex: 2,
        displayDimension: [],
        style: {
          height: '200px',
          width: '32%',
        },
      },
      {
        indexId: 'pod_io_writes',
        displayType: 'lineChart',
        sortIndex: 3,
        displayDimension: [],
        style: {
          height: '200px',
          width: '32%',
        },
      },
      {
        indexId: 'pod_io_read',
        displayType: 'lineChart',
        sortIndex: 4,
        displayDimension: [],
        style: {
          height: '200px',
          width: '32%',
        },
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
        sortIndex: 0,
        displayDimension: [],
        style: {
          height: '200px',
          width: '15%',
        },
      },
      {
        indexId: 'node_cpu_load1',
        displayType: 'dashboard',
        sortIndex: 1,
        displayDimension: [],
        segments: [
          { value: 1, color: '#27C274' }, // 绿色区域
          { value: 2, color: '#FF9214' }, // 黄色区域
          { value: 4, color: '#D97007' }, // 黄色区域
          { value: 20, color: '#F43B2C' }, // 红色区域
        ],
        style: {
          height: '200px',
          width: '15%',
        },
      },
      {
        indexId: 'node_cpu_load5',
        displayType: 'dashboard',
        sortIndex: 2,
        displayDimension: [],
        segments: [
          { value: 1.5, color: '#27C274' }, // 绿色区域
          { value: 3, color: '#FF9214' }, // 黄色区域
          { value: 5, color: '#D97007' }, // 黄色区域
          { value: 20, color: '#F43B2C' }, // 红色区域
        ],
        style: {
          height: '200px',
          width: '15%',
        },
      },
      {
        indexId: 'node_cpu_utilization',
        displayType: 'lineChart',
        sortIndex: 3,
        displayDimension: [],
        style: {
          height: '200px',
          width: '32%',
        },
      },
      {
        indexId: 'node_app_memory_utilization',
        displayType: 'lineChart',
        sortIndex: 4,
        displayDimension: [],
        style: {
          height: '200px',
          width: '32%',
        },
      },
      {
        indexId: 'node_io_current',
        displayType: 'lineChart',
        sortIndex: 5,
        displayDimension: [],
        style: {
          height: '200px',
          width: '32%',
        },
      },
      {
        indexId: 'node_network_receive',
        displayType: 'lineChart',
        sortIndex: 6,
        displayDimension: [],
        style: {
          height: '200px',
          width: '32%',
        },
      },
      {
        indexId: 'node_network_transmit',
        displayType: 'lineChart',
        sortIndex: 7,
        displayDimension: [],
        style: {
          height: '200px',
          width: '32%',
        },
      },
    ],
    tableDiaplay: [
      { type: 'value', key: 'node_status_condition' },
      { type: 'progress', key: 'node_cpu_utilization' },
      { type: 'progress', key: 'node_memory_utilization' },
    ],
  },
  {
    name: 'Cluster',
    id: 5,
    dashboardDisplay: [
      {
        indexId: 'cluster_pod_count',
        displayType: 'single',
        sortIndex: 0,
        displayDimension: [],
        style: {
          height: '200px',
          width: '15%',
        },
      },
      {
        indexId: 'cluster_node_count',
        displayType: 'single',
        sortIndex: 1,
        displayDimension: [],
        style: {
          height: '200px',
          width: '15%',
        },
      },
      {
        indexId: 'k8s_cluster',
        displayType: 'lineChart',
        sortIndex: 2,
        displayDimension: [],
        style: {
          height: '200px',
          width: '32%',
        },
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
        sortIndex: 0,
        displayDimension: [],
        style: {
          height: '200px',
          width: '15%',
        },
      },
      {
        indexId: 'iftotalInOctets',
        displayType: 'lineChart',
        sortIndex: 1,
        displayDimension: [],
        style: {
          height: '200px',
          width: '40%',
        },
      },
      {
        indexId: 'iftotalOutOctets',
        displayType: 'lineChart',
        sortIndex: 2,
        displayDimension: [],
        style: {
          height: '200px',
          width: '40%',
        },
      },
      {
        indexId: 'interfaces',
        displayType: 'multipleIndexsTable',
        sortIndex: 3,
        displayDimension: [
          'ifOperStatus',
          'ifHighSpeed',
          'ifInErrors',
          'ifOutErrors',
          'ifInUcastPkts',
          'ifOutUcastPkts',
          'ifInOctets',
          'ifOutOctets',
        ],
        style: {
          height: '400px',
          width: '100%',
        },
      },
    ],
    tableDiaplay: [
      { type: 'value', key: 'iftotalInOctets' },
      { type: 'value', key: 'iftotalOutOctets' },
      { type: 'value', key: 'sysUpTime' },
    ],
  },
  {
    name: 'Loadbalance',
    id: 7,
    dashboardDisplay: [
      {
        indexId: 'sysUpTime',
        displayType: 'single',
        sortIndex: 0,
        displayDimension: [],
        style: {
          height: '200px',
          width: '15%',
        },
      },
      {
        indexId: 'iftotalInOctets',
        displayType: 'lineChart',
        sortIndex: 1,
        displayDimension: [],
        style: {
          height: '200px',
          width: '40%',
        },
      },
      {
        indexId: 'iftotalOutOctets',
        displayType: 'lineChart',
        sortIndex: 2,
        displayDimension: [],
        style: {
          height: '200px',
          width: '40%',
        },
      },
      {
        indexId: 'interfaces',
        displayType: 'multipleIndexsTable',
        sortIndex: 3,
        displayDimension: [
          'ifOperStatus',
          'ifHighSpeed',
          'ifInErrors',
          'ifOutErrors',
          'ifInUcastPkts',
          'ifOutUcastPkts',
          'ifInOctets',
          'ifOutOctets',
        ],
        style: {
          height: '400px',
          width: '100%',
        },
      },
    ],
    tableDiaplay: [
      { type: 'value', key: 'iftotalInOctets' },
      { type: 'value', key: 'iftotalOutOctets' },
      { type: 'value', key: 'sysUpTime' },
    ],
  },
  {
    name: 'Router',
    id: 8,
    dashboardDisplay: [
      {
        indexId: 'sysUpTime',
        displayType: 'single',
        sortIndex: 0,
        displayDimension: [],
        style: {
          height: '200px',
          width: '15%',
        },
      },
      {
        indexId: 'iftotalInOctets',
        displayType: 'lineChart',
        sortIndex: 1,
        displayDimension: [],
        style: {
          height: '200px',
          width: '40%',
        },
      },
      {
        indexId: 'iftotalOutOctets',
        displayType: 'lineChart',
        sortIndex: 2,
        displayDimension: [],
        style: {
          height: '200px',
          width: '40%',
        },
      },
      {
        indexId: 'interfaces',
        displayType: 'multipleIndexsTable',
        sortIndex: 3,
        displayDimension: [
          'ifOperStatus',
          'ifHighSpeed',
          'ifInErrors',
          'ifOutErrors',
          'ifInUcastPkts',
          'ifOutUcastPkts',
          'ifInOctets',
          'ifOutOctets',
        ],
        style: {
          height: '400px',
          width: '100%',
        },
      },
    ],
    tableDiaplay: [
      { type: 'value', key: 'iftotalInOctets' },
      { type: 'value', key: 'iftotalOutOctets' },
      { type: 'value', key: 'sysUpTime' },
    ],
  },
  {
    name: 'Firewall',
    id: 9,
    dashboardDisplay: [
      {
        indexId: 'sysUpTime',
        displayType: 'single',
        sortIndex: 0,
        displayDimension: [],
        style: {
          height: '200px',
          width: '15%',
        },
      },
      {
        indexId: 'iftotalInOctets',
        displayType: 'lineChart',
        sortIndex: 1,
        displayDimension: [],
        style: {
          height: '200px',
          width: '40%',
        },
      },
      {
        indexId: 'iftotalOutOctets',
        displayType: 'lineChart',
        sortIndex: 2,
        displayDimension: [],
        style: {
          height: '200px',
          width: '40%',
        },
      },
      {
        indexId: 'interfaces',
        displayType: 'multipleIndexsTable',
        sortIndex: 3,
        displayDimension: [
          'ifOperStatus',
          'ifHighSpeed',
          'ifInErrors',
          'ifOutErrors',
          'ifInUcastPkts',
          'ifOutUcastPkts',
          'ifInOctets',
          'ifOutOctets',
        ],
        style: {
          height: '400px',
          width: '100%',
        },
      },
    ],
    tableDiaplay: [
      { type: 'value', key: 'iftotalInOctets' },
      { type: 'value', key: 'iftotalOutOctets' },
      { type: 'value', key: 'sysUpTime' },
    ],
  },
  {
    name: 'Detection Device',
    id: 10,
    dashboardDisplay: [
      {
        indexId: 'sysUpTime',
        displayType: 'single',
        sortIndex: 0,
        displayDimension: [],
        style: {
          height: '200px',
          width: '15%',
        },
      },
      {
        indexId: 'iftotalInOctets',
        displayType: 'lineChart',
        sortIndex: 1,
        displayDimension: [],
        style: {
          height: '200px',
          width: '40%',
        },
      },
      {
        indexId: 'iftotalOutOctets',
        displayType: 'lineChart',
        sortIndex: 2,
        displayDimension: [],
        style: {
          height: '200px',
          width: '40%',
        },
      },
      {
        indexId: 'interfaces',
        displayType: 'multipleIndexsTable',
        sortIndex: 3,
        displayDimension: [
          'ifOperStatus',
          'ifHighSpeed',
          'ifInErrors',
          'ifOutErrors',
          'ifInUcastPkts',
          'ifOutUcastPkts',
          'ifInOctets',
          'ifOutOctets',
        ],
        style: {
          height: '400px',
          width: '100%',
        },
      },
    ],
    tableDiaplay: [
      { type: 'value', key: 'iftotalInOctets' },
      { type: 'value', key: 'iftotalOutOctets' },
      { type: 'value', key: 'sysUpTime' },
    ],
  },
  {
    name: 'Bastion Host',
    id: 12,
    dashboardDisplay: [
      {
        indexId: 'sysUpTime',
        displayType: 'single',
        sortIndex: 0,
        displayDimension: [],
        style: {
          height: '200px',
          width: '15%',
        },
      },
      {
        indexId: 'iftotalInOctets',
        displayType: 'lineChart',
        sortIndex: 1,
        displayDimension: [],
        style: {
          height: '200px',
          width: '40%',
        },
      },
      {
        indexId: 'iftotalOutOctets',
        displayType: 'lineChart',
        sortIndex: 2,
        displayDimension: [],
        style: {
          height: '200px',
          width: '40%',
        },
      },
      {
        indexId: 'interfaces',
        displayType: 'multipleIndexsTable',
        sortIndex: 3,
        displayDimension: [
          'ifOperStatus',
          'ifHighSpeed',
          'ifInErrors',
          'ifOutErrors',
          'ifInUcastPkts',
          'ifOutUcastPkts',
          'ifInOctets',
          'ifOutOctets',
        ],
        style: {
          height: '400px',
          width: '100%',
        },
      },
    ],
    tableDiaplay: [
      { type: 'value', key: 'iftotalInOctets' },
      { type: 'value', key: 'iftotalOutOctets' },
      { type: 'value', key: 'sysUpTime' },
    ],
  },
  {
    name: 'Scanning Device',
    id: 13,
    dashboardDisplay: [
      {
        indexId: 'sysUpTime',
        displayType: 'single',
        sortIndex: 0,
        displayDimension: [],
        style: {
          height: '200px',
          width: '15%',
        },
      },
      {
        indexId: 'iftotalInOctets',
        displayType: 'lineChart',
        sortIndex: 1,
        displayDimension: [],
        style: {
          height: '200px',
          width: '40%',
        },
      },
      {
        indexId: 'iftotalOutOctets',
        displayType: 'lineChart',
        sortIndex: 2,
        displayDimension: [],
        style: {
          height: '200px',
          width: '40%',
        },
      },
      {
        indexId: 'interfaces',
        displayType: 'multipleIndexsTable',
        sortIndex: 3,
        displayDimension: [
          'ifOperStatus',
          'ifHighSpeed',
          'ifInErrors',
          'ifOutErrors',
          'ifInUcastPkts',
          'ifOutUcastPkts',
          'ifInOctets',
          'ifOutOctets',
        ],
        style: {
          height: '400px',
          width: '100%',
        },
      },
    ],
    tableDiaplay: [
      { type: 'value', key: 'iftotalInOctets' },
      { type: 'value', key: 'iftotalOutOctets' },
      { type: 'value', key: 'sysUpTime' },
    ],
  },
  {
    name: 'Audit System',
    id: 14,
    dashboardDisplay: [
      {
        indexId: 'sysUpTime',
        displayType: 'single',
        sortIndex: 0,
        displayDimension: [],
        style: {
          height: '200px',
          width: '15%',
        },
      },
      {
        indexId: 'iftotalInOctets',
        displayType: 'lineChart',
        sortIndex: 1,
        displayDimension: [],
        style: {
          height: '200px',
          width: '40%',
        },
      },
      {
        indexId: 'iftotalOutOctets',
        displayType: 'lineChart',
        sortIndex: 2,
        displayDimension: [],
        style: {
          height: '200px',
          width: '40%',
        },
      },
      {
        indexId: 'interfaces',
        displayType: 'multipleIndexsTable',
        sortIndex: 3,
        displayDimension: [
          'ifOperStatus',
          'ifHighSpeed',
          'ifInErrors',
          'ifOutErrors',
          'ifInUcastPkts',
          'ifOutUcastPkts',
          'ifInOctets',
          'ifOutOctets',
        ],
        style: {
          height: '400px',
          width: '100%',
        },
      },
    ],
    tableDiaplay: [
      { type: 'value', key: 'iftotalInOctets' },
      { type: 'value', key: 'iftotalOutOctets' },
      { type: 'value', key: 'sysUpTime' },
    ],
  },
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

const OBJECT_ICON_MAP: ObjectIconMap = {
  Host: 'Host',
  Website: 'Website',
  Cluster: 'K8S',
  Pod: 'K8S',
  Node: 'K8S',
  Router: 'Router',
  Switch: 'Switch',
  Firewall: 'Firewall',
  Loadbalance: 'Loadbalance',
  'Detection Device': 'DetectionDevice',
  'Bastion Host': 'BastionHost',
  'Scanning Device': 'ScanningDevice',
  'Audit System': 'AuditSystem',
};

export {
  UNIT_LIST,
  INDEX_CONFIG,
  PERIOD_LIST,
  COMPARISON_METHOD,
  LEVEL_MAP,
  SCHEDULE_UNIT_MAP,
  MONITOR_GROUPS_MAP,
  OBJECT_ICON_MAP,
  useInterfaceLabelMap,
  useScheduleList,
  useMethodList,
  useLevelList,
  useKeyMetricLabelMap,
  useConditionList,
  useTimeRangeList,
  useFrequencyList,
  useStateMap,
};
