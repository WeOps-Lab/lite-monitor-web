export interface GroupInfo {
  id?: string;
  name?: string;
  _id?: number;
}

export interface MetricInfo {
  id?: string;
  name?: string;
  _id?: number;
  group?: string;
  query?: string;
  formula?: string;
  type?: string;
  dataType?: string;
  unit?: string;
  descripition?: string;
}

export interface ObectItem {
  id: number;
  name: string;
  type: string;
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
