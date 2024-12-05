export interface GroupInfo {
  name?: string;
  description?: string;
  id?: number;
}

export interface MetricInfo {
  type?: string;
  name?: string;
  display_name?: string;
  metric_group?: number;
  monitor_object?: number;
  id?: number;
  query?: string;
  data_type?: string;
  unit?: string;
  description?: string;
  dimensions?: string[];
}

export interface RuleInfo {
  type?: string;
  name?: string;
  grouping_rules?: GroupingRules;
  organizations?: string[];
  monitor_object?: number;
  id?: number;
}

export interface GroupingRules {
  query?: string;
  instances?: string[];
}

export interface ObjectInstItem {
  instance_id: string;
  agent_id: string;
  organizations: string[];
  time: string;
  [key: string]: unknown;
}

export interface IntergrationItem {
  label: string;
  value: string;
  list: ObectItem[];
  [key: string]: unknown;
}

export interface ObectItem {
  id: number;
  name: string;
  type: string;
  description: string;
  [key: string]: unknown;
}

export interface MetricItem {
  id: number;
  metric_group: number;
  metric_object: number;
  name: string;
  type: string;
  display_name?: string;
  dimensions: any[];
  query?: string;
  unit?: string;
  [key: string]: unknown;
}

export interface CollectionTargetField {
  monitor_instance_name: string;
  monitor_object_id?: number;
  interval: number;
  monitor_url?: string;
  unit?: string;
}

export interface DimensionItem {
  name: string;
  [key: string]: unknown;
}

export interface IndexViewItem {
  name?: string;
  id: number;
  isLoading?: boolean;
  child?: any[];
}

export interface TableDataItem {
  metric: Record<string, string>;
  value: string;
  index: number;
  [key: string]: any;
}

export interface ChartDataItem {
  metric: Record<string, string>;
  values: [number, string][];
  [key: string]: any;
}

export interface ConditionItem {
  label: string | null;
  condition: string | null;
  value: string;
}

export interface FilterItem {
  name: string | null;
  method: string | null;
  value: string;
}

export interface SearchParams {
  time?: number;
  end?: number;
  start?: number;
  step?: number;
  query: string;
}

export interface FiltersConfig {
  level: string[];
  state: string[];
  notify: string[];
}
export interface ThresholdField {
  level: string;
  method: string;
  value: number | null;
}

export interface AlertProps {
  objects: ObectItem[];
  metrics: MetricItem[];
}

export interface SourceFeild {
  type: string;
  values: Array<string | number>;
}

export interface StrategyFields {
  name?: string;
  organizations?: string[];
  source?: SourceFeild;
  metric?: number;
  schedule?: {
    type: string;
    value: number;
  };
  period?: number;
  algorithm?: string;
  threshold: ThresholdField[];
  recovery_condition?: number;
  no_data_alert?: number;
  no_data_level?: string;
  notice?: boolean;
  notice_type?: string;
  notice_users?: string[];
  monitor_object?: number;
  filter?: FilterItem[];
  id?: number;
  [key: string]: unknown;
}

export interface LevelMap {
  critical: string;
  error: string;
  warning: string;
  [key: string]: unknown;
}

export interface UnitMap {
  [key: string]: number;
}
