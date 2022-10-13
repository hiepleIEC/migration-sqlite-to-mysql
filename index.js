require('dotenv').config()
const query = require('./connect-mysql');
const { AppDAO, TaskHasFilesRepository, GroupHasUsersRepository, Group, ProjectDailyColumnStatsRepository, ProjectHasGroupsRepository } = require("./connect-sqlite");
(async () => {
  try {
    const dao = new AppDAO("./db.sqlite");
    const taskHasFilesRepo = new TaskHasFilesRepository(dao);
    const groupHasUsersRepo = new GroupHasUsersRepository(dao);
    const groupRepo = new Group(dao);
    const projectDailyColumnStatsRepo = new ProjectDailyColumnStatsRepository(dao);
    const projectHasGroupsRepo = new ProjectHasGroupsRepository(dao);
    const listTaskHasFiles = (await taskHasFilesRepo.getAll()).map(el => Object.values(el));
    const listGroupHasUsers = (await groupHasUsersRepo.getAll()).map(el => Object.values(el));
    const listGroup = (await groupRepo.getAll()).map(el => Object.values(el));
    const listProjectDailyColumnStats = (await projectDailyColumnStatsRepo.getAll()).map(el => Object.values(el));
    const listProjectHasGroup = (await projectHasGroupsRepo.getAll()).map(el => Object.values(el));
    // insert task_has_files
    const sqlTaskHasFiles = "INSERT INTO task_has_files VALUES ?;";
    await query(sqlTaskHasFiles, [listTaskHasFiles]);
    // insert group
    const sqlGroup = `INSERT INTO ${process.env.DB_DATABASE_NAME}.groups VALUES ?;`;
    await query(sqlGroup, [listGroup]);
    // insert group_has_users
    const sqlGroupHasUsers = "INSERT INTO group_has_users VALUES ?;";
    await query(sqlGroupHasUsers, [listGroupHasUsers]);
    // insert project_daily_column_stats
    const sqlProjectDailyColumnStats = `INSERT INTO ${process.env.DB_DATABASE_NAME}.project_daily_column_stats VALUES ?;`;
    await query(sqlProjectDailyColumnStats, [listProjectDailyColumnStats]);
    // insert project_has_groups
    const sqlProjectHasGroups = `INSERT INTO ${process.env.DB_DATABASE_NAME}.project_has_groups VALUES ?;`;
    await query(sqlProjectHasGroups, [listProjectHasGroup]);
  } catch (error) {
    console.log(error.message);
  }
})()

