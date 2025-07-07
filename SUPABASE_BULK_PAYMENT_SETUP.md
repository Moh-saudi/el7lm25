# 🗄️ إعداد Supabase لنظام الدفع الجماعي

## 📋 الجداول المطلوبة

### 1. جدول `bulk_payments` للدفعات الجماعية

```sql
CREATE TABLE bulk_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    account_type TEXT NOT NULL CHECK (account_type IN ('club', 'academy', 'trainer', 'agent')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('geidea', 'vodafone_cash', 'etisalat_cash', 'instapay', 'bank_transfer')),
    package_type TEXT NOT NULL CHECK (package_type IN ('bulk_basic', 'bulk_premium', 'bulk_enterprise')),
    total_amount DECIMAL(10,2) NOT NULL,
    player_count INTEGER NOT NULL,
    transaction_id TEXT,
    sender_name TEXT,
    sender_account TEXT,
    receipt_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    players JSONB,
    admin_notes TEXT
);
```

### 2. إنشاء bucket للإيصالات

```sql
-- إنشاء bucket جديد
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true);

-- سياسة رفع الملفات (للمستخدمين المسجلين)
CREATE POLICY "Allow uploads for authenticated users" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'receipts' AND auth.role() = 'authenticated');

-- سياسة عرض الملفات (عامة)
CREATE POLICY "Allow public view" ON storage.objects 
FOR SELECT USING (bucket_id = 'receipts');

-- سياسة حذف الملفات (للمديرين فقط)
CREATE POLICY "Allow delete for admins" ON storage.objects 
FOR DELETE USING (bucket_id = 'receipts' AND auth.jwt() ->> 'role' = 'admin');
```

### 3. إنشاء فهارس للأداء

```sql
-- فهرس لنوع الحساب
CREATE INDEX idx_bulk_payments_account_type ON bulk_payments(account_type);

-- فهرس للحالة
CREATE INDEX idx_bulk_payments_status ON bulk_payments(status);

-- فهرس لتاريخ الإنشاء
CREATE INDEX idx_bulk_payments_created_at ON bulk_payments(created_at);

-- فهرس لطريقة الدفع
CREATE INDEX idx_bulk_payments_payment_method ON bulk_payments(payment_method);
```

### 4. Row Level Security (RLS)

```sql
-- تفعيل RLS على الجدول
ALTER TABLE bulk_payments ENABLE ROW LEVEL SECURITY;

-- سياسة عرض البيانات (المستخدم يرى دفعاته فقط)
CREATE POLICY "Users can view own payments" ON bulk_payments
FOR SELECT USING (auth.uid()::text = account_id);

-- سياسة إدراج البيانات (المستخدمون المسجلون فقط)
CREATE POLICY "Users can insert own payments" ON bulk_payments
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- سياسة تحديث البيانات (للمديرين فقط)
CREATE POLICY "Admins can update payments" ON bulk_payments
FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
```

## 🔧 متغيرات البيئة المطلوبة

أضف هذه المتغيرات في ملف `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📁 هيكل مجلد الإيصالات

سيتم تنظيم الإيصالات في Supabase Storage كالتالي:

```
receipts/
├── wallet-receipts/
│   ├── 1704123456789-abc123.jpg
│   ├── 1704123456790-def456.pdf
│   └── ...
└── bank-receipts/
    ├── 1704123456791-ghi789.jpg
    ├── 1704123456792-jkl012.pdf
    └── ...
```

## 🔍 استعلامات مفيدة للإدارة

### عرض جميع الدفعات المعلقة
```sql
SELECT 
    id,
    account_type,
    payment_method,
    total_amount,
    player_count,
    transaction_id,
    sender_name,
    created_at
FROM bulk_payments 
WHERE status = 'pending'
ORDER BY created_at DESC;
```

### إحصائيات الدفعات الجماعية
```sql
SELECT 
    account_type,
    payment_method,
    COUNT(*) as payment_count,
    SUM(total_amount) as total_revenue,
    SUM(player_count) as total_players
FROM bulk_payments 
WHERE status = 'approved'
GROUP BY account_type, payment_method
ORDER BY total_revenue DESC;
```

### الدفعات حسب الفترة الزمنية
```sql
SELECT 
    DATE(created_at) as payment_date,
    COUNT(*) as daily_payments,
    SUM(total_amount) as daily_revenue
FROM bulk_payments 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY payment_date DESC;
```

## 📋 عملية الموافقة على الدفعات

### 1. مراجعة الدفعة
```sql
-- عرض تفاصيل الدفعة
SELECT * FROM bulk_payments WHERE id = 'payment_id_here';
```

### 2. الموافقة على الدفعة
```sql
-- تحديث حالة الدفعة للموافقة
UPDATE bulk_payments 
SET 
    status = 'approved',
    updated_at = NOW(),
    admin_notes = 'تم التحقق من الإيصال وتأكيد الدفع'
WHERE id = 'payment_id_here';
```

### 3. رفض الدفعة
```sql
-- تحديث حالة الدفعة للرفض
UPDATE bulk_payments 
SET 
    status = 'rejected',
    updated_at = NOW(),
    admin_notes = 'رقم العملية غير صحيح - يرجى التواصل مع الدعم'
WHERE id = 'payment_id_here';
```

## 🚀 الخطوات التالية

1. **تشغيل الاستعلامات SQL** في Supabase SQL Editor
2. **إعداد متغيرات البيئة** في مشروع Next.js
3. **اختبار رفع الإيصالات** في الواجهة
4. **إنشاء لوحة إدارة** لمراجعة الدفعات
5. **إعداد إشعارات** عند وصول دفعات جديدة

## 📧 النماذج التلقائية

يمكن إضافة trigger لإرسال إشعارات:

```sql
-- دالة إرسال إشعار عند دفعة جديدة
CREATE OR REPLACE FUNCTION notify_new_payment()
RETURNS TRIGGER AS $$
BEGIN
    -- يمكن إضافة منطق إرسال بريد إلكتروني هنا
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- trigger عند إدراج دفعة جديدة
CREATE TRIGGER bulk_payment_notification
    AFTER INSERT ON bulk_payments
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_payment();
```

---

*تم إنشاء هذا الدليل في ${new Date().toLocaleDateString('ar-SA')}* 
