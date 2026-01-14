<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
        .header { background: #3b82f6; color: white; padding: 15px; text-align: center; border-radius: 10px 10px 0 0; }
        .details { margin: 20px 0; padding: 15px; background: #eff6ff; border-radius: 8px; }
        .amount { font-size: 1.5em; font-weight: bold; color: #1e40af; }
        .footer { font-size: 0.8em; color: #666; text-align: center; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Payment Receipt</h2>
        </div>
        <p>Hello <strong>{{ $payment->student->user->name }}</strong>,</p>
        <p>Thank you for your payment. Below are the details of the transaction:</p>
        
        <div class="details">
            <p><strong>Payment Type:</strong> {{ $payment->type }}</p>
            <p><strong>Transaction ID:</strong> #{{ $payment->transaction_id ?? $payment->id }}</p>
            <p><strong>Date:</strong> {{ \Carbon\Carbon::parse($payment->payment_date)->format('M d, Y') }}</p>
            <p><strong>Status:</strong> <span style="color: green; text-transform: uppercase;">{{ $payment->status }}</span></p>
            <hr style="border: none; border-top: 1px solid #d1d5db;">
            <p style="text-align: right;">Amount Paid: <span class="amount">${{ number_format($payment->amount, 2) }}</span></p>
        </div>

        <p>A PDF copy of this receipt is available in your student dashboard under the "Payments" section.</p>
        
        <p>Regards,<br>Finance Department</p>
        <div class="footer">
            &copy; {{ date('Y') }} EduSpire School Management System
        </div>
    </div>
</body>
</html>
