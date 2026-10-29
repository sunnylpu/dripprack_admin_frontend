import test from 'node:test';
import assert from 'node:assert/strict';
import { formatCurrency, formatNumber, calculatePercentage } from '../src/lib/formatters.js';

test('Dashboard metrics aggregation parses revenue correctly', () => {
  const summaryPayload = {
    revenue: {
      totalRevenueCents: 14892000,
      paidOrdersCount: 1420,
      currency: 'USD'
    },
    ordersByStatus: {
      awaiting_payment: 42,
      confirmed: 24,
      processing: 14,
      shipped: 310,
      delivered: 1420,
      cancelled: 32
    },
    totalOrdersCount: 1842,
    lowStockProductsCount: 7,
    recentOrders: [
      {
        orderReference: 'ORD-20261027-F7A9B1',
        customer: {
          firstName: 'Marcus',
          lastName: 'Vance',
          email: 'm.vance@driprack.io'
        },
        currency: 'USD',
        totalCents: 28500,
        orderStatus: 'processing',
        paymentStatus: 'paid',
        paymentMethod: 'online',
        createdAt: '2026-10-30T02:00:00.000Z'
      }
    ],
    generatedAt: '2026-10-30T03:30:00.000Z'
  };

  // Test Revenue conversion
  assert.equal(formatCurrency(summaryPayload.revenue.totalRevenueCents, summaryPayload.revenue.currency), '$148,920.00');
  assert.equal(formatNumber(summaryPayload.totalOrdersCount), '1,842');

  // Test status proportions
  assert.equal(calculatePercentage(summaryPayload.ordersByStatus.delivered, summaryPayload.totalOrdersCount), 77.1);
  assert.equal(calculatePercentage(summaryPayload.ordersByStatus.awaiting_payment, summaryPayload.totalOrdersCount), 2.3);

  // Test recent order row mapping
  const order = summaryPayload.recentOrders[0];
  assert.equal(order.orderReference, 'ORD-20261027-F7A9B1');
  assert.equal(formatCurrency(order.totalCents, order.currency), '$285.00');
  assert.equal(`${order.customer.firstName} ${order.customer.lastName}`, 'Marcus Vance');
});

test('Dashboard handles zero orders payload safely without division by zero', () => {
  const emptySummary = {
    revenue: {
      totalRevenueCents: 0,
      paidOrdersCount: 0,
      currency: 'USD'
    },
    ordersByStatus: {
      awaiting_payment: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    },
    totalOrdersCount: 0,
    lowStockProductsCount: 0,
    recentOrders: [],
    generatedAt: '2026-10-30T03:30:00.000Z'
  };

  assert.equal(formatCurrency(emptySummary.revenue.totalRevenueCents, emptySummary.revenue.currency), '$0.00');
  assert.equal(formatNumber(emptySummary.totalOrdersCount), '0');
  assert.equal(calculatePercentage(emptySummary.ordersByStatus.delivered, emptySummary.totalOrdersCount), 0);
  assert.equal(emptySummary.recentOrders.length, 0);
});

test('Dashboard handles null or deleted customer reference safely', () => {
  const orderWithNullCustomer = {
    orderReference: 'ORD-ANON-001',
    customer: null,
    currency: 'USD',
    totalCents: 15000,
    orderStatus: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'online',
    createdAt: '2026-10-30T02:00:00.000Z'
  };

  const customerName = orderWithNullCustomer.customer
    ? `${orderWithNullCustomer.customer.firstName || ''} ${orderWithNullCustomer.customer.lastName || ''}`.trim() || 'Customer'
    : 'Guest / Unassigned';
  const customerEmail = orderWithNullCustomer.customer?.email || '—';

  assert.equal(customerName, 'Guest / Unassigned');
  assert.equal(customerEmail, '—');
});

