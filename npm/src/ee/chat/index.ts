// import { JacksonError } from '../../controller/error';
import crypto from 'crypto';
import { throwIfInvalidLicense } from '../common/checkLicense';
import type { Storable, JacksonOption, Records } from '../../typings';
import { LLMChat, LLMConversation } from './types';
import { IndexNames } from '../../controller/utils';
import * as dbutils from '../../db/utils';

export class ChatController {
  private chatStore: Storable;
  // private configStore: Storable;
  private conversationStore: Storable;
  private opts: JacksonOption;

  constructor({
    chatStore,
    conversationStore,
    opts,
  }: {
    chatStore: Storable;
    conversationStore: Storable;
    opts: JacksonOption;
  }) {
    this.chatStore = chatStore;
    this.conversationStore = conversationStore;
    this.opts = opts;
  }

  public async getConversations(): Promise<Records<LLMConversation>> {
    await throwIfInvalidLicense(this.opts.boxyhqLicenseKey);

    const conversations = (await this.conversationStore.getAll()) as Records<LLMConversation>;

    return conversations;
  }

  public async getConversationsByTeamAndUser(
    teamId: string,
    userId: string
  ): Promise<Records<LLMConversation>> {
    await throwIfInvalidLicense(this.opts.boxyhqLicenseKey);

    const conversations = (await this.conversationStore.getByIndex({
      name: IndexNames.TeamUser,
      value: dbutils.keyFromParts(teamId, userId),
    })) as Records<LLMConversation>;

    return conversations;
  }

  public async getConversationById(conversationId: string): Promise<LLMConversation> {
    await throwIfInvalidLicense(this.opts.boxyhqLicenseKey);

    const conversation = (await this.conversationStore.get(conversationId)) as LLMConversation;

    return conversation;
  }

  public async createConversation(
    conversation: Exclude<LLMConversation, 'id' | 'LLMChat'>
  ): Promise<LLMConversation> {
    await throwIfInvalidLicense(this.opts.boxyhqLicenseKey);

    const conversationID = crypto.randomBytes(20).toString('hex');

    const newConversation = await this.conversationStore.put(conversationID, conversation);

    return newConversation;
  }

  public async createChat(chat: LLMChat): Promise<LLMChat> {
    await throwIfInvalidLicense(this.opts.boxyhqLicenseKey);

    const chatID = crypto.randomBytes(20).toString('hex');

    const newChat = await this.chatStore.put(chatID, chat);

    return newChat;
  }
}
