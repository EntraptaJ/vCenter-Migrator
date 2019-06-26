import { SLACK_WEB } from '../'
import { SLACK_CHANNEL } from '../consts'

export const sendSlack = async (text: string) => {
  const { channels }  = await SLACK_WEB.conversations.list()

    // @ts-ignore
    let { id } = await channels.find(channel => channel.name === SLACK_CHANNEL);
    return SLACK_WEB.chat.postMessage({ channel: id, text })
}