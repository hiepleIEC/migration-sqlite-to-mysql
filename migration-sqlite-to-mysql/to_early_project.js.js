require('dotenv').config();
const { requestKanboard } = require("./utils");
const PROJECT_ID_FOR_SEARCH = process.env.PROJECT_ID_FOR_SEARCH;
const SWIMLANE_ID = process.env.SWIMLANE_ID;
const PROJECT_ID = process.env.PROJECT_ID;
(async () => {
  try {
    // get task 
    const tasksByAllGame = [];
    const memoSwimlaneName = {};
    const tasksSwimlane = (await requestKanboard("getAllTasks", {
      "project_id": PROJECT_ID_FOR_SEARCH,
      "status_id": 1
    })).filter(el => el.swimlane_id === SWIMLANE_ID);
    const listSwimlaneName = tasksSwimlane.reduce((acc, el) => {
      const listMatch = el.title.match(/([A-Z]{3,})/)
      if (Array.isArray(listMatch) && listMatch[0] && !(listMatch[0] in memoSwimlaneName)) {
        const index = acc.push(listMatch[0])
        tasksByAllGame.push([])
        memoSwimlaneName[listMatch[0]] = index - 1;
      }
      return acc;
    }, []);
    const memoIds = [];
    for (let i = 0; i < listSwimlaneName.length; i++) {
      const name = listSwimlaneName[i];
      const index = memoSwimlaneName[name];
      const taskGame = tasksSwimlane.filter(el => {
        let flag = false;
        const listMatch = el.title.match(/([A-Z]{3,})/)
        if (Array.isArray(listMatch)) {
          flag = listMatch.includes(name)
          if (flag) memoIds.push(el.id)
        }
        return flag
      })
      tasksByAllGame[index] = taskGame;
    }


    // move task unknow
    const listTaskUnknow = tasksSwimlane.filter(el => !memoIds.includes(el.id));
    const swimlaneUnknowId = await requestKanboard("addSwimlane", [
      PROJECT_ID,
      'Unknown'
    ])
    await Promise.all(listTaskUnknow.map(task => requestKanboard("moveTaskToProject", [
      task.id,
      PROJECT_ID,
      swimlaneUnknowId,
      task.column_id,
      task.category_id
    ])))



    // move task know
    for (let i = 0; i < tasksByAllGame.length; i++) {
      const listTaskByGame = tasksByAllGame[i];
      const name = listSwimlaneName[i];
      if (listTaskByGame.length > 0) {
        const swimlaneId = await requestKanboard("addSwimlane", [
          PROJECT_ID,
          name
        ])
        await Promise.all(listTaskByGame.map(task => requestKanboard("moveTaskToProject", [
          task.id,
          PROJECT_ID,
          swimlaneId,
          task.column_id,
          task.category_id
        ])));
      }
    }
  } catch (error) {
    console.error(error);
  }
})();
