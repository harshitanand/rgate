'use strict';

const express = require('express');

const app = express();
app.get('/list', (req, res) => {
  return res.status(200).json({
    orderId: '6JKJD637892JBJHGD',
    amount: 300,
    currency: 'USD',
  });
});

app.listen(3001);
