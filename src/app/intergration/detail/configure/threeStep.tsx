import React, { useState, ReactNode, useEffect } from 'react';
import threeStepStyle from './threeStep.module.less';
import { useTranslation } from '@/utils/i18n';
import { MetricItem } from '@/types/monitor';
import { Tag, Button, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import ReactDOMServer from 'react-dom/server';
const { CheckableTag } = Tag;

interface Step1Props {
  children: ReactNode;
}

interface Step2Props {
  options: MetricItem[];
  selectedOptions: number[];
  disabled: boolean;
  onChange: (selected: number[]) => void;
}

interface Step3Props {
  content: JSX.Element;
}

interface ThreeStepComponentProps {
  step2Options: MetricItem[];
  step3Content: JSX.Element;
  metricsDisabled: boolean;
  onStep2Change: (selected: number[]) => void;
  children: ReactNode;
}

const Step1: React.FC<Step1Props> = ({ children }) => {
  const { t } = useTranslation();
  return (
    <div className={threeStepStyle.step}>
      <b>
        <span>{t('monitor.step1')}：</span>
        {t('monitor.configureStep1')}
      </b>
      <div className={threeStepStyle.content}>{children}</div>
    </div>
  );
};

const Step2: React.FC<Step2Props> = ({
  options,
  selectedOptions,
  disabled,
  onChange,
}) => {
  const { t } = useTranslation();
  const handleCheckboxChange = (tag: number, checked: boolean) => {
    const updatedSelectedOptions = checked
      ? [...selectedOptions, tag]
      : selectedOptions.filter((t) => t !== tag);
    onChange(updatedSelectedOptions);
  };

  return (
    <div className={threeStepStyle.step}>
      <b>
        <span>{t('monitor.step2')}：</span>
        {t('monitor.configureStep2')}
      </b>
      <div className={threeStepStyle.content}>
        {options.map((option) => (
          <CheckableTag
            key={option.id}
            checked={selectedOptions.includes(option.id)}
            style={disabled ? { pointerEvents: 'none' } : {}}
            onChange={(checked) => handleCheckboxChange(option.id, checked)}
          >
            {option.name}
          </CheckableTag>
        ))}
      </div>
    </div>
  );
};

const Step3: React.FC<Step3Props> = ({ content }) => {
  const { t } = useTranslation();

  // 复制jsx里面的内容，不要标签
  const onCopy = (value: JSX.Element) => {
    const elementString = ReactDOMServer.renderToString(value);
    const parser = new DOMParser();
    const doc = parser.parseFromString(elementString, 'text/html');
    const text = doc.body.textContent || '';
    navigator.clipboard.writeText(text);
    message.success(t('common.successfulCopied'));
  };

  return (
    <div className={threeStepStyle.step}>
      <b>
        <span>{t('monitor.step3')}：</span>
        {t('monitor.configureStep3')}
      </b>
      <div className={`${threeStepStyle.content} ${threeStepStyle.copyBoard}`}>
        {content}
        <Button
          className={threeStepStyle.copy}
          type="link"
          size="small"
          icon={<CopyOutlined />}
          onClick={() => onCopy(content)}
        />
      </div>
    </div>
  );
};

const ThreeStepComponent: React.FC<ThreeStepComponentProps> = ({
  step2Options,
  step3Content,
  metricsDisabled,
  onStep2Change,
  children,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  useEffect(() => {
    setSelectedOptions(step2Options.map((item) => item.id));
  }, [step2Options]);

  const handleStep2Change = (selected: number[]) => {
    setSelectedOptions(selected);
    onStep2Change(selected);
  };

  return (
    <div className={threeStepStyle.threeStep}>
      <Step1>{children}</Step1>
      <Step2
        disabled={metricsDisabled}
        options={step2Options}
        selectedOptions={selectedOptions}
        onChange={handleStep2Change}
      />
      <Step3 content={step3Content} />
    </div>
  );
};

export default ThreeStepComponent;
