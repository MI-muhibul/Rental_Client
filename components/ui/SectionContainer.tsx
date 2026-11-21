import React from 'react';

export interface SectionContainerProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'section' | 'div' | 'main';
  bleed?: boolean;
  children: React.ReactNode;
}

export const SectionContainer: React.FC<SectionContainerProps> = ({
  as: Component = 'section',
  bleed = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <Component
      className={`section-container ${bleed ? 'max-w-none' : ''} ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
};

export default SectionContainer;
