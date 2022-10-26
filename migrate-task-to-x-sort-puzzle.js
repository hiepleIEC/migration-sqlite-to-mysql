require('dotenv').config();
const { requestKanboard, createFile } = require("./utils");
const listSwimlaneName = ['BSP', 'WSP', 'SSP', 'BSC'].reduce((acc, el) => {
  const iosName = el + ' iOS';
  const androidName = el + ' Android';
  acc.push(iosName, androidName);
  return acc;
}, []);
const listSwimlaneNameForSearch = ['BSP', 'WSP', 'SSP', 'BSCWP', 'BSC'];
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

    const [bspGames, wspGames, sspGames, bscwpGames, bscGames] = rawData.map(raw => raw.filter(task => task.swimlane_id === SWIMLANE_ID && task.is_active === '1'));
    const bscwpAllGames = bscwpGames.concat(bscGames);
    const listDataByOrder = [bspGames, wspGames, sspGames, bscwpAllGames].reduce((acc, listGame) => {
      const iosGames = listGame.filter(game => game.title.toLowerCase().includes('ios'));
      const iosGameIds = iosGames.map(gameIos => gameIos.id);
      const androidGames = listGame.filter(game => !iosGameIds.includes(game.id));
      acc.push(iosGames, androidGames);
      return acc;
    }, []);


    // move task to new project
    for (let i = 0; i < listDataByOrder.length; i++) {
      const listTaskByGame = listDataByOrder[i];
      const swimlaneId = listSwimlaneId[i];
      await Promise.all(listTaskByGame.map(task => requestKanboard("moveTaskToProject", [
        task.id,
        PROJECT_ID,
        swimlaneId,
        task.column_id
      ])));
    }
  } catch (error) {
    console.error(error);
  }
})();
