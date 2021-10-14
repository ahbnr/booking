const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const app = express(); // create express app

app.use(compression());
app.use(helmet());

const servedDirPrefix = process.cwd() + '/build';
const servedDirPrefixLength = servedDirPrefix.length;

app.use(
  express.static(servedDirPrefix, {
    cacheControl: true,
    // https://create-react-app.dev/docs/production-build/#static-file-caching
    setHeaders: function (res, path) {
      if (path.startsWith('/static', servedDirPrefixLength)) {
        res.setHeader('Cache-Control', 'Cache-Control: max-age=31536000');
      } else {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  })
);

app.listen(process.env.PORT || 8000, () => {
  console.log('Serving static react app build.');
});
