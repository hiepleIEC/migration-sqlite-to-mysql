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
    // const record = {name: el}
    for (let i = 0; i < allTasks.length; i++) {
      const task = allTasks[i]

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
      await query(sqlInsertIdeaInfo, [[Object.values(record)]])
      const sqlGetLastIdInserted = 'SELECT LAST_INSERT_ID();'
      const res = await query(sqlGetLastIdInserted)
      const idea_id = res[0]['LAST_INSERT_ID()']

      // insert child name
      if (allNameTask.length > 1) {
        console.log(allNameTask)
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
      // console.log({
      //   column,
      //   rootNameTask,
      //   status,
      //   description,
      //   user_kanboard_id,
      // })

      // return id

      // insert into name
    }
    // console.log(allTasksOpen)
    // const allTaskWithName = allTasksOpen.concat(allTaskClosed).map((el) => ({
    //   id: el.id,
    //   title: el.title,
    //   listName: el.title
    //     .split(/[()]/)
    //     .map((el) => el.trim())
    //     .filter((el) => el),
    // }))
  } catch (error) {
    console.log('Loi', error)
  }

  // const getAllTaskIdeaProject =
})()
