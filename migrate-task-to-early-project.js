require('dotenv').config();
const { requestKanboard } = require("./utils");
const listSwimlaneName = ['Laser Bounce Puzzle', 'Tower Build Defense', 'Block Fit Puzzle Classic', 'Hungry Worm Puzzle', 'Color Picture Jigsaw Puzzle', 'Fireworks Launcher Puzzle', 'Find Doodle Challenge', 'Cozy Decor Adventure', 'Laser Bounce Puzzle', 'Tower Build Defense', 'Block Fit Puzzle Classic', 'Hungry Worm Puzzle', 'Color Picture Jigsaw Puzzle', 'Fireworks Launcher Puzzle', 'Find Doodle Challenge', 'Cozy Decor Adventure', 'Builds', 'Bugs', 'Tasks', 'Battle Lines Color', 'FDC', 'Fit Plate Challenge', 'Road Connect Challenge', 'Match Buttons Color Puzzle', 'Rope In Shape', 'Black White Swap Puzzle', 'Cloth Farm Adventure', 'Circle Rotate Puzzle', 'Fishing Boat Adventure', 'Lab Escape Challenge', 'Cloth Factory Quest', 'Keyboard Shooter Challenge', 'Color Drop Picture Puzzle', 'Bubble Smash Adventure', 'Castle Rush Tactic', 'Scavenger Search Adventure', 'Fruit Stack Challenge', 'Ideas', 'Money Card Battle', 'Balloon Collect Puzzle', 'Color Matching Battle', 'Decor Room Challenge', 'Wooden Tile Puzzle', 'Building Demolish Squad', 'Life Craft - Other Gameplay', 'Find Next Number', 'Pet Color Sort Puzzle', 'Line Connect Adventure', 'Pull Ball Master', 'Stop Flow Challenge', 'Math Fill Puzzle', 'Color Tile Rotate'];
const listSwimlaneNameForSearch = listSwimlaneName.reduce((acc, el) => {
  const listStr = el.split(' ')

    .reduce((acc, el) => {
      acc += el[0];
      return acc;
    }, '')
  acc.push(el, acrList)
  return acc;
}, []);
const PROJECT_ID_FOR_SEARCH = process.env.PROJECT_ID_FOR_SEARCH;
const SWIMLANE_ID = process.env.SWIMLANE_ID;
const PROJECT_ID = process.env.PROJECT_ID;
(async () => {
  try {


    // create list swimmlane with project id
    const listSwimlaneId = await Promise.all(listSwimlaneName.map(name => requestKanboard("addSwimlane", [
      PROJECT_ID,
      name
    ])));




    // get task 
    const rawData = await Promise.all(listSwimlaneNameForSearch.map(name => requestKanboard("searchTasks", {
      "project_id": PROJECT_ID_FOR_SEARCH,
      "query": `title:${name.toLowerCase()}`
    })));

    const data = rawData
      .map(raw => raw.filter(task => (task.swimlane_id === SWIMLANE_ID && task.is_active === '1')))
      .reduce((acc, el, index, arr) => {
        if (index % 2 === 0) {
          const memoIds = {};
          const mergeDuplicate = [...arr[index], ...arr[index + 1]];
          const mergeWithNoDuplicate = [];
          for (let i = 0; i < mergeDuplicate.length; i++) {
            const taskId = mergeDuplicate[i].id;
            if (!(taskId in memoIds)) mergeWithNoDuplicate.push(mergeDuplicate[i])
            memoIds[taskId] = true;
          }
          acc.push(mergeWithNoDuplicate);
        }
        return acc;
      }, []);
    // move task to new project
    for (let i = 0; i < data.length; i++) {
      const listTaskByGame = data[i];
      const swimlaneId = listSwimlaneId[i];
      await Promise.all(listTaskByGame.map(task => requestKanboard("moveTaskToProject", [
        task.id,
        PROJECT_ID,
        swimlaneId,
        task.column_id,
        task.category_id
      ])));
    }
  } catch (error) {
    console.error(error);
  }
})();
