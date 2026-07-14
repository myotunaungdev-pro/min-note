const fs = require('fs');

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

const updates = [
    { file: 'd:/premium-note-taking-app/frontend/src/locales/en.json', text: 'Pro Plan ✨' },
    { file: 'd:/premium-note-taking-app/frontend/src/locales/my.json', text: 'ပရို အစီအစဉ် ✨' },
    { file: 'd:/premium-note-taking-app/frontend/src/locales/th.json', text: 'แพ็กเกจโปร ✨' }
];

updates.forEach(u => {
    addTranslation(u.file, 'sidebar.proPlan', u.text);
});
