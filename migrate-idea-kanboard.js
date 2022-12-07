require('dotenv').config({})
const _ = require('lodash')
const { requestKanboard } = require('./requestKanboard')
const getSheets = require('./sheetFunctions')

  ; (async () => {
    try {
      const sheets = getSheets()
      // get data status sheet
      const sheetStatusName = 'status!A:B';
      const {
        data: { values: statusSheetData },
      } = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SHEET_ID,
        range: sheetStatusName,
      })
      const statusObj = statusSheetData.reduce((acc, el, index) => {
        if (index === 0) return acc;
        acc[el[1]] = el[0]
        return acc;
      }, {})
      const [allTasksOpen, allTaskClosed, columns] = await Promise.all([
        requestKanboard('getAllTasks', {
          project_id: '8',
          status_id: 1,
        }),
        requestKanboard('getAllTasks', {
          project_id: '8',
          status_id: 0,
        }),
        requestKanboard('getColumns', ['8']),
      ])
      const objColumns = columns.reduce((acc, el) => {
        acc[el.id] = el.title
        return acc
      }, {})
      const allTasks = allTaskClosed.concat(allTasksOpen)
      const batchAllTasks = batchArr(allTasks, 10)
      const results = []
      for (let i = 0; i < batchAllTasks.length; i++) {
        const batch = batchAllTasks[i]
        await Promise.all(
          batch.map(async (task) => {
            const allNameTask = task.title
              .split(/[()]/)
              .map((el) => el.trim())
              .filter((el) => el)
            const rootNameTask = allNameTask[allNameTask.length - 1]
            const status_id = statusObj[objColumns[task.column_id]]
            // match column => status
            const type_id = 1;
            const description = task.description
            const user_kanboard_id = task.owner_id
            const [userNameKanboard, tags, externalLinks, internalTaskLinkIds] = await Promise.all([
              getKanboardUserName(user_kanboard_id),
              getTagsByTaskId(task.id),
              getAllExternalTaskLinks(task.id),
              getAllInternalTasklinkByTaskId(task.id)
            ])

            const record = [
              task.id,
              allNameTask[0] || '',
              status_id,
              type_id,
              description,
              userNameKanboard,
              tags,
              externalLinks,
              '',// attachments links,
              internalTaskLinkIds,
              rootNameTask,
            ];
            allNameTask.shift();
            allNameTask.pop();
            const alternativeNames = allNameTask.join(',') || '';
            record.push(alternativeNames)
            results.push(record)
          })
        )


      }
      // insert google sheet
      const batchRecordsGG = batchArr(results, 200)
      for (let index = 0; index < batchRecordsGG.length; index++) {
        const batch = batchRecordsGG[index];
        setTimeout(async () => {
          await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.SHEET_ID,
            range: `A:L`,
            valueInputOption: 'RAW',
            resource: {
              values: [...batch],
            },
          })
        }, index * 1000)
      }
      console.log(results.length)
    } catch (error) {
      console.log('Error', error)
    }
  })()

const batchArr = (arr, length) => {
  const res = []
  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(res[Math.floor(i / length)])) {
      res[Math.floor(i / length)].push(arr[i])
    } else res[Math.floor(i / length)] = [arr[i]]
  }
  return res
}

const getKanboardUserName = async (userId) => {
  const result = await requestKanboard('getUser', {
    user_id: userId,
  });
  return result ? result.name : '';
}

const getTagsByTaskId = async (taskId) => {
  const objTags = await requestKanboard('getTaskTags', [taskId]);
  return Object.values(objTags).join(',')
}

const getAllExternalTaskLinks = async (taskId) => {
  const links = await requestKanboard(
    'getAllExternalTaskLinks',
    [taskId]
  )
  return links.map(el => el.url).join(',')
}

const getAllInternalTasklinkByTaskId = async (taskId) => {
  const links = await requestKanboard(
    'getAllTaskLinks',
    [taskId]
  )
  return links.map(el => el.task_id).join(',')
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
