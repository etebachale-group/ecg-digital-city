'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('interaction_nodes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      object_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'interactive_objects',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      position: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      required_state: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      is_occupied: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      occupied_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      occupied_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      max_occupancy: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for performance
    await queryInterface.addIndex('interaction_nodes', ['object_id'], {
      name: 'idx_interaction_nodes_object'
    });
    
    await queryInterface.addIndex('interaction_nodes', ['is_occupied'], {
      name: 'idx_interaction_nodes_occupied'
    });
    
    await queryInterface.addIndex('interaction_nodes', ['occupied_by'], {
      name: 'idx_interaction_nodes_occupied_by'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('interaction_nodes');
  }
};
