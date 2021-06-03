import express from 'express';
import jsonErrorHandler from '../src';

const app = express();

app.use(jsonErrorHandler());

app.get('/', function (req, res) {
  throw new Error('Something wrong!');
});

app.listen(() => {
  console.log('application started.');
});
