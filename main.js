const fs = require('fs')
const path = require('path')
const axios = require('axios')
const colors = require('colors')
const readline = require('readline')
const TelegramBot = require('node-telegram-bot-api') // Import TelegramBot library

// Replace with your actual bot token and chat ID
const TELEGRAM_BOT_TOKEN = '7410147585:AAHxWU0hGozl6kRCQ1ppS1Rkw65sYky8LAk' // Your bot token
const TELEGRAM_CHAT_ID = '1740443921' // Your chat ID

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false }) // Initialize Telegram bot

class OKX {
  headers() {
    return {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept-Language': 'en-US,en;q=0.9',
      'App-Type': 'web',
      'Content-Type': 'application/json',
      Origin: 'https://www.okx.com',
      Referer:
        'https://www.okx.com/mini-app/racer?tgWebAppStartParam=linkCode_85298986',
      'Sec-Ch-Ua':
        '"Not/A)Brand";v="8", "Chromium";v="126", "Microsoft Edge";v="126"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0',
      'X-Cdn': 'https://www.okx.com',
      'X-Locale': 'en_US',
      'X-Utc': '7',
      'X-Zkdex-Env': '0',
    }
  }

  async postToOKXAPI(extUserId, extUserName, queryId) {
    const url = `https://www.okx.com/priapi/v1/affiliate/game/racer/info?t=${Date.now()}`
    const headers = { ...this.headers(), 'X-Telegram-Init-Data': queryId }
    const payload = {
      extUserId: extUserId,
      extUserName: extUserName,
      gameId: 1,
      linkCode: '88910038',
    }

    return axios.post(url, payload, { headers })
  }

  async assessPrediction(extUserId, predict, queryId) {
    const url = `https://www.okx.com/priapi/v1/affiliate/game/racer/assess?t=${Date.now()}`
    const headers = { ...this.headers(), 'X-Telegram-Init-Data': queryId }
    const payload = {
      extUserId: extUserId,
      predict: predict,
      gameId: 1,
    }

    return axios.post(url, payload, { headers })
  }

  async checkDailyRewards(extUserId, queryId) {
    const url = `https://www.okx.com/priapi/v1/affiliate/game/racer/tasks?t=${Date.now()}`
    const headers = { ...this.headers(), 'X-Telegram-Init-Data': queryId }
    try {
      const response = await axios.get(url, { headers })
      const tasks = response.data.data
      const dailyCheckInTask = tasks.find((task) => task.id === 4)
      if (dailyCheckInTask) {
        if (dailyCheckInTask.state === 0) {
          this.log('Start checkin ... ')
          await this.performCheckIn(extUserId, dailyCheckInTask.id, queryId)
        } else {
          this.log('Today you have attended!')
        }
      }
    } catch (error) {
      this.log(`Daily reward check error: ${error.message}`)
    }
  }

  async performCheckIn(extUserId, taskId, queryId) {
    const url = `https://www.okx.com/priapi/v1/affiliate/game/racer/task?t=${Date.now()}`
    const headers = { ...this.headers(), 'X-Telegram-Init-Data': queryId }
    const payload = {
      extUserId: extUserId,
      id: taskId,
    }

    try {
      await axios.post(url, payload, { headers })
      this.log('Daily attendance successfully!')
    } catch (error) {
      this.log(`Error: ${error.message}`)
    }
  }

