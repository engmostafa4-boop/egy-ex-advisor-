import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Stock } from '../data/mockData';
import { useAuth } from './AuthContext';

export type AlertType = 'price_above' | 'price_below';

export interface Alert {
  id: string;
  symbol: string;
  type: AlertType;
  targetPrice: number;
  isTriggered: boolean;
  createdAt: number;
}

interface AlertContextType {
  alerts: Alert[];
  addAlert: (symbol: string, type: AlertType, targetPrice: number) => void;
  removeAlert: (id: string) => void;
  checkAlerts: (stocks: Stock[]) => void;
  dismissAlert: (id: string) => void;
  activeNotifications: Alert[];
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeNotifications, setActiveNotifications] = useState<Alert[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetch('/api/data/alerts')
        .then(res => res.json())
        .then(data => {
          if (data && data.value) setAlerts(data.value);
        })
        .catch(console.error);
    } else {
      setAlerts([]);
      setActiveNotifications([]);
    }
  }, [user]);

  const saveAlerts = (newAlerts: Alert[]) => {
    setAlerts(newAlerts);
    if (user) {
      fetch('/api/data/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newAlerts })
      }).catch(console.error);
    }
  };

  const addAlert = (symbol: string, type: AlertType, targetPrice: number) => {
    const newAlert: Alert = {
      id: Date.now().toString(),
      symbol,
      type,
      targetPrice,
      isTriggered: false,
      createdAt: Date.now(),
    };
    saveAlerts([...alerts, newAlert]);
  };

  const removeAlert = (id: string) => {
    saveAlerts(alerts.filter(a => a.id !== id));
    setActiveNotifications(prev => prev.filter(n => n.id !== id));
  };

  const dismissAlert = (id: string) => {
     setActiveNotifications(prev => prev.filter(n => n.id !== id));
  };

  const checkAlerts = (stocks: Stock[]) => {
    let newNotifications: Alert[] = [];
    let stateChanged = false;
    
    const newAlerts = alerts.map(alert => {
      if (alert.isTriggered) return alert;
      
      const stock = stocks.find(s => s.symbol === alert.symbol);
      if (!stock) return alert;

      let triggered = false;
      if (alert.type === 'price_above' && stock.price >= alert.targetPrice) {
        triggered = true;
      } else if (alert.type === 'price_below' && stock.price <= alert.targetPrice) {
        triggered = true;
      }

      if (triggered) {
        stateChanged = true;
        const triggeredAlert = { ...alert, isTriggered: true };
        newNotifications.push(triggeredAlert);
        return triggeredAlert;
      }
      
      return alert;
    });

    if (stateChanged) {
      saveAlerts(newAlerts);
    }

    if (newNotifications.length > 0) {
      setActiveNotifications(prev => [...prev, ...newNotifications]);
    }
  };

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert, checkAlerts, dismissAlert, activeNotifications }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
}

