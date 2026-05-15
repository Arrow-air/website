import React from 'react';

interface StepProps {
  title: string;
  children: React.ReactNode;
}

export function Step({ title, children }: StepProps) {
  return (
    <div className="step">
      <div className="step__marker">
        <div className="step__badge" />
        <div className="step__connector" />
      </div>
      <div className="step__content">
        <div className="step__title">{title}</div>
        <div className="step__body">{children}</div>
      </div>
    </div>
  );
}

export function Steps({ children }: { children: React.ReactNode }) {
  return (
    <div className="steps">
      {children}
    </div>
  );
}
