'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('interaction_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
      object_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'interactive_objects',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      interaction_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      success: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      xp_granted: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for performance
    await queryInterface.addIndex('interaction_logs', ['user_id'], {
      name: 'idx_interaction_logs_user'
    });
    
    await queryInterface.addIndex('interaction_logs', ['object_id'], {
      name: 'idx_interaction_logs_object'
    });
    
    await queryInterface.addIndex('interaction_logs', ['timestamp'], {
      name: 'idx_interaction_logs_timestamp',
      order: [['timestamp', 'DESC']]
    });
    
    await queryInterface.addIndex('interaction_logs', ['success'], {
      name: 'idx_interaction_logs_success'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('interaction_logs');
  }
};
