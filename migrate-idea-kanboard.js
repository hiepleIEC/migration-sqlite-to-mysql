const query = require('./connect-mysql')
const { requestKanboard } = require('./requestKanboard')
require('dotenv').config({})
;(async () => {
  try {
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
    const batchAllTasks = batchArr(allTasks, 100)
    for (let i = 0; i < batchAllTasks.length; i++) {
      const batch = batchAllTasks[i]
      await Promise.all(
        batch.map(async (task) => {
          const allNameTask = task.title
            .split(/[()]/)
            .map((el) => el.trim())
            .filter((el) => el)
          const rootNameTask = allNameTask[allNameTask.length - 1]
          const column = objColumns[task.column_id]
          const status = task.is_active
          const description = task.description
          const user_kanboard_id = task.owner_id
          const record = {
            name: rootNameTask || '',
            column,
            status,
            description,
            user_kanboard_id,
          }
          // insert task => info_ideas
          const sqlInsertIdeaInfo =
            'INSERT INTO `ideas`.`info_ideas` (`name`, `column`, `status`, `description`, `user_kanboard_id`) VALUES ?;'
          const resInsertIdeaInfo = await query(sqlInsertIdeaInfo, [
            [Object.values(record)],
          ])
          const idea_id = resInsertIdeaInfo.insertId

          // insert child name
          if (allNameTask.length > 1) {
            allNameTask.pop()
            const primaryName = allNameTask[0]
            // insert child primary name
            await query(
              'INSERT INTO `ideas`.`name_ideas` (`name`, `root_id`, `is_primary`) VALUES ?;',
              [
                [
                  Object.values({
                    name: primaryName,
                    root_id: idea_id,
                    is_primary: 1,
                  }),
                ],
              ]
            )
            // insert child not primary name
            allNameTask.shift()
            for (let i = 0; i < allNameTask.length; i++) {
              await query(
                'INSERT INTO `ideas`.`name_ideas` (`name`, `root_id`, `is_primary`) VALUES ?;',
                [
                  [
                    Object.values({
                      name: allNameTask[i],
                      root_id: idea_id,
                      is_primary: 0,
                    }),
                  ],
                ]
              )
            }
          }
          // insert external task link
          const listExternalTaskLink = await requestKanboard(
            'getAllExternalTaskLinks',
            [task.id]
          )
          if (listExternalTaskLink.length > 0) {
            await Promise.all(
              listExternalTaskLink.map((el) => {
                return query(
                  'INSERT INTO `ideas`.`external_link_ideas` (`root_id`, `link`) VALUES ?;',
                  [
                    [
                      Object.values({
                        root_id: idea_id,
                        link: el.url,
                      }),
                    ],
                  ]
                )
              })
            )
          }
          // insert tag
          const objTaskTags = await requestKanboard('getTaskTags', [task.id])
          const listTaskTagsEntries = Object.entries(objTaskTags)
          if (listTaskTagsEntries.length > 0) {
            await Promise.all(
              listTaskTagsEntries.map((el) => {
                return query(
                  'INSERT INTO `ideas`.`tag_ideas` (`tag_kanboard_id`, `root_id`,`tag_kanboard_name`) VALUES ?;',
                  [
                    [
                      Object.values({
                        tag_kanboard_id: el[0],
                        root_id: idea_id,
                        tag_kanboard_name: el[1],
                      }),
                    ],
                  ]
                )
              })
            )
          }
        })
      )
    }
  } catch (error) {
    console.log('Loi', error)
  }

  // const getAllTaskIdeaProject =
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
