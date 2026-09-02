export const getPaymentSuccessEmailTemplate = (userName, planTypeCapitalized) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: 'Helvetica Neue', Arial, sans-serif;
                    background-color: #05070c;
                    color: #ffffff;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #111111;
                    padding: 40px;
                    border-radius: 12px;
                    border: 1px solid #1a1a1a;
                }
                h1, h2 {
                    color: #00d4aa;
                    margin-top: 0;
                }
                p {
                    color: #94a3b8;
                    line-height: 1.6;
                    font-size: 16px;
                }
                .strong-text {
                    color: #ffffff;
                    font-weight: bold;
                }
                .divider {
                    border: none;
                    border-top: 1px solid #222222;
                    margin: 30px 0;
                }
                .footer {
                    margin-top: 40px;
                    font-size: 14px;
                    color: #64748b;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Your MIN NOTE Pro Subscription is Active!</h2>
                <p>Hello <span class="strong-text">${userName}</span>,</p>
                <p>Great news! Your payment was successful.</p>
                <p>Your account has now been upgraded to the <span class="strong-text">${planTypeCapitalized} Pro Plan</span>.</p>
                <p><strong>Welcome to MIN NOTE! Start exploring your Pro features today.</strong></p>
                <p>Thank you for choosing MIN NOTE.</p>
                
                <hr class="divider">
                
                <h2>လူကြီးမင်း၏ MIN NOTE Pro အကောင့် ရရှိပါပြီ!</h2>
                <p>ဝမ်းမြောက်ပါသည်! ငွေပေးချေမှု အောင်မြင်ပါသည်။</p>
                <p>လူကြီးမင်း၏ အကောင့်ကို <span class="strong-text">${planTypeCapitalized} Pro Plan</span> သို့ အောင်မြင်စွာ ပြောင်းလဲပေးလိုက်ပါသည်။</p>
                <p><strong>MIN NOTE မှ နွေးထွေးစွာ ကြိုဆိုပါသည်။ ယခုပဲ Pro Account ၏ အထူးလုပ်ဆောင်ချက်များ ကို စတင်အသုံးပြုလိုက်ပါ။</strong></p>
                <p>MIN NOTE ကို ရွေးချယ်တဲ့အတွက် ကျေးဇူးတင်ပါသည်။</p>
                
                <div class="footer">
                    <p>Best regards,<br>The MIN NOTE Team</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const text = `
Your MIN NOTE Pro Subscription is Active!

Hello ${userName},

Great news! Your payment was successful.
Your account has now been upgraded to the ${planTypeCapitalized} Pro Plan.

Welcome to MIN NOTE! Start exploring your Pro features today.

Thank you for choosing MIN NOTE.

--------------------------------------------------

လူကြီးမင်း၏ MIN NOTE Pro အကောင့် ရရှိပါပြီ!

ဝမ်းမြောက်ပါသည်! ငွေပေးချေမှု အောင်မြင်ပါသည်။
လူကြီးမင်း၏ အကောင့်ကို ${planTypeCapitalized} Pro Plan သို့ အောင်မြင်စွာ ပြောင်းလဲပေးလိုက်ပါသည်။

MIN NOTE မှ နွေးထွေးစွာ ကြိုဆိုပါသည်။ ယခုပဲ Pro Account ၏ အထူးလုပ်ဆောင်ချက်များ ကို စတင်အသုံးပြုလိုက်ပါ။

MIN NOTE ကို ရွေးချယ်တဲ့အတွက် ကျေးဇူးတင်ပါသည်။

Best regards,
The MIN NOTE Team
    `;

    return { html, text };
};

const rejectionReasonMapping = {
    'invalid_slip': { en: "Invalid or fake payment slip image", mm: "ငွေလွှဲပြေစာ ပုံမမှန်ကန်ပါ (သို့) အတုဖြစ်နေပါသည်" },
    'not_found': { en: "Transaction could not be found", mm: "ငွေလွှဲမှတ်တမ်း ရှာမတွေ့ပါ" },
    'incorrect_amount': { en: "Incorrect transfer amount", mm: "ငွေလွှဲပမာဏ မမှန်ကန်ပါ" },
    'duplicate': { en: "Duplicate payment submission", mm: "ယခင်တင်ထားသော ပြေစာနှင့် ထပ်နေပါသည်" },
    'unclear_image': { en: "Unclear or blurry image", mm: "ပြေစာသည် မှုန်ဝါးနေပြီး ဖတ်မရပါ" },
    'wrong_account': { en: "Incorrect Bank/Account Number", mm: "ဘဏ် (သို့) အကောင့်နံပါတ် မှားယွင်းနေပါသည်" }
};

