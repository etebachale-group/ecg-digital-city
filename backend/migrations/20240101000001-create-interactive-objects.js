'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('interactive_objects', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      office_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'offices',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      object_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      model_path: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      position: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: { x: 0, y: 0, z: 0 }
      },
      rotation: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: { x: 0, y: 0, z: 0 }
      },
      scale: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: { x: 1, y: 1, z: 1 }
      },
      state: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      config: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
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
    await queryInterface.addIndex('interactive_objects', ['office_id'], {
      name: 'idx_interactive_objects_office'
    });
    
    await queryInterface.addIndex('interactive_objects', ['object_type'], {
      name: 'idx_interactive_objects_type'
    });
    
    await queryInterface.addIndex('interactive_objects', ['is_active'], {
      name: 'idx_interactive_objects_active'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('interactive_objects');
  }
};
