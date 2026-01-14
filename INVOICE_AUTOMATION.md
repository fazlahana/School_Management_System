# Automated Invoice Generation System

## Overview
The system automatically generates invoices for students based on fee structures. This eliminates manual invoice creation and ensures consistent billing.

## How It Works

### 1. Immediate Invoice Generation
When an admin creates or updates a fee structure, the system:
- ✅ Identifies all students in the specified class
- ✅ Checks for existing unpaid invoices for the same fee and billing period
- ✅ Automatically creates invoices for students who don't have one
- ✅ Sets appropriate due dates based on fee frequency
- ✅ Logs all operations for audit purposes

### 3. Fee Structure Updates
When a fee structure is updated (e.g., amount changed from $500 to $600):
- ✅ The system automatically updates all **unpaid** invoices to the new amount
- ✅ It recalculates the `due_amount` automatically
- ✅ It creates new invoices for any students who were previously missed
- 🛡️ **Paid** invoices are left untouched to preserve historical accuracy

## Class-Wise Payment Management

The system provides dedicated tools for managing payments class-by-class:

### Class Overview API
`GET /api/class-payments?class_id=1`
Returns:
- List of all students in the class
- Summary of their invoices (Total, Paid, Due)
- Status of each invoice

### Recording Payments
`POST /api/class-payments/pay`
Supports:
- **Full Payments**: Marking an invoice as fully paid
- **Partial Payments**: Accepting partial amounts (e.g., paying $200 of a $500 fee)
- **Automatic Status Updates**:
  - If `paid_amount < total_amount` → Status: `partial`
  - If `paid_amount >= total_amount` → Status: `paid`

## Billing Periods

### Monthly Fees
- **Billing Period Format**: `YYYY-MM` (e.g., `2026-01`)
- **Due Date**: End of the following month
- **Example**: Fee created on Jan 15 → Due on Feb 28

### Yearly Fees
- **Billing Period Format**: `YYYY` (e.g., `2026`)
- **Due Date**: End of the following year
- **Example**: Fee created on Jan 15, 2026 → Due on Dec 31, 2027

### One-Time Fees
- **Billing Period Format**: `one-time-YYYY-MM-DD` (e.g., `one-time-2026-01-15`)
- **Due Date**: 30 days from creation
- **Example**: Fee created on Jan 15 → Due on Feb 14

## Duplicate Prevention
The system prevents duplicate invoices by checking:
1. Student ID
2. Fee structure name (title)
3. Billing period
4. Invoice status (skips only if status is NOT 'paid')

## Manual Commands

### Generate Invoices Manually
Run this command to manually trigger invoice generation:
```bash
php artisan invoices:generate-recurring
```

### View Scheduled Tasks
```bash
php artisan schedule:list
```

### Test Scheduler (Run Immediately)
```bash
php artisan schedule:run
```

## Setting Up the Scheduler

### For Production (Linux/Mac)
Add this to your crontab:
```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

### For Development (Windows)
Use Task Scheduler or run manually:
```bash
php artisan schedule:work
```

## Invoice Fields

Each auto-generated invoice includes:
- **Invoice Number**: Unique ID (e.g., `INV-ABC123DEF`)
- **Student ID**: Link to the student
- **Title**: Fee structure name
- **Description**: Fee details
- **Total Amount**: From fee structure
- **Paid Amount**: Initially 0
- **Due Amount**: Initially equals total amount
- **Due Date**: Calculated based on frequency
- **Billing Period**: Tracks the period (prevents duplicates)
- **Status**: Initially `pending`

## Payment Page Integration

The payment page automatically displays all generated invoices:
- No manual invoice creation needed
- Invoices appear immediately after fee structure creation
- Recurring invoices appear on the 1st of each month
- Admins can still manually create invoices if needed

## Logging

All invoice generation is logged:
```
[2026-01-05 10:41:20] Auto-generated invoices for fee structure
  - Fee Structure ID: 5
  - Fee Name: "Tuition Fee - January"
  - Class ID: 3
  - Billing Period: 2026-01
  - Invoices Created: 25
  - Invoices Skipped: 0
```

## Best Practices

1. **Create fee structures at the beginning of each term/month**
2. **Use descriptive names** (e.g., "Tuition Fee - January 2026")
3. **Always specify a class** for automatic invoice generation
4. **Review logs** regularly to ensure invoices are being created
5. **Test with a small class first** before rolling out to all classes

## Troubleshooting

### Invoices not being created?
- Check if the fee structure has a `class_id`
- Verify students exist in that class
- Check Laravel logs for errors

### Duplicate invoices?
- The system prevents duplicates automatically
- Check the `billing_period` field
- Paid invoices are excluded from duplicate checks

### Scheduler not running?
- Ensure cron job is set up (production)
- Use `php artisan schedule:work` for development
- Check Laravel logs for scheduler errors
