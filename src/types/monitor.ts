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
