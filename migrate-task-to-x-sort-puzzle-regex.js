require('dotenv').config();
const { requestKanboard, createFile } = require("./utils");
const listSwimlaneName = ['BSP', 'WSP', 'SSP', 'BSC'].reduce((acc, el) => {
  const iosName = el + ' iOS';
  const androidName = el + ' Android';
  acc.push(iosName, androidName);
  return acc;
}, []);
const listSwimlaneNameOriginal = ['BSP', 'WSP', 'SSP', 'BSCWP', 'BSC'];
const PROJECT_ID_FOR_SEARCH = process.env.PROJECT_ID_FOR_SEARCH;
const SWIMLANE_ID = process.env.SWIMLANE_ID;
const PROJECT_ID = process.env.PROJECT_ID;

(async () => {
  try {

    // get task 
    const tasksSwimlane = (await requestKanboard("getAllTasks", {
      "project_id": PROJECT_ID_FOR_SEARCH,
      "status_id": 1
    })).filter(el => el.swimlane_id === SWIMLANE_ID);

    const tasksByAllGame = [];
    const memoIds = [];
    for (let i = 0; i < listSwimlaneNameOriginal.length; i++) {
      const name = listSwimlaneNameOriginal[i];
      const taskGame = tasksSwimlane.filter(el => {
        let flag = false;
        let text = el.title;
        if (el.title.includes('Water Sort')) text = 'WSP'
        else if (el.title.includes('Soda Sort')) text = 'SSP'
        else if (el.title.includes('Ball Sort Puzzle')) text = 'BSP'
        else if (el.title.includes('Ball Sort Color')) text = 'BSC'
        const listMatch = text.match(/([A-Z]{3,})/)
        if (Array.isArray(listMatch)) {
          flag = listMatch.includes(name)
          if (flag) memoIds.push(el.id)
        }
        return flag
      })
      tasksByAllGame.push(taskGame)
    }

    const [bspGames, wspGames, sspGames, bscwpGames, bscGames] = tasksByAllGame;

    const bscwpAllGames = bscwpGames.concat(bscGames);
    const listDataByOrder = [bspGames, wspGames, sspGames, bscwpAllGames].reduce((acc, listGame) => {
      const iosGames = listGame.filter(game => game.title.toLowerCase().includes('ios'));
      const iosGameIds = iosGames.map(gameIos => gameIos.id);
      const androidGames = listGame.filter(game => !iosGameIds.includes(game.id));
      acc.push(iosGames, androidGames);
      return acc;
    }, []);



    // // move task unknow 
    const listTaskUnknow = tasksSwimlane.filter(el => !memoIds.includes(el.id));
    const [swimlaneIdUnknowAndroid, swimlaneIdUnknowIos] = await Promise.all([requestKanboard("addSwimlane", [
      PROJECT_ID,
      'Unknown Android'
    ]), requestKanboard("addSwimlane", [
      PROJECT_ID,
      'Unknown IOS'
    ])])
    await Promise.all(listTaskUnknow.map(task => {
      if (task.title.toLowerCase().includes('ios')) {
        requestKanboard("moveTaskToProject", [
          task.id,
          PROJECT_ID,
          swimlaneIdUnknowIos,
          task.column_id,
          task.category_id
        ])
      }
      else {
        requestKanboard("moveTaskToProject", [
          task.id,
          PROJECT_ID,
          swimlaneIdUnknowAndroid,
          task.column_id,
          task.category_id
        ])
      }

    }))

    // // move task know 
    for (let i = 0; i < listDataByOrder.length; i++) {
      const listTaskByGame = listDataByOrder[i];
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
