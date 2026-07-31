const fs = require('fs');
const path = require('path');

const addTranslation = (file, keyPath, value) => {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const keys = keyPath.split('.');
    let current = data;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log(`Updated ${file} with ${keyPath}`);
};

const locales = [
    { file: path.join(__dirname, '../src/locales/en.json') },
    { file: path.join(__dirname, '../src/locales/my.json') },
    { file: path.join(__dirname, '../src/locales/th.json') }
];

const newStrings = {
    'billing.manageSubscription': 'Manage Subscription',
    'billing.currentPlan': 'Current Plan',
    'billing.proPlan': 'Pro Plan ✨',
    'billing.nextBillingDate': 'Next Billing Date',
    'billing.cancelWarning': 'Are you sure you want to cancel? You will lose access to all premium features at the end of your current billing cycle.',
    'billing.cancelSubscriptionBtn': 'Cancel Subscription',
    'billing.cancelSuccess': 'Subscription successfully canceled.',
    'billing.cancelError': 'Failed to cancel subscription.'
};

locales.forEach(l => {
    Object.entries(newStrings).forEach(([keyPath, text]) => {
        addTranslation(l.file, keyPath, text);
    });
});
