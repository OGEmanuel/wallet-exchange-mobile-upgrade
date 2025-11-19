/**
 * Transaction Status Utility Functions
 * 
 * Provides utility functions for determining transaction status and button visibility
 * based on the transaction flow requirements.
 */

import { ExchangeActivityModel, TransactionStatus } from "@zap/blockchain-sdk";

/**
 * Progress statuses that indicate a transaction is in progress
 */
export const PROGRESS_STATUSES: TransactionStatus[] = [
  "DEPOSIT_CONFIRMED",
  "DEPOSIT_CONFIRMING",
  "WITHDRAWAL_CONFIRMED",
  "WITHDRAWAL_CONFIRMING",
  "FILLED",
];

/**
 * Get the actual transaction status
 * - Returns childOrder.status if it exists and is not "PENDING"
 * - Otherwise returns transaction.status
 * - Returns undefined if transaction is null/undefined
 */
export const getActualTransactionStatus = (
  transaction?: ExchangeActivityModel | null
): TransactionStatus | undefined => {
  if (!transaction) return undefined;

  // Use childOrder.status if it exists and is not "PENDING"
  if (transaction.childOrder && transaction.childOrder.status !== "PENDING") {
    return transaction.childOrder.status as TransactionStatus;
  }

  // Otherwise use transaction.status
  return transaction.status;
};

/**
 * Determine if the progress button should be shown
 * - Returns true if status is in [PROGRESS_STATUSES, "PENDING"]
 * - BUT excludes: "FILLED", "WITHDRAWAL_CONFIRMED", "WITHDRAWAL_CONFIRMING"
 * - Returns false otherwise
 */
export const shouldShowProgressButton = (
  transaction?: ExchangeActivityModel | null
): boolean => {
  const actualStatus = getActualTransactionStatus(transaction);
  
  if (!actualStatus) return false;

  // Statuses that should show the button
  const allowedStatuses: TransactionStatus[] = [
    "PENDING",
    "DEPOSIT_CONFIRMING",
    "DEPOSIT_CONFIRMED",
  ];

  return allowedStatuses.includes(actualStatus);
};

/**
 * Determine if Exchange Summary should be shown
 * - Returns true if status === "PENDING"
 * - Returns false otherwise
 */
export const shouldShowExchangeSummary = (
  transaction?: ExchangeActivityModel | null
): boolean => {
  const actualStatus = getActualTransactionStatus(transaction);
  return actualStatus === "PENDING";
};

/**
 * Determine if Transaction Progress should be shown
 * - Returns true if status is in progress statuses but not PENDING
 * - Returns false otherwise
 */
export const shouldShowTransactionProgress = (
  transaction?: ExchangeActivityModel | null
): boolean => {
  const actualStatus = getActualTransactionStatus(transaction);
  
  if (!actualStatus) return false;

  // Show progress for these statuses (excluding PENDING)
  const progressStatuses: TransactionStatus[] = [
    "DEPOSIT_CONFIRMING",
    "DEPOSIT_CONFIRMED",
    "WITHDRAWAL_CONFIRMING",
  ];

  return progressStatuses.includes(actualStatus);
};

