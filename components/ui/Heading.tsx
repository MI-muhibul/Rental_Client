import React from 'react';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4;
  size?: 'xl' | 'lg' | 'md' | 'sm';
  children: React.ReactNode;
}

export const Heading: React.FC<HeadingProps> = ({
  level = 2,
  size,
  className = '',
  children,
  ...props
}) => {
  const resolvedSize = size || (level === 1 ? 'xl' : level === 2 ? 'lg' : level === 3 ? 'md' : 'sm');

  const sizeClasses = {
    xl: 'heading-xl',
    lg: 'heading-lg',
    md: 'heading-md',
    sm: 'heading-sm',
  }[resolvedSize];

  const classes = `${sizeClasses} ${className}`.trim();

  switch (level) {
    case 1:
      return (
        <h1 className={classes} {...props}>
          {children}
        </h1>
      );
    case 2:
      return (
        <h2 className={classes} {...props}>
          {children}
        </h2>
      );
    case 3:
      return (
        <h3 className={classes} {...props}>
          {children}
        </h3>
      );
    case 4:
    default:
      return (
        <h4 className={classes} {...props}>
          {children}
        </h4>
      );
  }
};

export default Heading;
