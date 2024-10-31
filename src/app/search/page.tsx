'use client';
import React, { useEffect, useState } from 'react';
import { Spin, Select, Button, Segmented, Progress } from 'antd';
import { BellOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';
import useApiClient from '@/utils/request';
import TimeSelector from './timeSelector';
import Collapse from '@/components/collapse';
import searchStyle from './index.module.less';
import { useTranslation } from '@/utils/i18n';
import Icon from '@/components/icon';
const { Option } = Select;
import { ListItem, ColumnItem } from '@/types';
import { deepClone } from '@/utils/common';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';
import CustomTooltip from './customTooltips';
import CustomTable from '@/components/custom-table';

interface ConditionItem {
  label: string | null;
  condition: string | null;
  value: string | null;
}

const Search = () => {
  const { get, isLoading } = useApiClient();
  const { t } = useTranslation();
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [objectType, setObjectType] = useState<string>();
  const [metric, setMetric] = useState<string>();
  const [object, setObject] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('area');
  const [conditions, setConditions] = useState<ConditionItem[]>([
    {
      label: null,
      condition: null,
      value: null,
    },
  ]);
  const [objectTypeList, setObjectTypeList] = useState<ListItem[]>([]);
  const [pagination, setPagination] = useState<any>({
    current: 1,
    total: 0,
    pageSize: 20,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const columns: ColumnItem[] = [
    {
      title: 'Name',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Value1',
      dataIndex: 'value1',
      key: 'value1',
      render: (_, { value1 }) => <Progress percent={value1} />,
    },
  ];
  const isArea: boolean = activeTab === 'area';
  const [tableData, setTableData] = useState<any[]>([
    {
      id: 1,
      time: '2024-09-20 13:12',
      value1: '20.11',
      value2: 30,
      title: '172.99.100-cpu-total',
    },
    {
      id: 2,
      time: '2024-09-20 13:18',
      value1: '30.00',
      value2: 20,
      title: '172.99.100-cpu-total',
    },
    {
      id: 3,
      time: '2024-09-20 13:24',
      value1: '10.00',
      value2: 50,
      title: '172.99.100-cpu-total',
    },
    {
      id: 4,
      time: '2024-09-20 13:30',
      value1: '50.00',
      value2: 40,
      title: '172.99.100-cpu-total',
    },
    {
      id: 5,
      time: '2024-09-20 13:36',
      value1: '40.00',
      value2: 60,
      title: '172.99.100-cpu-total',
    },
    {
      id: 6,
      time: '2024-09-20 13:42',
      value1: '60.00',
      value2: 70,
      title: '172.99.100-cpu-total',
    },
    {
      id: 7,
      time: '2024-09-20 13:48',
      value1: '70.00',
      value2: 60,
      title: '172.99.100-cpu-total',
    },
    {
      id: 8,
      time: '2024-09-20 13:54',
      value1: '60.00',
      value2: 80,
      title: '172.99.100-cpu-total',
    },
    {
      id: 9,
      time: '2024-09-20 14:00',
      value1: '80.00',
      value2: 70,
      title: '172.99.100-cpu-total',
    },
    {
      id: 10,
      time: '2024-09-20 14:06',
      value1: '70.00',
      value2: 60,
      title: '172.99.100-cpu-total',
    },
    {
      id: 11,
      time: '2024-09-20 14:12',
      value1: '60.00',
      value2: 50,
      title: '172.99.100-cpu-total',
    },
  ]);

  //   useEffect(() => {
  //     if (isLoading) return;
  //     getInitData();
  //   }, [isLoading]);

  const getInitData = () => {
    const getAttrList = get(`/api/model/host/attr_list/`);
    setPageLoading(true);
    try {
      Promise.all([getAttrList])
        .then((res) => {
          const objTypes = res[0].map((item: any) => ({
            name: item.attr_name,
            id: item.attr_id,
          }));
          setObjectTypeList(objTypes);
        })
        .finally(() => {
          setPageLoading(false);
        });
    } catch (error) {
      setPageLoading(false);
    }
  };

  const onTimeChange = (val: string[]) => {
    console.log(val);
  };

  const onFrequenceChange = (val: number) => {
    console.log(val);
  };

  const onRefresh = () => {
    console.log(123);
  };

  const createPolicy = () => {
    console.log(122);
  };

  const handleObjectTypeChange = (val: string) => {
    setObjectType(val);
  };

  const handleMetricChange = (val: string) => {
    setMetric(val);
  };

  const handleObjectChange = (val: string[]) => {
    setObject(val);
  };

  const handleLabelChange = (val: string, index: number) => {
    const _conditions = deepClone(conditions);
    _conditions[index].label = val;
    setConditions(_conditions);
  };

  const handleConditionChange = (val: string, index: number) => {
    const _conditions = deepClone(conditions);
    _conditions[index].condition = val;
    setConditions(_conditions);
  };

  const handleValueChange = (val: string, index: number) => {
    const _conditions = deepClone(conditions);
    _conditions[index].value = val;
    setConditions(_conditions);
  };

  const addConditionItem = () => {
    const _conditions = deepClone(conditions);
    _conditions.push({
      label: null,
      condition: null,
      value: null,
    });
    setConditions(_conditions);
  };

  const deleteConditionItem = (index: number) => {
    const _conditions = deepClone(conditions);
    _conditions.splice(index, 1);
    setConditions(_conditions);
  };

  const onTabChange = (val: string) => {
    setActiveTab(val);
  };

  const handleTableChange = (pagination = {}) => {
    setPagination(pagination);
  };

  return (
    <div className={searchStyle.search}>
      <div className={searchStyle.time}>
        <TimeSelector
          onChange={(value, dateString) => {
            onTimeChange(dateString);
          }}
          onFrequenceChange={onFrequenceChange}
          onRefresh={onRefresh}
        />
      </div>
      <div className={searchStyle.criteria}>
        <Collapse
          title={t('monitor.searchCriteria')}
          icon={<BellOutlined onClick={createPolicy} />}
        >
          <div className={`${searchStyle.condition} px-[10px]`}>
            <div className={searchStyle.conditionItem}>
              <div className={searchStyle.itemLabel}>{t('monitor.source')}</div>
              <div
                className={`${searchStyle.itemOption} ${searchStyle.source}`}
              >
                <Select
                  className={`w-[100px] ${searchStyle.sourceObjectType}`}
                  placeholder={t('monitor.objectType')}
                  showSearch
                  value={objectType}
                  onChange={handleObjectTypeChange}
                >
                  {objectTypeList.map((item, index) => {
                    return (
                      <Option value={item.id} key={index}>
                        {item.name}
                      </Option>
                    );
                  })}
                </Select>
                <Select
                  mode="multiple"
                  placeholder={t('monitor.object')}
                  className={`w-[200px] ${searchStyle.sourceObject}`}
                  maxTagCount="responsive"
                  value={object}
                  onChange={handleObjectChange}
                >
                  {objectTypeList.map((item, index) => {
                    return (
                      <Option value={item.id} key={index}>
                        {item.name}
                      </Option>
                    );
                  })}
                </Select>
              </div>
            </div>
            <div className={searchStyle.conditionItem}>
              <div className={searchStyle.itemLabel}>{t('monitor.metric')}</div>
              <div className={searchStyle.itemOption}>
                <Select
                  className="w-[200px]"
                  placeholder={t('monitor.metric')}
                  showSearch
                  value={metric}
                  onChange={handleMetricChange}
                >
                  {objectTypeList.map((item, index) => {
                    return (
                      <Option value={item.id} key={index}>
                        {item.name}
                      </Option>
                    );
                  })}
                </Select>
              </div>
            </div>
            <div className={searchStyle.conditionItem}>
              <div className={searchStyle.itemLabel}>{t('monitor.filter')}</div>
              <ul className={searchStyle.conditions}>
                {conditions.map((conditionItem, index) => (
                  <li
                    className={`${searchStyle.itemOption} ${searchStyle.filter}`}
                    key={index}
                  >
                    <Select
                      className={`w-[100px] ${searchStyle.filterLabel}`}
                      placeholder={t('monitor.label')}
                      showSearch
                      value={conditionItem.label}
                      onChange={(val) => handleLabelChange(val, index)}
                    >
                      {objectTypeList.map((item, index) => {
                        return (
                          <Option value={item.id} key={index}>
                            {item.name}
                          </Option>
                        );
                      })}
                    </Select>
                    <Select
                      className="w-[100px]"
                      placeholder={t('monitor.condition')}
                      value={conditionItem.condition}
                      onChange={(val) => handleConditionChange(val, index)}
                    >
                      {objectTypeList.map((item, index) => {
                        return (
                          <Option value={item.id} key={index}>
                            {item.name}
                          </Option>
                        );
                      })}
                    </Select>
                    <Select
                      className="w-[150px]"
                      placeholder={t('monitor.value')}
                      showSearch
                      value={conditionItem.value}
                      onChange={(val) => handleValueChange(val, index)}
                    >
                      {objectTypeList.map((item, index) => {
                        return (
                          <Option value={item.id} key={index}>
                            {item.name}
                          </Option>
                        );
                      })}
                    </Select>
                    {!!index && (
                      <Button
                        icon={<CloseOutlined />}
                        onClick={() => deleteConditionItem(index)}
                      />
                    )}
                    <Button
                      icon={<PlusOutlined />}
                      onClick={addConditionItem}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Collapse>
      </div>
      <Spin spinning={pageLoading}>
        <div className={searchStyle.chart}>
          <Segmented
            className="mb-[20px]"
            value={activeTab}
            options={[
              {
                label: (
                  <div className="flex items-center">
                    <Icon type="duijimianjitu" className="mr-[8px]" />
                    {t('monitor.area')}
                  </div>
                ),
                value: 'area',
              },
              {
                label: (
                  <div className="flex items-center">
                    <Icon type="tabulation" className="mr-[8px]" />
                    {t('monitor.table')}
                  </div>
                ),
                value: 'table',
              },
            ]}
            onChange={onTabChange}
          />
          {isArea ? (
            <div className={searchStyle.chartArea}>
              <ResponsiveContainer>
                <AreaChart
                  data={tableData}
                  margin={{
                    top: 10,
                    right: 0,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <XAxis
                    dataKey="time"
                    tick={{ fill: 'var(--color-text-3)' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--color-text-3)' }}
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value1"
                    stroke="#8884d8"
                    fillOpacity={0.1}
                    fill="#8884d8"
                  />
                  {/* <Area
                type="monotone"
                dataKey="value2"
                stroke="#82ca9d"
                fillOpacity={0.1}
                fill="#82ca9d"
              /> */}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <CustomTable
              scroll={{ y: 300 }}
              columns={columns}
              dataSource={tableData}
              pagination={pagination}
              loading={loading}
              rowKey="id"
              onChange={handleTableChange}
            ></CustomTable>
          )}
        </div>
      </Spin>
    </div>
  );
};
export default Search;
