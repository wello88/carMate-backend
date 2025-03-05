// // db/associations.js

// /**
//  * This file handles all model associations in one place
//  * to avoid circular dependencies and duplicate aliases
//  */

// export const setupAssociations = async () => {
//   // Dynamically import all models to prevent circular dependencies
//   const [
//     { default: User },
//     { default: Worker },
//     { default: Post },
//     { default: Offer },
//     { default: Session }
//   ] = await Promise.all([
//     import('./models/user.model.js'),
//     import('./models/worker.model.js'),
//     import('./models/mobilepost.model.js'),
//     import('./models/offer.model.js'),
//     import('./models/session.model.js')
//   ]);

//   // User associations
//   User.hasOne(Worker, { foreignKey: 'id' });
//   User.hasMany(Session, { foreignKey: 'userId', onDelete: 'CASCADE' });
//   User.hasMany(Offer, { foreignKey: 'workerId', as: 'userOffers' });
  
//   // Worker associations
//   Worker.belongsTo(User, { foreignKey: 'id', onDelete: 'CASCADE' });
//   Worker.hasMany(Offer, { foreignKey: 'workerId', as: 'offers' });
//   Worker.hasMany(Session, { foreignKey: 'workerId', as: 'sessions' });
  
//   // Post associations
//   Post.hasMany(Session, { foreignKey: 'postId', onDelete: 'CASCADE' });
//   Post.hasMany(Offer, { foreignKey: 'postId', as: 'postOffers' });
  
//   // Offer associations
//   Offer.belongsTo(Worker, { foreignKey: 'workerId', as: 'worker', onDelete: 'CASCADE' });
//   Offer.belongsTo(Post, { foreignKey: 'postId', as: 'post', onDelete: 'CASCADE' });
//   Offer.belongsTo(User, { foreignKey: 'workerId', as: 'user', onDelete: 'CASCADE' });
//   Offer.hasMany(Session, { foreignKey: 'offerId', as: 'offerSessions' });
  
//   // Session associations
//   Session.belongsTo(User, { foreignKey: 'userId', as: 'user' });
//   Session.belongsTo(Worker, { foreignKey: 'workerId', as: 'worker' });
//   Session.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
//   Session.belongsTo(Offer, { foreignKey: 'offerId', as: 'offer' });
  
//   // Add other model associations here as needed
// };