const User = require('./User');
const Avatar = require('./Avatar');
const Company = require('./Company');
const Office = require('./Office');
const District = require('./District');
const OfficeObject = require('./OfficeObject');
const Permission = require('./Permission');
const Achievement = require('./Achievement');
const UserAchievement = require('./UserAchievement');
const UserProgress = require('./UserProgress');
const Mission = require('./Mission');
const UserMission = require('./UserMission');
const Event = require('./Event');
const EventAttendee = require('./EventAttendee');
const InteractiveObject = require('./InteractiveObject');
const InteractionNode = require('./InteractionNode');
const ObjectTrigger = require('./ObjectTrigger');
const InteractionQueue = require('./InteractionQueue');
const InteractionLog = require('./InteractionLog');

// Definir asociaciones

// User - Avatar (1:1)
User.hasOne(Avatar, { foreignKey: 'userId', as: 'avatar' });
Avatar.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User - Company (1:N como owner)
User.hasMany(Company, { foreignKey: 'ownerId', as: 'ownedCompanies' });
Company.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// Company - Office (1:N)
Company.hasMany(Office, { foreignKey: 'companyId', as: 'offices' });
Office.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

// District - Office (1:N)
District.hasMany(Office, { foreignKey: 'districtId', as: 'offices' });
Office.belongsTo(District, { foreignKey: 'districtId', as: 'district' });

// Office - OfficeObject (1:N)
Office.hasMany(OfficeObject, { foreignKey: 'officeId', as: 'objects' });
OfficeObject.belongsTo(Office, { foreignKey: 'officeId', as: 'office' });

// User - OfficeObject (1:N como creator)
User.hasMany(OfficeObject, { foreignKey: 'createdBy', as: 'createdObjects' });
OfficeObject.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// User - Permission (N:M through Permission)
User.hasMany(Permission, { foreignKey: 'userId', as: 'permissions' });
Permission.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Office - Permission (N:M through Permission)
Office.hasMany(Permission, { foreignKey: 'officeId', as: 'permissions' });
Permission.belongsTo(Office, { foreignKey: 'officeId', as: 'office' });

// User - UserProgress (1:1)
User.hasOne(UserProgress, { foreignKey: 'userId', as: 'progress' });
UserProgress.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User - Achievement (N:M through UserAchievement)
User.belongsToMany(Achievement, { through: UserAchievement, foreignKey: 'userId', as: 'achievements' });
Achievement.belongsToMany(User, { through: UserAchievement, foreignKey: 'achievementId', as: 'users' });

// Direct associations for UserAchievement
UserAchievement.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserAchievement.belongsTo(Achievement, { foreignKey: 'achievementId', as: 'achievement' });
User.hasMany(UserAchievement, { foreignKey: 'userId', as: 'userAchievements' });
Achievement.hasMany(UserAchievement, { foreignKey: 'achievementId', as: 'userAchievements' });

// User - Mission (N:M through UserMission)
User.belongsToMany(Mission, { through: UserMission, foreignKey: 'userId', as: 'missions' });
Mission.belongsToMany(User, { through: UserMission, foreignKey: 'missionId', as: 'users' });

// Direct associations for UserMission
UserMission.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserMission.belongsTo(Mission, { foreignKey: 'missionId', as: 'mission' });
User.hasMany(UserMission, { foreignKey: 'userId', as: 'userMissions' });
Mission.hasMany(UserMission, { foreignKey: 'missionId', as: 'userMissions' });

// User - Event (1:N as organizer)
User.hasMany(Event, { foreignKey: 'organizerId', as: 'organizedEvents' });
Event.belongsTo(User, { foreignKey: 'organizerId', as: 'organizer' });

// User - Event (N:M through EventAttendee)
User.belongsToMany(Event, { through: EventAttendee, foreignKey: 'userId', as: 'attendingEvents' });
Event.belongsToMany(User, { through: EventAttendee, foreignKey: 'eventId', as: 'attendees' });

// Direct associations for EventAttendee
EventAttendee.belongsTo(User, { foreignKey: 'userId', as: 'user' });
EventAttendee.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
User.hasMany(EventAttendee, { foreignKey: 'userId', as: 'eventAttendances' });
Event.hasMany(EventAttendee, { foreignKey: 'eventId', as: 'eventAttendances' });

// Office - InteractiveObject (1:N)
Office.hasMany(InteractiveObject, { foreignKey: 'officeId', as: 'interactiveObjects' });
InteractiveObject.belongsTo(Office, { foreignKey: 'officeId', as: 'office' });

// User - InteractiveObject (1:N as creator)
User.hasMany(InteractiveObject, { foreignKey: 'createdBy', as: 'createdInteractiveObjects' });
InteractiveObject.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// InteractiveObject - InteractionNode (1:N)
InteractiveObject.hasMany(InteractionNode, { foreignKey: 'objectId', as: 'nodes' });
InteractionNode.belongsTo(InteractiveObject, { foreignKey: 'objectId', as: 'object' });

// User - InteractionNode (1:N as occupant)
User.hasMany(InteractionNode, { foreignKey: 'occupiedBy', as: 'occupiedNodes' });
InteractionNode.belongsTo(User, { foreignKey: 'occupiedBy', as: 'occupant' });

// InteractiveObject - ObjectTrigger (1:N)
InteractiveObject.hasMany(ObjectTrigger, { foreignKey: 'objectId', as: 'triggers' });
ObjectTrigger.belongsTo(InteractiveObject, { foreignKey: 'objectId', as: 'object' });

// InteractiveObject - InteractionQueue (1:N)
InteractiveObject.hasMany(InteractionQueue, { foreignKey: 'objectId', as: 'queue' });
InteractionQueue.belongsTo(InteractiveObject, { foreignKey: 'objectId', as: 'object' });

// InteractionNode - InteractionQueue (1:N)
InteractionNode.hasMany(InteractionQueue, { foreignKey: 'nodeId', as: 'queue' });
InteractionQueue.belongsTo(InteractionNode, { foreignKey: 'nodeId', as: 'node' });

// User - InteractionQueue (1:N)
User.hasMany(InteractionQueue, { foreignKey: 'userId', as: 'queueEntries' });
InteractionQueue.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User - InteractionLog (1:N)
User.hasMany(InteractionLog, { foreignKey: 'userId', as: 'interactionLogs' });
InteractionLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// InteractiveObject - InteractionLog (1:N)
InteractiveObject.hasMany(InteractionLog, { foreignKey: 'objectId', as: 'logs' });
InteractionLog.belongsTo(InteractiveObject, { foreignKey: 'objectId', as: 'object' });

// Avatar - InteractiveObject (N:1 for interactingWith)
Avatar.belongsTo(InteractiveObject, { foreignKey: 'interactingWith', as: 'currentInteraction' });

// Avatar - InteractionNode (N:1 for sittingAt)
Avatar.belongsTo(InteractionNode, { foreignKey: 'sittingAt', as: 'currentSeat' });

module.exports = {
  User,
  Avatar,
  Company,
  Office,
  District,
  OfficeObject,
  Permission,
  Achievement,
  UserAchievement,
  UserProgress,
  Mission,
  UserMission,
  Event,
  EventAttendee,
  InteractiveObject,
  InteractionNode,
  ObjectTrigger,
  InteractionQueue,
  InteractionLog
};
