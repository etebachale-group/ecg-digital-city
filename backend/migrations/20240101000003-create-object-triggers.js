'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('object_triggers', {
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
      trigger_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      trigger_data: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      priority: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      condition: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
    await queryInterface.addIndex('object_triggers', ['object_id'], {
      name: 'idx_object_triggers_object'
    });
    
    await queryInterface.addIndex('object_triggers', ['priority'], {
      name: 'idx_object_triggers_priority',
      order: [['priority', 'DESC']]
    });
    
    await queryInterface.addIndex('object_triggers', ['is_active'], {
      name: 'idx_object_triggers_active'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('object_triggers');
  }
};
