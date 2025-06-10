import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePaymentAnalyticsStore = create(
  persist(
    (set, get) => ({
      // Payment statistics
      paymentStats: {
        successfulPayments: 0,
        failedPayments: 0,
        totalProcessed: 0,
        successRate: 0
      },
      
      // Payment methods distribution
      paymentMethods: {
        credit_card: 0,
        debit_card: 0,
        net_banking: 0,
        upi: 0,
        wallet: 0
      },
      
      // Daily payment data
      dailyPayments: [],
      
      // Record a successful payment
      recordSuccessfulPayment: (paymentMethod) => {
        set((state) => {
          // Update payment stats
          const newSuccessful = state.paymentStats.successfulPayments + 1;
          const newTotal = state.paymentStats.totalProcessed + 1;
          const newSuccessRate = (newSuccessful / newTotal) * 100;
          
          // Update payment methods
          const newPaymentMethods = { ...state.paymentMethods };
          newPaymentMethods[paymentMethod] = (newPaymentMethods[paymentMethod] || 0) + 1;
          
          // Update daily payments
          const today = new Date().toISOString().split('T')[0];
          const dailyPayments = [...state.dailyPayments];
          const todayIndex = dailyPayments.findIndex(item => item.date === today);
          
          if (todayIndex >= 0) {
            // Update existing entry for today
            dailyPayments[todayIndex] = {
              ...dailyPayments[todayIndex],
              successful: dailyPayments[todayIndex].successful + 1,
              total: dailyPayments[todayIndex].total + 1
            };
          } else {
            // Add new entry for today
            dailyPayments.push({
              date: today,
              successful: 1,
              failed: 0,
              total: 1
            });
          }
          
          // Sort daily payments by date
          dailyPayments.sort((a, b) => a.date.localeCompare(b.date));
          
          // Keep only the last 30 days of data
          const last30Days = dailyPayments.slice(-30);
          
          return {
            paymentStats: {
              successfulPayments: newSuccessful,
              failedPayments: state.paymentStats.failedPayments,
              totalProcessed: newTotal,
              successRate: Math.round(newSuccessRate * 10) / 10
            },
            paymentMethods: newPaymentMethods,
            dailyPayments: last30Days
          };
        });
      },
      
      // Record a failed payment
      recordFailedPayment: (paymentMethod) => {
        set((state) => {
          // Update payment stats
          const newFailed = state.paymentStats.failedPayments + 1;
          const newTotal = state.paymentStats.totalProcessed + 1;
          const newSuccessRate = (state.paymentStats.successfulPayments / newTotal) * 100;
          
          // Update payment methods (still count the attempt)
          const newPaymentMethods = { ...state.paymentMethods };
          newPaymentMethods[paymentMethod] = (newPaymentMethods[paymentMethod] || 0) + 1;
          
          // Update daily payments
          const today = new Date().toISOString().split('T')[0];
          const dailyPayments = [...state.dailyPayments];
          const todayIndex = dailyPayments.findIndex(item => item.date === today);
          
          if (todayIndex >= 0) {
            // Update existing entry for today
            dailyPayments[todayIndex] = {
              ...dailyPayments[todayIndex],
              failed: dailyPayments[todayIndex].failed + 1,
              total: dailyPayments[todayIndex].total + 1
            };
          } else {
            // Add new entry for today
            dailyPayments.push({
              date: today,
              successful: 0,
              failed: 1,
              total: 1
            });
          }
          
          // Sort daily payments by date
          dailyPayments.sort((a, b) => a.date.localeCompare(b.date));
          
          // Keep only the last 30 days of data
          const last30Days = dailyPayments.slice(-30);
          
          return {
            paymentStats: {
              successfulPayments: state.paymentStats.successfulPayments,
              failedPayments: newFailed,
              totalProcessed: newTotal,
              successRate: Math.round(newSuccessRate * 10) / 10
            },
            paymentMethods: newPaymentMethods,
            dailyPayments: last30Days
          };
        });
      },
      
      // Initialize with sample data if empty
      initializeWithSampleData: () => {
        const state = get();
        
        // Only initialize if no data exists
        if (state.paymentStats.totalProcessed === 0) {
          // Sample payment stats
          const samplePaymentStats = {
            successfulPayments: 78,
            failedPayments: 9,
            totalProcessed: 87,
            successRate: 89.7
          };
          
          // Sample payment methods
          const samplePaymentMethods = {
            credit_card: 45,
            debit_card: 23,
            net_banking: 12,
            upi: 5,
            wallet: 2
          };
          
          // Sample daily payments for the last 5 days
          const sampleDailyPayments = [];
          for (let i = 4; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const successful = Math.floor(Math.random() * 8) + 3;
            const failed = Math.floor(Math.random() * 2) + 1;
            sampleDailyPayments.push({
              date: dateStr,
              successful: successful,
              failed: failed,
              total: successful + failed
            });
          }
          
          set({
            paymentStats: samplePaymentStats,
            paymentMethods: samplePaymentMethods,
            dailyPayments: sampleDailyPayments
          });
        }
      }
    }),
    {
      name: 'payment-analytics-storage',
    }
  )
);