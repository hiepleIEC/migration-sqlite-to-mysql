require('dotenv').config();
const { requestKanboard } = require("./utils");
const listSwimlaneName = ['Laser Bounce Puzzle', 'Tower Build Defense', 'Block Fit Puzzle Classic', 'Hungry Worm Puzzle', 'Color Picture Jigsaw Puzzle', 'Fireworks Launcher Puzzle', 'Find Doodle Challenge', 'Cozy Decor Adventure', 'Builds', 'Bugs', 'Tasks', 'Battle Lines Color', 'FDC', 'Fit Plate Challenge', 'Road Connect Challenge', 'Match Buttons Color Puzzle', 'Rope In Shape', 'Black White Swap Puzzle', 'Cloth Farm Adventure', 'Circle Rotate Puzzle', 'Fishing Boat Adventure', 'Lab Escape Challenge', 'Cloth Factory Quest', 'Keyboard Shooter Challenge', 'Color Drop Picture Puzzle', 'Bubble Smash Adventure', 'Castle Rush Tactic', 'Scavenger Search Adventure', 'Fruit Stack Challenge', 'Ideas', 'Money Card Battle', 'Balloon Collect Puzzle', 'Color Matching Battle', 'Decor Room Challenge', 'Wooden Tile Puzzle', 'Building Demolish Squad', 'Life Craft - Other Gameplay', 'Find Next Number', 'Pet Color Sort Puzzle', 'Line Connect Adventure', 'Pull Ball Master', 'Stop Flow Challenge', 'Math Fill Puzzle', 'Color Tile Rotate'];
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
    console.log({ tasksSwimlane })
    const tasksByAllGame = [];
    const memoIds = [];
    for (let i = 0; i < listSwimlaneName.length; i++) {
      const name = listSwimlaneName[i];
      const acr = name.split(' ');
      const matchStr = acr.reduce((acc, el) => {
        acc += el[0]
        return acc;
      }, '')
      const taskGame = tasksSwimlane.filter(el => {
        let flag = false;
        const listMatch = el.title.match(/([A-Z]{3,})/)
        if (Array.isArray(listMatch)) {
          flag = listMatch.includes(matchStr)
          if (flag) memoIds.push(el.id)
        }
        return flag
      })
      tasksByAllGame.push(taskGame)
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
      const acr = name.split(' ');
      const acrStr = acr.reduce((acc, el) => {
        acc += el[0]
        return acc;
      }, '')
      if (listTaskByGame.length > 0) {
        const swimlaneId = await requestKanboard("addSwimlane", [
          PROJECT_ID,
          acrStr
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
