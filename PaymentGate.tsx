// PaymentGate.tsx - Middleware to Check Subscription Status

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import './PaymentGate.css';

interface PaymentGateProps {
  children: React.ReactNode;
  videoId?: string;
  creatorId?: string;
  requiredSubscription?: boolean;
}

interface SubscriptionStatus {
  hasAccess: boolean;
  isSubscribed: boolean;
  subscriptionExpiry?: Date;
  reason?: string;
}

export const PaymentGate: React.FC<PaymentGateProps> = ({
  children,
  videoId,
  creatorId,
  requiredSubscription = false
}) => {
  const [, navigate] = useLocation();
  const [accessStatus, setAccessStatus] = useState<SubscriptionStatus | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // ============================================
  // CHECK PAYMENT STATUS
  // ============================================
  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(
          `/api/onlyfans/check-access${videoId ? `/${videoId}` : ''}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setAccessStatus(data);
        } else if (response.status === 403) {
          // Payment required
          setAccessStatus({
            hasAccess: false,
            isSubscribed: false,
            reason: 'payment_required'
          });
          setShowPaymentModal(true);
        } else if (response.status === 401) {
          // Not authenticated
          navigate('/login');
        }
      } catch (error) {
        console.error('Payment check failed:', error);
        setAccessStatus({
          hasAccess: false,
          isSubscribed: false,
          reason: 'error'
        });
      } finally {
        setIsChecking(false);
      }
    };

    if (requiredSubscription) {
      checkPaymentStatus();
    } else {
      setAccessStatus({ hasAccess: true, isSubscribed: false });
      setIsChecking(false);
    }
  }, [videoId, requiredSubscription, navigate]);

  // ============================================
  // HANDLE PAYMENT MODAL
  // ============================================
  const handleSubscribe = async () => {
    try {
      const response = await fetch('/api/onlyfans/subscribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          creatorId: creatorId,
          videoId: videoId
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to payment page
        window.location.href = data.paymentUrl;
      }
    } catch (error) {
      console.error('Subscription failed:', error);
    }
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (isChecking) {
    return (
      <div className="payment-gate-loading">
        <div className="loading-spinner"></div>
        <p>Checking access...</p>
      </div>
    );
  }

  // ============================================
  // ACCESS DENIED - SHOW PAYMENT MODAL
  // ============================================
  if (!accessStatus?.hasAccess) {
    return (
      <div className="payment-gate-blocked">
        <div className="blocked-overlay"></div>
        <div className="payment-modal">
          <div className="modal-icon">🔒</div>
          <h2>Subscription Required</h2>
          <p>This content is exclusive to subscribers.</p>

          <div className="subscription-options">
            <div className="option-card">
              <h3>Monthly Subscription</h3>
              <p className="price">$9.99<span>/month</span></p>
              <ul className="features">
                <li>✓ Access to all exclusive videos</li>
                <li>✓ Early access to new content</li>
                <li>✓ Direct messaging</li>
                <li>✓ Custom requests</li>
              </ul>
              <button className="subscribe-btn" onClick={handleSubscribe}>
                Subscribe Now
              </button>
            </div>

            <div className="option-card featured">
              <span className="badge">BEST VALUE</span>
              <h3>Annual Subscription</h3>
              <p className="price">$89.99<span>/year</span></p>
              <p className="savings">Save 25%</p>
              <ul className="features">
                <li>✓ Access to all exclusive videos</li>
                <li>✓ Early access to new content</li>
                <li>✓ Direct messaging</li>
                <li>✓ Custom requests</li>
                <li>✓ Priority support</li>
              </ul>
              <button className="subscribe-btn featured" onClick={handleSubscribe}>
                Subscribe Now
              </button>
            </div>
          </div>

          <button
            className="close-modal-btn"
            onClick={() => navigate('/models')}
          >
            Browse Other Models
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // ACCESS GRANTED - RENDER CHILDREN
  // ============================================
  return <>{children}</>;
};

export default PaymentGate;
