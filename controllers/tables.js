const Table = require('../models/Table');
const ErrorResponse = require('../utils/errorResponse');


exports.tables = async (req, res, next) => {
  try {
    const tables = await Table.find({});

    return res.status(200).json({success: true, tables: tables[0]});

  } catch (error) { return next(new ErrorResponse('Could not retrieve tables.', 500)); }
};


exports.update = async (req, res, next) => {
  if (!req.body.amount)
    return next(new ErrorResponse('Please provide your number of tables.'), 400);

  try {
    const tables = await Table.findOne({amount: {$lte: Number(req.body.amount)}});
    
    // for now, cannot remove tables, so only update if the provided number of tables is greater
    if (!tables)
      return next(new ErrorResponse('You cannot remove tables from the total amount yet.'), 404);

    if (tables.amount == req.body.amount)
      return next(new ErrorResponse('The amount of tables is already ' + req.body.amount + '.'), 404);
      
    tables.amount = req.body.amount;
    await tables.save();

    return res.status(200).json({success: true, tables});

  } catch (error) { return next(new ErrorResponse('Could not update tables.', 500)); }
};