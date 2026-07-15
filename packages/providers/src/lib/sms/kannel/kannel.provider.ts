import { SmsProviderIdEnum } from '@novu/shared';
import { ChannelTypeEnum, ISendMessageSuccessResponse, ISmsOptions, ISmsProvider } from '@novu/stateless';
import axios, { AxiosInstance } from 'axios';
import { BaseProvider, CasingEnum } from '../../../base.provider';
import { WithPassthrough } from '../../../utils/types';

export class KannelSmsProvider extends BaseProvider implements ISmsProvider {
  id = SmsProviderIdEnum.Kannel;
  apiBaseUrl: string;
  private axiosInstance: AxiosInstance;
  channelType = ChannelTypeEnum.SMS as ChannelTypeEnum.SMS;
  protected casing = CasingEnum.SNAKE_CASE;

  constructor(
    private config: {
      host: string;
      port: string;
      from: string;
      username?: string;
      password?: string;
    }
  ) {
    super();
    // A host may carry its own scheme, e.g. when Kannel sits behind TLS.
    // Hosts without one keep defaulting to http, which is what Kannel's
    // sendsms interface serves out of the box.
    const host = config.host.trim().replace(/\/+$/, '');
    const origin = /^https?:\/\//i.test(host) ? host : `http://${host}`;
    this.apiBaseUrl = `${origin}:${config.port}/cgi-bin`;
    this.axiosInstance = axios.create();
  }

  async sendMessage(
    options: ISmsOptions,
    bridgeProviderData: WithPassthrough<Record<string, unknown>> = {}
  ): Promise<ISendMessageSuccessResponse> {
    const url = `${this.apiBaseUrl}/sendsms`;
    const queryParameters = this.transform(bridgeProviderData, {
      username: this.config.username,
      password: this.config.password,
      from: options.from || this.config.from,
      to: options.to,
      text: options.content,
    }).body;

    const result = await this.axiosInstance.get(url, {
      params: queryParameters,
    });

    return {
      id: options.id,
      date: new Date().toDateString(),
    };
  }
}
