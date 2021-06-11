const Dish = require('../models/Dish');
const ErrorResponse = require('../utils/errorResponse');


exports.dishes = async (req, res, next) => {
  try {
    const dishes = await Dish.find({});
    return res.status(200).json({success: true, dishes});

  } catch (error) { return next(new ErrorResponse('Erreur de récupération du menu.', 500)); }
};


exports.create = async (req, res, next) => {
  const {name, type, image, price, stock, detail} = req.body;

  if (!name || !type || price === null)
    return next(new ErrorResponse('Veuillez remplir tous les champs nécessaires.', 400));

    
  try {
    const dish = await Dish.create({
      name,
      type,
      image,
      price,
      stock,
      detail,
      currency: 'EUR',
      available: stock !== 0,
    });
      
    return res.status(200).json({success: true, dish});

  } catch (error) { return next(new ErrorResponse('Erreur de création du plat.', 500)); }
};


exports.update = async (req, res, next) => {
  const {name, type, image, price, stock, detail} = req.body;

  if (!name || !type || price === null)
    return next(new ErrorResponse('Veuillez remplir tous les champs nécessaires.', 400));
  
  if (!req.params.id)
    return next(new ErrorResponse('Erreur de modification du plat.', 400));


  try { 
    const dish = await Dish.findById(req.params.id);

    if (!dish)
      return next(new ErrorResponse("Ce plat n'existe plus.", 404));

    dish.name = name;
    dish.type = type;
    dish.image = image;
    dish.price = price;
    dish.stock = stock;
    dish.detail = detail;

    dish.save();
    return res.status(200).json({success: true, dish});
    
  } catch (error) { return next(new ErrorResponse('Erreur de modification du plat.', 500)); }
};


exports.remove = async (req, res, next) => {
  if (!req.params.id)
    return next(new ErrorResponse('Erreur de suppression du plat.', 400));

  try {
    await Dish.findByIdAndDelete(req.params.id);

    return res.status(200).json({success: true});
    
  } catch (error) { return next(new ErrorResponse('Erreur de suppression du plat.', 500)); }
};