module.exports = async (params) => {
    try {
      let { users, callback } = params

      const resultUsers = [[]]
      let activeUsersIndex = 0

      users.forEach((userId) => {
        const last = resultUsers[resultUsers.length - 1]
        if (last.length < 30) last.push(userId)
        else resultUsers.push([userId])
      })

      async function step() {
        const startedAt = Date.now()
        const usrs = resultUsers[activeUsersIndex++]
        if (!usrs || usrs.length <= 0) return;

        await Promise.all(
          usrs.map(async (userId) => {
            let isSuccess = true

            try {
                await callback(userId, isSuccess)
            } 
            catch {
                callback(userId, isSuccess)
            }
            
          })
        )

        return setTimeout(step, Math.max(0, startedAt + 1000 - Date.now()))
      }

      step()
      return true
    } catch (e) {
      console.error(e)
    }
  }