export const getPaymentFailedEmailTemplate = (userName, rejectionReason) => {
    let friendlyReasonEn = "Payment could not be verified";
    let friendlyReasonMm = "ငွေပေးချေမှုကို အတည်ပြု၍ မရပါ";

    if (rejectionReason) {
        if (rejectionReason.startsWith('custom:')) {
            const customText = rejectionReason.replace(/^custom:\s*/i, '').trim();
            friendlyReasonEn = customText;
            friendlyReasonMm = customText;
        } else if (rejectionReasonMapping[rejectionReason]) {
            friendlyReasonEn = rejectionReasonMapping[rejectionReason].en;
            friendlyReasonMm = rejectionReasonMapping[rejectionReason].mm;
        }
    }

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: 'Helvetica Neue', Arial, sans-serif;
                    background-color: #05070c;
                    color: #ffffff;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #111111;
                    padding: 40px;
                    border-radius: 12px;
                    border: 1px solid #1a1a1a;
                }
                h1, h2 {
                    color: #ff4d4f;
                    margin-top: 0;
                }
                p {
                    color: #94a3b8;
                    line-height: 1.6;
                    font-size: 16px;
                }
                .strong-text {
                    color: #ffffff;
                    font-weight: bold;
                }
                .reason-box {
                    color: #ff4d4f;
                    padding: 12px 16px;
                    background: rgba(255, 77, 79, 0.1);
                    border-radius: 8px;
                    border: 1px solid rgba(255, 77, 79, 0.2);
                    margin: 20px 0;
                }
                .divider {
                    border: none;
                    border-top: 1px solid #222222;
                    margin: 30px 0;
                }
                .footer {
                    margin-top: 40px;
                    font-size: 14px;
                    color: #64748b;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Update regarding your MIN NOTE Payment Proof</h2>
                <p>Hello <span class="strong-text">${userName}</span>,</p>
                <p>We encountered an issue while verifying the payment proof you submitted.</p>
                <p>Unfortunately, we could not confirm the transaction for the following reason:</p>
                
                <div class="reason-box">
                    <span class="strong-text">${friendlyReasonEn}</span>
                </div>
                
                <p>Please contact our support team or re-submit a valid screenshot of the successful KPay transfer.</p>
                
                <hr class="divider">
                
                <h2>MIN NOTE ငွေပေးချေမှု အခြေအနေ</h2>
                <p>လူကြီးမင်း တင်သွင်းထားသော KPay ငွေလွှဲမှတ်တမ်းကို စစ်ဆေးရာတွင် အောက်ပါအကြောင်းအရင်းကြောင့် အခက်အခဲရှိနေပါသည်။</p>
                
                <div class="reason-box">
                    <span class="strong-text">${friendlyReasonMm}</span>
                </div>
                
                <p>ကျေးဇူးပြု၍ မှန်ကန်သော ငွေလွှဲပြေစာအား ပြန်လည်တင်သွင်းပေးပါရန် သို့မဟုတ် Customer Support သို့ ဆက်သွယ်ပေးပါရန် မေတ္တာရပ်ခံအပ်ပါသည်။</p>
                
                <div class="footer">
                    <p>Best regards,<br>The MIN NOTE Team</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const text = `
Update regarding your MIN NOTE Payment Proof

Hello ${userName},

We encountered an issue while verifying the payment proof you submitted.
Unfortunately, we could not confirm the transaction for the following reason:
${friendlyReasonEn}

Please contact our support team or re-submit a valid screenshot of the successful KPay transfer.

--------------------------------------------------

MIN NOTE ငွေပေးချေမှု အခြေအနေ

လူကြီးမင်း တင်သွင်းထားသော KPay ငွေလွှဲမှတ်တမ်းကို စစ်ဆေးရာတွင် အောက်ပါအကြောင်းအရင်းကြောင့် အခက်အခဲရှိနေပါသည်။
${friendlyReasonMm}

ကျေးဇူးပြု၍ မှန်ကန်သော ငွေလွှဲပြေစာအား ပြန်လည်တင်သွင်းပေးပါရန် သို့မဟုတ် Customer Support သို့ ဆက်သွယ်ပေးပါရန် မေတ္တာရပ်ခံအပ်ပါသည်။

Best regards,
The MIN NOTE Team
    `;

    return { html, text };
};

