import React, { useState, useEffect } from 'react';

export interface AcknowledgeModalProps {
  isOpen: boolean;
  type?: 'success' | 'error' | 'warning' | 'otp' | 'info';
  badgeText?: string;
  title: string;
  message: string;
  highlightText?: string;
  confirmBtnText?: string;
  secondaryBtnText?: string;
  minDurationSeconds?: number;
  onConfirm: () => void;
  onSecondary?: () => void;
  onClose?: () => void;
}

export const AcknowledgeModal: React.FC<AcknowledgeModalProps> = ({
  isOpen,
  type = 'info',
  badgeText,
  title,
  message,
  highlightText,
  confirmBtnText = 'OK / ACKNOWLEDGE',
  secondaryBtnText,
  minDurationSeconds = 2,
  onConfirm,
  onSecondary,
  onClose
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(minDurationSeconds);

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(minDurationSeconds);
      return;
    }

    setSecondsRemaining(minDurationSeconds);
    if (minDurationSeconds <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, minDurationSeconds]);

  if (!isOpen) return null;

  const getBorderColor = () => {
    switch (type) {
      case 'success': return '#22c55e';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'otp': return '#3b82f6';
      default: return '#6366f1';
    }
  };

  const getBadgeStyle = () => {
    switch (type) {
      case 'success': return { background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' };
      case 'error': return { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' };
      case 'warning': return { background: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d' };
      case 'otp': return { background: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc' };
      default: return { background: '#e0e7ff', color: '#3730a3', border: '1px solid #a5b4fc' };
    }
  };

  const canConfirm = secondsRemaining === 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && canConfirm && onClose) {
          onClose();
        }
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
          borderTop: `5px solid ${getBorderColor()}`
        }}
      >
        <div style={{ padding: '24px 28px 20px 28px' }}>
          {/* Header Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
                padding: '4px 10px',
                borderRadius: '6px',
                ...getBadgeStyle()
              }}
            >
              {badgeText || (type === 'otp' ? '[GOVERNMENT SMS OTP]' : type === 'error' ? '[ACCESS DENIED]' : '[GOVT SECURE ACKNOWLEDGMENT]')}
            </span>

            {minDurationSeconds > 0 && !canConfirm && (
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px' }}>
                Please read ({secondsRemaining}s)
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: '1.22rem',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 10px 0',
              lineHeight: 1.3
            }}
          >
            {title}
          </h3>

          {/* Message Body */}
          <p
            style={{
              fontSize: '0.92rem',
              color: '#475569',
              lineHeight: 1.55,
              margin: '0 0 16px 0',
              whiteSpace: 'pre-line'
            }}
          >
            {message}
          </p>

          {/* Optional Highlight Box (e.g. for Unique OTP) */}
          {highlightText && (
            <div
              style={{
                background: '#f8fafc',
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '14px 18px',
                textAlign: 'center',
                margin: '16px 0 20px 0'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 4 }}>
                UNIQUE VERIFICATION CODE
              </div>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 900,
                  letterSpacing: '8px',
                  color: '#1e293b',
                  fontFamily: 'monospace'
                }}
              >
                {highlightText}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>
                Valid for 10 minutes • Do not share with unauthorized persons
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            background: '#f8fafc',
            padding: '16px 28px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            alignItems: 'center'
          }}
        >
          {secondaryBtnText && onSecondary && (
            <button
              type="button"
              onClick={onSecondary}
              style={{
                padding: '10px 18px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: '#334155',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {secondaryBtnText}
            </button>
          )}

          <button
            type="button"
            disabled={!canConfirm}
            onClick={onConfirm}
            style={{
              padding: '10px 22px',
              background: canConfirm ? (type === 'error' ? '#ef4444' : '#15803d') : '#94a3b8',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: canConfirm ? 'pointer' : 'not-allowed',
              boxShadow: canConfirm ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            {canConfirm ? confirmBtnText : `Confirming (${secondsRemaining}s)...`}
          </button>
        </div>
      </div>
    </div>
  );
};
