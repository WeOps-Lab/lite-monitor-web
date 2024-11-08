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
  [key: string]: unknown;
}

export interface CollectionTargetField {
  node: string;
  instance_name: string;
  interval: number;
  unit: string;
  url?: string;
}

export interface DimensionItem {
  name: string;
  [key: string]: unknown;
}
