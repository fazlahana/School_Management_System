<!DOCTYPE html>
<html>
<head>
    <title>Payment Receipt</title>
    <style>
        body { font-family: sans-serif; }
        .receipt-box { width: 100%; border: 1px solid #ccc; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .details { margin-top: 20px; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; }
        table { width: 100%; margin-top: 20px; border-collapse: collapse; }
        th, td { border: 1px solid #eee; padding: 10px; text-align: left; }
        .total { font-weight: bold; font-size: 18px; color: #1a56db; }
    </style>
</head>
<body>
    <div className="receipt-box">
        <div className="header">
            @if($logo = \App\Models\Setting::get('school_logo'))
                <img src="{{ public_path($logo) }}" style="height: 60px; margin-bottom: 10px;">
            @endif
            <h2>{{ \App\Models\Setting::get('school_name', 'School System') }}</h2>
            <p>{{ \App\Models\Setting::get('school_address', '') }}</p>
            <p>Payment Receipt</p>
        </div>
        
        <div className="details">
            <p><strong>Receipt No:</strong> RECP-{{ $payment->id }}-{{ date('Ymd') }}</p>
            <p><strong>Date:</strong> {{ $payment->payment_date }}</p>
            <p><strong>Student:</strong> {{ $payment->student->user->name }} ({{ $payment->student->student_code }})</p>
            <p><strong>Invoice Ref:</strong> {{ $payment->invoice->invoice_number }}</p>
        </div>

        <table>
            <thead>
                <tr style="background: #f9fafb;">
                    <th>Description</th>
                    <th>Payment Method</th>
                    <th>Amount Paid</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{{ $payment->invoice->title }}</td>
                    <td>{{ $payment->method }}</td>
                    <td className="total">{{ \App\Models\Setting::get('currency_symbol', '$') }}{{ number_format($payment->amount, 2) }}</td>
                </tr>
            </tbody>
        </table>

        <div className="details">
            <p><strong>Remaining Balance:</strong> {{ \App\Models\Setting::get('currency_symbol', '$') }}{{ number_format($payment->invoice->due_amount, 2) }}</p>
            <p><strong>Status:</strong> {{ strtoupper($payment->invoice->status) }}</p>
        </div>

        <div className="footer">
            <p>This is a computer-generated receipt. No signature required.</p>
            <p>Thank you for your payment!</p>
        </div>
    </div>
</body>
</html>
