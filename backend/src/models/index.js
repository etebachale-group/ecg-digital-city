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
  EventAttendee
};
