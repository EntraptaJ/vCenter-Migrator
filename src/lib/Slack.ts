import { SLACK_WEB } from '../';
import { MessageAttachment } from '@slack/types';
import { Paths } from 'typed-slack-client';

/**
 * Slack Attachment side colour
 */
const color = '#314351'

/**
 * Returns the channel ID of the SLACK_CHANNEL environment variable
 */
const findChannel = async () => {
  const convResponse = await SLACK_WEB.conversations.list();
  if (convResponse.ok === false) return;
  const { id } = await convResponse.channels.find(channel => channel.name === process.env.SLACK_CHANNEL);
  return id as string;
};

/**
 * Sends a message on Slack to the configured channel
 * @param text Body text for the message
 * @param attachments Optional attachments for the message 
 */
export const sendSlack = async (text: string, attachments?: MessageAttachment[]) => {
  const channel = await findChannel();
  return SLACK_WEB.chat.postMessage({ channel, text, attachments }) as Promise<Paths.ChatPostMessage.Responses.Success>;
};

/**
 * Updates a Slack message with new attachments
 * @param ts Slack timestamp of message
 * @param attachments Attachments to update on the message
 */
export const updateSlack = async (ts: string, text?: string, attachments?: MessageAttachment[]) => {
  const channel = await findChannel();
  return SLACK_WEB.chat.update({ channel, ts, text, attachments });
};

/**
 * Returns the progress attachment object
 * @param text Attachment message text
 */
export const progressAttachment = (text: string) => <MessageAttachment>({
  author_name: text,
  author_icon: 'https://s3-ap-southeast-2.amazonaws.com/daily-fire-assets/loader-150x150.gif',
  color,
});

/**
 * Returns the success attachment object
 * @param text Attachment message text
 */
export const successAttachment = (text: string) => <MessageAttachment>({
  author_name: text,
  author_icon: 'https://s3-ap-southeast-2.amazonaws.com/daily-fire-assets/tick-circle-150x150.png',
  color,
});

export const errorAttachment = (text: string) => <MessageAttachment>({
  author_name: text,
  color: '#b00020'
})