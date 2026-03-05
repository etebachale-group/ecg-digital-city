'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns to avatars table
    await queryInterface.addColumn('avatars', 'current_state', {
      type: Sequelize.STRING(50),
      defaultValue: 'idle',
      allowNull: false
    });
    
    await queryInterface.addColumn('avatars', 'previous_state', {
      type: Sequelize.STRING(50),
      allowNull: true
    });
    
    await queryInterface.addColumn('avatars', 'state_changed_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    await queryInterface.addColumn('avatars', 'interacting_with', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'interactive_objects',
        key: 'id'
      },
      onDelete: 'SET NULL'
    });
    
    await queryInterface.addColumn('avatars', 'sitting_at', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'interaction_nodes',
        key: 'id'
      },
      onDelete: 'SET NULL'
    });

    // Add indexes for performance
    await queryInterface.addIndex('avatars', ['current_state'], {
      name: 'idx_avatars_state'
    });
    
    await queryInterface.addIndex('avatars', ['interacting_with'], {
      name: 'idx_avatars_interacting_with'
    });
    
    await queryInterface.addIndex('avatars', ['sitting_at'], {
      name: 'idx_avatars_sitting_at'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes first
    await queryInterface.removeIndex('avatars', 'idx_avatars_state');
    await queryInterface.removeIndex('avatars', 'idx_avatars_interacting_with');
    await queryInterface.removeIndex('avatars', 'idx_avatars_sitting_at');
    
    // Remove columns
    await queryInterface.removeColumn('avatars', 'current_state');
    await queryInterface.removeColumn('avatars', 'previous_state');
    await queryInterface.removeColumn('avatars', 'state_changed_at');
    await queryInterface.removeColumn('avatars', 'interacting_with');
    await queryInterface.removeColumn('avatars', 'sitting_at');
  }
};