  log(msg) {
    console.log(`[*] ${msg}`)
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async waitWithCountdown(seconds) {
    for (let i = seconds; i >= 0; i--) {
      readline.cursorTo(process.stdout, 0)
      process.stdout.write(
        `===== Completed all accounts, waiting ${i} seconds to continue the loop =====`
      )
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
    console.log('')
  }

  async Countdown(seconds) {
    for (let i = seconds; i >= 0; i--) {
      readline.cursorTo(process.stdout, 0)
      process.stdout.write(`[*] Wait ${i} Seconds to continue ...`)
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
    console.log('')
  }

  extractUserData(queryId) {
    const urlParams = new URLSearchParams(queryId)
    const user = JSON.parse(decodeURIComponent(urlParams.get('user')))
    return {
      extUserId: user.id,
      extUserName: user.username,
    }
  }

  async getBoosts(queryId) {
    const url = `https://www.okx.com/priapi/v1/affiliate/game/racer/boosts?t=${Date.now()}`
    const headers = { ...this.headers(), 'X-Telegram-Init-Data': queryId }
    try {
      const response = await axios.get(url, { headers })
      return response.data.data
    } catch (error) {
      console.log(`BOOSTS Information Error: ${error.message}`)
      return []
    }
  }

  async useBoost(queryId) {
    const url = `https://www.okx.com/priapi/v1/affiliate/game/racer/boost?t=${Date.now()}`
    const headers = { ...this.headers(), 'X-Telegram-Init-Data': queryId }
    const payload = { id: 1 }

    try {
      const response = await axios.post(url, payload, { headers })
      if (response.data.code === 0) {
        this.log('Reload Fuel Tank successfully!'.yellow)
        await this.Countdown(5)
      } else {
        this.log(`Error Reload Fuel Tank: ${response.data.msg}`.red)
      }
    } catch (error) {
      this.log(`Crazyi: ${error.message}`.red)
    }
  }

  async upgradeFuelTank(queryId) {
    const url = `https://www.okx.com/priapi/v1/affiliate/game/racer/boost?t=${Date.now()}`
    const headers = { ...this.headers(), 'X-Telegram-Init-Data': queryId }
    const payload = { id: 2 }

    try {
      const response = await axios.post(url, payload, { headers })
      if (response.data.code === 0) {
        this.log('Upgrade Fuel Tank thành công!'.yellow)
      } else {
        this.log(`Upgrade error Fuel Tank: ${response.data.msg}`.red)
      }
    } catch (error) {
      this.log(`Crazyi: ${error.message}`.red)
    }
  }

  async upgradeTurbo(queryId) {
    const url = `https://www.okx.com/priapi/v1/affiliate/game/racer/boost?t=${Date.now()}`
    const headers = { ...this.headers(), 'X-Telegram-Init-Data': queryId }
    const payload = { id: 3 }

    try {
      const response = await axios.post(url, payload, { headers })
      if (response.data.code === 0) {
        this.log('Successful Turbo Charger upgrade!'.yellow)
      } else {
        this.log(`Turbo Charge upgrade errorr: ${response.data.msg}`.red)
      }
    } catch (error) {
      this.log(`Error: ${error.message}`.red)
    }
  }

  askQuestion(query) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    return new Promise((resolve) =>
      rl.question(query, (ans) => {
        rl.close()
        resolve(ans)
      })
    )
  }

  async sendToTelegram(message) {
    try {
      await bot.sendMessage(TELEGRAM_CHAT_ID, message, {
        parse_mode: 'MarkdownV2',
      })
    } catch (error) {
      this.log(`Telegram error: ${error.message}`)
    }
  }

  extractUsername(queryId) {
    // Add this function
    const urlParams = new URLSearchParams(queryId)
    const user = JSON.parse(decodeURIComponent(urlParams.get('user')))
    return user.username
  }

  async main() {
    const dataFile = path.join(__dirname, 'data.txt')
    const userData = fs
      .readFileSync(dataFile, 'utf8')
      .replace(/\r/g, '')
      .split('\n')
      .filter(Boolean)
    const getUsername = (queryId) => this.extractUsername(queryId)
    const nangcapfueltank = await this.askQuestion(
      'Do you want to upgrade Fuel Tank? (y/n): '
    )
    const hoinangcap = nangcapfueltank.toLowerCase() === 'y'
    const nangcapturbo = await this.askQuestion(
      'Do you want to upgrade Turbo Charger? (y/n): '
    )
    const hoiturbo = nangcapturbo.toLowerCase() === 'y'

    while (true) {
      for (let i = 0; i < userData.length; i++) {
        const queryId = userData[i]
        const { extUserId, extUserName } = this.extractUserData(queryId)
        const username = getUsername(queryId)
        try {
          await this.checkDailyRewards(extUserId, queryId)

          let boosts = await this.getBoosts(queryId)
          boosts.forEach((boost) => {
            this.log(
              `${boost.context.name.green}: ${boost.curStage}/${boost.totalStage}`
            )
          })

          let reloadFuelTank = boosts.find((boost) => boost.id === 1)
          let fuelTank = boosts.find((boost) => boost.id === 2)
          let turbo = boosts.find((boost) => boost.id === 3)

          if (fuelTank && hoinangcap) {
            const balanceResponse = await this.postToOKXAPI(
              extUserId,
              extUserName,
              queryId
            )
            const balancePoints = balanceResponse.data.data.balancePoints
            if (
              fuelTank.curStage < fuelTank.totalStage &&
              balancePoints > fuelTank.pointCost
            ) {
              await this.upgradeFuelTank(queryId)

              boosts = await this.getBoosts(queryId)
              const updatedFuelTank = boosts.find((boost) => boost.id === 2)
              const updatebalanceResponse = await this.postToOKXAPI(
                extUserId,
                extUserName,
                queryId
              )
              const updatedBalancePoints =
                updatebalanceResponse.data.data.balancePoints
              if (
                updatedFuelTank.curStage >= fuelTank.totalStage ||
                updatedBalancePoints < fuelTank.pointCost
              ) {
                this.log('Not eligible to upgrade Fuel Tank!'.red)
                continue
              }
            } else {
              this.log('Not eligible to upgrade Fuel Tank!'.red)
            }
          }

          if (turbo && hoiturbo) {
            const balanceResponse = await this.postToOKXAPI(
              extUserId,
              extUserName,
              queryId
            )
            const balancePoints = balanceResponse.data.data.balancePoints
            if (
              turbo.curStage < turbo.totalStage &&
              balancePoints > turbo.pointCost
            ) {
              await this.upgradeTurbo(queryId)

              boosts = await this.getBoosts(queryId)
              const updatedTurbo = boosts.find((boost) => boost.id === 3)
              const updatebalanceResponse = await this.postToOKXAPI(
                extUserId,
                extUserName,
                queryId
              )
              const updatedBalancePoints =
                updatebalanceResponse.data.data.balancePoints
              if (
                updatedTurbo.curStage >= turbo.totalStage ||
                updatedBalancePoints < turbo.pointCost
              ) {
                this.log('Upgrading Turbo Charger failed!'.red)
                continue
              }
            } else {
              this.log('Not eligible to upgrade Turbo Charger!'.red)
            }
          }

          for (let j = 0; j < 50; j++) {
            const response = await this.postToOKXAPI(
              extUserId,
              extUserName,
              queryId
            )
            const balancePoints = response.data.data.balancePoints
            this.log(`${'balancePoints:'.green} ${balancePoints}`)

            const predict = 1
            const assessResponse = await this.assessPrediction(
              extUserId,
              predict,
              queryId
            )
            const assessData = assessResponse.data.data
            const result = assessData.won ? '*Win*' : '*Lose*'
            const calculatedValue = assessData.basePoint * assessData.multiplier
            const message = `
Account: ${username}
    Balance Points: ${balancePoints}
    Result: ${result}
    Multiplier: ${assessData.multiplier}
    Receive: ${calculatedValue}
    Balance: ${assessData.balancePoints}
    Old Price: ${assessData.prevPrice}
    Current Price: ${assessData.currentPrice}
`.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1') // Trim to remove any leading or trailing whitespace

            this.log(message)
            await this.sendToTelegram(message)

            if (
              assessData.numChance <= 0 &&
              reloadFuelTank &&
              reloadFuelTank.curStage < reloadFuelTank.totalStage
            ) {
              await this.useBoost(queryId)

              boosts = await this.getBoosts(queryId)
              reloadFuelTank = boosts.find((boost) => boost.id === 1)
            } else if (assessData.numChance > 0) {
              await this.Countdown(5)
              continue
            } else if (assessData.secondToRefresh > 0) {
              await this.Countdown(assessData.secondToRefresh + 5)
            } else {
              break
            }
          }
        } catch (error) {
          this.log(`${'Error:'.red} ${error.message}`)
        }
      }
      await this.waitWithCountdown(30)
    }
  }
}

if (require.main === module) {
  const okx = new OKX()
  okx.main().catch((err) => {
    console.error(err.toString().red)
    process.exit(1)
  })
}
