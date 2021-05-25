const mongoose = require('mongoose');


const TableSchema = new mongoose.Schema({
  tables: {
    type: Number,
    required: [true]
  }
});

const Table = mongoose.model('Table', TableSchema, 'tables');
module.exports = Table;