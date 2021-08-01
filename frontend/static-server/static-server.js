const express = require('express');
const app = express(); // create express app

app.use(express.static('build'));

// start express server on port 5000
app.listen(8000, () => {
  console.log('Serving static react app build.');
});
