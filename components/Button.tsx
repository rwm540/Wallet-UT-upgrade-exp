import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  children, 
  className = '', 
  fullWidth = false,
  ...props 
}) => {
  let baseStyles = "font-bold py-3 px-6 rounded-xl btn-3d flex items-center justify-center gap-2 text-sm uppercase tracking-wider focus:outline-none focus:ring-4 transition-transform";
  
  const variants = {
    primary: "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-800 focus:ring-emerald-300 shadow-md shadow-emerald-600/20",
    secondary: "bg-sky-500 hover:bg-sky-400 text-white border-sky-700 focus:ring-sky-300 shadow-md shadow-sky-500/20",
    danger: "bg-rose-500 hover:bg-rose-400 text-white border-rose-700 focus:ring-rose-300",
    ghost: "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 focus:ring-emerald-100"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};