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
  dimensions: any[];
  query?: string;
  [key: string]: unknown;
}

export interface CollectionTargetField {
  monitor_instance_name: string;
  monitor_object_id?: number;
  interval: number;
  unit?: string;
}

export interface DimensionItem {
  name: string;
  [key: string]: unknown;
}

export interface IndexViewItem {
  name?: string;
  id?: string | number;
  isExpanded?: boolean;
  isLoading?: boolean;
  child?: any[];
}
