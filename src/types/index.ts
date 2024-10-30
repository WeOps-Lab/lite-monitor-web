export interface ColumnItem {
  title: string;
  dataIndex: string;
  key: string;
  render?: (_: unknown, record: any) => JSX.Element;
  [key: string]: unknown;
}

export interface ListItem {
  title?: string;
  label?: string;
  name?: string;
  id?: string | number;
  value?: string | number;
}
