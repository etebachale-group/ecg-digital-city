'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('interaction_queue', {
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
      node_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'interaction_nodes',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      position: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      joined_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Add indexes for performance
    await queryInterface.addIndex('interaction_queue', ['object_id'], {
      name: 'idx_interaction_queue_object'
    });
    
    await queryInterface.addIndex('interaction_queue', ['node_id'], {
      name: 'idx_interaction_queue_node'
    });
    
    await queryInterface.addIndex('interaction_queue', ['user_id'], {
      name: 'idx_interaction_queue_user'
    });
    
    await queryInterface.addIndex('interaction_queue', ['expires_at'], {
      name: 'idx_interaction_queue_expires'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('interaction_queue');
  }
};