export const getExpirationReminderTemplate = (userName) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: 'Helvetica Neue', Arial, sans-serif;
                    background-color: #05070c;
                    color: #ffffff;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #111111;
                    padding: 40px;

                    border-radius: 12px;
                    border: 1px solid #1a1a1a;
                }
                h1, h2 {
                    color: #f59e0b;
                    margin-top: 0;
                }
                p {
                    color: #94a3b8;
                    line-height: 1.6;
                    font-size: 16px;
                }
                .strong-text {
                    color: #ffffff;
                    font-weight: bold;
                }
                .divider {
                    border: none;
                    border-top: 1px solid #222222;
                    margin: 30px 0;
                }
                .footer {
                    margin-top: 40px;
                    font-size: 14px;
                    color: #64748b;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Your Pro Plan Expires in 3 Days!</h2>
                <p>Hello <span class="strong-text">${userName}</span>,</p>
                <p>Your MIN NOTE Pro plan will expire in exactly 3 days.</p>
                <p>To maintain uninterrupted access to unlimited notes and premium features, please log in and upload a new KPay slip or complete a Stripe payment from your dashboard.</p>
                <p>Thank you for choosing MIN NOTE.</p>
                
                <hr class="divider">
                
                <h2>လူကြီးမင်း၏ Pro အကောင့် ၃ ရက်အတွင်း သက်တမ်းကုန်ဆုံးပါမည်!</h2>
                <p>လူကြီးမင်း၏ MIN NOTE Pro အကောင့်သည် နောက် ၃ ရက်အကြာတွင် သက်တမ်းကုန်ဆုံးတော့မည်ဖြစ်ပါသည်။</p>
                <p>အထူးလုပ်ဆောင်ချက်များနှင့် မှတ်စုများကို အကန့်အသတ်မရှိ ဆက်လက်အသုံးပြုနိုင်ရန် ကျေးဇူးပြု၍ မိမိ၏ အကောင့်သို့ ဝင်ရောက်ပြီး KPay ငွေလွှဲပြေစာအသစ် (သို့) Stripe ဖြင့် ငွေပေးချေမှုကို ပြုလုပ်ပေးပါရန် မေတ္တာရပ်ခံအပ်ပါသည်။</p>
                
                <div class="footer">
                    <p>Best regards,<br>The MIN NOTE Team</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const text = `
Your Pro Plan Expires in 3 Days!

Hello ${userName},

Your MIN NOTE Pro plan will expire in exactly 3 days.
To maintain uninterrupted access to unlimited notes and premium features, please log in and upload a new KPay slip or complete a Stripe payment from your dashboard.

Thank you for choosing MIN NOTE.

--------------------------------------------------

လူကြီးမင်း၏ Pro အကောင့် ၃ ရက်အတွင်း သက်တမ်းကုန်ဆုံးပါမည်!

လူကြီးမင်း၏ MIN NOTE Pro အကောင့်သည် နောက် ၃ ရက်အကြာတွင် သက်တမ်းကုန်ဆုံးတော့မည်ဖြစ်ပါသည်။
အထူးလုပ်ဆောင်ချက်များနှင့် မှတ်စုများကို အကန့်အသတ်မရှိ ဆက်လက်အသုံးပြုနိုင်ရန် ကျေးဇူးပြု၍ မိမိ၏ အကောင့်သို့ ဝင်ရောက်ပြီး KPay ငွေလွှဲပြေစာအသစ် (သို့) Stripe ဖြင့် ငွေပေးချေမှုကို ပြုလုပ်ပေးပါရန် မေတ္တာရပ်ခံအပ်ပါသည်။

Best regards,
The MIN NOTE Team
    `;

    return { html, text };
};
