/**
 * Type declarations for pulumi-stripe provider.
 * These declarations make the stripe namespace properly typed
 * so we don't need `as any` casts in SST config files.
 */
declare module 'pulumi-stripe' {
  import * as pulumi from '@pulumi/pulumi';

  // Provider
  export class Provider extends pulumi.ProviderResource {
    constructor(
      name: string,
      args?: ProviderArgs,
      opts?: pulumi.CustomResourceOptions
    );
  }

  export interface ProviderArgs {
    apiKey?: pulumi.Input<string>;
  }

  // Product
  export class Product extends pulumi.CustomResource {
    constructor(
      name: string,
      args: ProductArgs,
      opts?: pulumi.CustomResourceOptions
    );
    readonly id: pulumi.Output<string>;
  }

  export interface ProductArgs {
    name: pulumi.Input<string>;
    description?: pulumi.Input<string>;
    active?: pulumi.Input<boolean>;
    metadata?: pulumi.Input<Record<string, string>>;
  }

  // Price
  export class Price extends pulumi.CustomResource {
    constructor(
      name: string,
      args: PriceArgs,
      opts?: pulumi.CustomResourceOptions
    );
    readonly id: pulumi.Output<string>;
  }

  export interface PriceArgs {
    product: pulumi.Input<string>;
    currency: pulumi.Input<string>;
    unitAmount?: pulumi.Input<number>;
    recurring?: pulumi.Input<{
      interval: 'day' | 'week' | 'month' | 'year';
      intervalCount?: number;
    }>;
    metadata?: pulumi.Input<Record<string, string>>;
  }

  // WebhookEndpoint
  export class WebhookEndpoint extends pulumi.CustomResource {
    constructor(
      name: string,
      args: WebhookEndpointArgs,
      opts?: pulumi.CustomResourceOptions
    );
    readonly id: pulumi.Output<string>;
    readonly secret: pulumi.Output<string>;
    readonly url: pulumi.Output<string>;
  }

  export interface WebhookEndpointArgs {
    url: pulumi.Input<string>;
    enabledEvents: pulumi.Input<string[]>;
  }
}
