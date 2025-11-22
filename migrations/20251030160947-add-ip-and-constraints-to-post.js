'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.addColumn('Posts', 'ip', {
    type: Sequelize.STRING,
    allowNull: true, 
  });

  await queryInterface.changeColumn('Posts', 'title', {
    type: Sequelize.STRING,
    allowNull: false,
  });
  await queryInterface.changeColumn('Posts', 'description', {
    type: Sequelize.TEXT,
    allowNull: false,
  });
  await queryInterface.changeColumn('Posts', 'author', {
    type: Sequelize.STRING,
    allowNull: false,
  });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Posts', 'ip');

    await queryInterface.changeColumn('Posts', 'title', {
      type: Sequelize.STRING,
      allowNull: true, 
    });
    await queryInterface.changeColumn('Posts', 'description', {
      type: Sequelize.TEXT,
      allowNull: true, 
    });
    await queryInterface.changeColumn('Posts', 'author', {
      type: Sequelize.STRING,
      allowNull: true, 
    });
  }
};
