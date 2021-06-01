const Table = require('../models/Table');
const ErrorResponse = require('../utils/errorResponse');


exports.tables = async (req, res, next) => {
  try {
    const tables = await Table.find({});

    return res.status(200).json({success: true, tables: tables[0]});

  } catch (error) { return next(new ErrorResponse('Erreur de récupération des tables.', 500)); }
};


exports.update = async (req, res, next) => {
  if (!req.body.amount)
    return next(new ErrorResponse('Veuillez fournir un nombre de tables.'), 400);

  try {
    const tables = await Table.findOne({amount: {$lte: Number(req.body.amount)}});
    
    // for now, cannot remove tables, so only update if the provided number of tables is greater
    if (!tables)
      return next(new ErrorResponse("Vous ne pouvez pas réduire le nombre de tables pour l'instant."), 404);

    if (tables.amount == req.body.amount)
      return next(new ErrorResponse(`Le nombre de tables est déjà de ${req.body.amount}.`), 404);
      
    tables.amount = req.body.amount;
    await tables.save();

    return res.status(200).json({success: true, tables});

  } catch (error) { return next(new ErrorResponse('Erreur de modification des tables.', 500)); }
};