const Table = require('../models/Table');


exports.tables = async (req, res, next) => {
  try {
    const tables = await Table.find({});

    return res.status(200).json({success: true, tables: tables[0]});

  } catch (error) { return next(new ErrorResponse('Could not retrieve tables.', 500)); }
};


exports.update = async (req, res, next) => {
  try {
    // for now, cannot remove tables, so only update if the provided number of tables is greater
    const tables = await Table.updateOne({amount: {$lt: req.body.amount}}, {amount: req.body.amount});

    return res.status(200).json({success: true, tables: {amount: req.body.amount}});

  } catch (error) { return next(new ErrorResponse('Could not update tables.', 500)); }
};