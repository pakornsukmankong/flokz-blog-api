module.exports = (sequelize, DataTypes) => {
  const Categories = sequelize.define(
    'Categories',
    {
      categoryName: DataTypes.STRING,
    },
    { underscored: true }
  );

  Categories.associate = (db) => {
    Categories.hasOne(db.Blog, {
      foreignKey: {
        name: 'categoryId',
        allowNull: false,
      },
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
    });
  };

  return Categories;
};
