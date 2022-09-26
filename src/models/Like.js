module.exports = (sequelize, DataTypes) => {
  const Like = sequelize.define('Like', {}, { underscored: true });

  Like.associate = (db) => {
    Like.belongsTo(db.User, {
      foreignKey: {
        name: 'userId',
        allowNull: false,
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
    });
    Like.belongsTo(db.Blog, {
      foreignKey: {
        name: 'blogId',
        allowNull: false,
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
    });
  };
  return Like;
};
