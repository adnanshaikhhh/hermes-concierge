// Single source of truth for order status strings.
// Previously these were scattered as raw string literals across the
// codebase, which caused a "complete" vs "completed" mismatch — the
// fulfill pipeline wrote "complete" but the live status stream only
// recognised "completed", so the stream spun on "Queued" forever and
// never advanced to "Delivered".

export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETE: "complete",
  FAILED: "failed",
  REVISION_REQUESTED: "revision_requested",
  REVISION_PROCESSING: "revision_processing",
  REVISION_COMPLETE: "revision_complete",
} as const;

export type OrderStatus =
  (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

/** Statuses that mean the order has been delivered to the client. */
export const TERMINAL_SUCCESS_STATUSES: readonly OrderStatus[] = [
  ORDER_STATUS.COMPLETE,
  ORDER_STATUS.REVISION_COMPLETE,
];

/** Statuses that mean the order is in flight (no decision yet). */
export const IN_FLIGHT_STATUSES: readonly OrderStatus[] = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.REVISION_REQUESTED,
  ORDER_STATUS.REVISION_PROCESSING,
];

/** Statuses that mean the order has ended in failure. */
export const TERMINAL_FAILURE_STATUSES: readonly OrderStatus[] = [
  ORDER_STATUS.FAILED,
];
