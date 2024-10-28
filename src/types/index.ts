export interface ColumnItem {
  title: string;
  dataIndex: string;
  key: string;
  render?: (_: unknown, record: any) => JSX.Element;
  [key: string]: unknown;
}
