const sqlite3 = require("sqlite3");
const Promise = require("bluebird");

class AppDAO {
  constructor(dbFilePath) {
    this.db = new sqlite3.Database(dbFilePath, (err) => {
      //cần truyền vào một đường dẫn đến file csdl sqlite để khởi tạo một kết nối đến file để bắt đầu đọc ghi
      if (err) {
        console.log("Could not connect to database", err); //Kết nối chưa thành công, có lỗi
      } else {
        console.log("Connected to database"); //Đã kết nối thành công và sẵn sàng để đọc ghi DB
      }
    });
  }
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          console.log("Error running sql " + sql);
          console.log(err);
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      });
    });
  }
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, result) => {
        if (err) {
          console.log("Error running sql: " + sql);
          console.log(err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.log("Error running sql: " + sql);
          console.log(err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

class TaskHasFilesRepository {
  constructor(dao) {
    this.dao = dao;
  }
  getAll() {
    return this.dao.all(`SELECT * FROM task_has_files;`);
  }
}

class Group {
  constructor(dao) {
    this.dao = dao;
  }
  getAll() {
    return this.dao.all(`SELECT * FROM groups;`);
  }
}

class GroupHasUsersRepository {
  constructor(dao) {
    this.dao = dao;
  }
  getAll() {
    return this.dao.all(`SELECT * FROM group_has_users;`);
  }
}


class ProjectDailyColumnStatsRepository {
  constructor(dao) {
    this.dao = dao;
  }
  getAll() {
    return this.dao.all(`SELECT * FROM project_daily_column_stats;`);
  }
}

class ProjectHasGroupsRepository {
  constructor(dao) {
    this.dao = dao;
  }
  getAll() {
    return this.dao.all(`SELECT * FROM project_has_groups;`);
  }
}



module.exports = {
  AppDAO,
  TaskHasFilesRepository,
  GroupHasUsersRepository,
  Group,
  ProjectDailyColumnStatsRepository,
  ProjectHasGroupsRepository
};