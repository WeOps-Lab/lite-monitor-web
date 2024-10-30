import React, { useState, useEffect, ReactNode } from 'react';
import { CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons';

interface AccordionProps {
  title: string;
  children: ReactNode;
  isOpen?: boolean;
  icon?: JSX.Element;
  onToggle?: (isOpen: boolean) => void;
  onIconClick?: () => void;
}

const Collapse: React.FC<AccordionProps> = ({
  title,
  children,
  isOpen = true,
  icon,
  onToggle,
  onIconClick,
}) => {
  const [open, setOpen] = useState(isOpen);

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

  const handleIconClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (onIconClick) {
      onIconClick();
    }
  };

  return (
    <div className="text-[12px]">
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
          <div className="ml-[6px] text-[14px]" onClick={handleIconClick}>
            {icon}
          </div>
        )}
      </div>
      {open && <div className="p-[10px]">{children}</div>}
    </div>
  );
};

export default Collapse;
