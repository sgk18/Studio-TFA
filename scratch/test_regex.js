const ID_PARAM_PATTERN = /^[a-zA-Z0-9_-]{6,80}$/;
const uuid = '919f0775-8025-46fd-94eb-73d8a149c45e';
console.log('UUID:', uuid);
console.log('Test result:', ID_PARAM_PATTERN.test(uuid));
