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
                <p><strong>Welcome to MIN NOTE Pro! Start exploring your Pro features today.</strong></p>
                <p>Thank you for choosing MIN NOTE.</p>
                
                <hr class="divider">
                
                <h2>လူကြီးမင်း၏ MIN NOTE Pro အကောင့် ရရှိပါပြီ!</h2>
                <p>ဝမ်းမြောက်ပါသည်! ငွေပေးချေမှု အောင်မြင်ပါသည်။</p>
                <p>လူကြီးမင်း၏ အကောင့်ကို <span class="strong-text">${planTypeCapitalized} Pro Plan</span> သို့ အောင်မြင်စွာ ပြောင်းလဲပေးလိုက်ပါသည်။</p>
                <p><strong>MIN NOTE Pro မှ နွေးထွေးစွာ ကြိုဆိုပါသည်။ ယခုပဲ Pro Account ၏ အထူးလုပ်ဆောင်ချက်များ ကို စတင်အသုံးပြုလိုက်ပါ။</strong></p>
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

Welcome to MIN NOTE Pro! Start exploring your Pro features today.

Thank you for choosing MIN NOTE.

--------------------------------------------------

လူကြီးမင်း၏ MIN NOTE Pro အကောင့် ရရှိပါပြီ!

ဝမ်းမြောက်ပါသည်! ငွေပေးချေမှု အောင်မြင်ပါသည်။
လူကြီးမင်း၏ အကောင့်ကို ${planTypeCapitalized} Pro Plan သို့ အောင်မြင်စွာ ပြောင်းလဲပေးလိုက်ပါသည်။

MIN NOTE Pro မှ နွေးထွေးစွာ ကြိုဆိုပါသည်။ ယခုပဲ Pro Account ၏ အထူးလုပ်ဆောင်ချက်များ ကို စတင်အသုံးပြုလိုက်ပါ။

MIN NOTE ကို ရွေးချယ်တဲ့အတွက် ကျေးဇူးတင်ပါသည်။

Best regards,
The MIN NOTE Team
    `;

    return { html, text };
};
