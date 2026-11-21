'use client';

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}) => {
  const baseClasses = variant === 'primary' ? 'btn-industrial' : 'btn-industrial-outline';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-6 py-3',
    lg: 'text-base px-8 py-3.5',
  }[size];

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${widthClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
