module.exports = (sequelize, DataTypes) => {
  const Social = sequelize.define(
    'Social',
    {
      facebookUrl: DataTypes.STRING,
      instagramUrl: DataTypes.STRING,
    },
    { underscored: true }
  );

  Social.associate = (db) => {
    Social.belongsTo(db.User, {
      foreignKey: {
        name: 'userId',
        allowNull: false,
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
    });
  };

  return Social;
};
