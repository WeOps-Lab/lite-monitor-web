import React, { useState, useEffect, ReactNode } from 'react';
import { CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons';
import classNames from 'classnames';

interface AccordionProps {
  title: string;
  children: ReactNode;
  className?: string;
  isOpen?: boolean;
  icon?: JSX.Element;
  onToggle?: (isOpen: boolean) => void;
}

const Collapse: React.FC<AccordionProps> = ({
  title,
  children,
  isOpen = true,
  icon,
  className = '',
  onToggle,
}) => {
  const [open, setOpen] = useState(isOpen);
  const collapseClass = classNames('text-[12px]', className);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const toggleAccordion = () => {
    const newOpenState = !open;
    setOpen(newOpenState);
    if (onToggle) {
      onToggle(newOpenState);
    }
  };

  return (
    <div className={collapseClass}>
      <div
        className="flex justify-between items-center p-[10px] bg-[var(--color-fill-1)] cursor-pointer"
        onClick={toggleAccordion}
      >
        <div>
          <span className="text-[var(--color-text-3)] mr-[6px]">
            {open ? <CaretDownOutlined /> : <CaretRightOutlined />}
          </span>
          <span className="font-semibold text-[14px]">{title}</span>
        </div>
        {icon && (
          <div
            className="ml-[6px] text-[14px]"
            onClick={(e) => e.stopPropagation()}
          >
            {icon}
          </div>
        )}
      </div>
      {open && <div className="py-[10px]">{children}</div>}
    </div>
  );
};

export default Collapse;
