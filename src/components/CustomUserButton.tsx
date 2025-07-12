import React from 'react';
import { UserButton } from '@clerk/clerk-react';

interface CustomUserButtonProps {
  className?: string;
}

export const CustomUserButton: React.FC<CustomUserButtonProps> = ({ className }) => {
  return (
    <div className={`custom-user-button-wrapper ${className || ''}`}>
      <UserButton 
        appearance={{
          baseTheme: "dark" as any,
          variables: {
            colorPrimary: "#38bdf8",
            colorDanger: "#f87171",
            colorText: "#f4f4f5",
            colorTextSecondary: "#a1a1aa",
            colorBackground: "#18181b",
            colorInputBackground: "#27272a",
            colorInputText: "#f4f4f5",
          },
          elements: {
            avatarBox: "w-10 h-10 rounded-xl overflow-hidden",
          }
        }}
      />
    </div>
  );
}; 