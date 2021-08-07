// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
const express = require('express');
// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
const compression = require('compression');
const app = express(); // create express app

app.use(compression());
app.use(express.static('build'));

// start express server on port 5000
app.listen(8000, () => {
  console.log('Serving static react app build.');
});
