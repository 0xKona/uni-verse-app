import { Construct } from 'constructs';

/**
 * Subscriptions are handled entirely by the @aws_subscribe directive in the schema.
 * No resolvers needed — AppSync auto-wires subscriptions to mutations.
 *
 * IMPORTANT: Do NOT attach resolvers to subscription fields when using @aws_subscribe.
 * The directive creates an internal resolver that forwards mutation results to subscribers.
 * Adding a manual resolver causes conflicts and "Cannot return null" errors.
 */
export class FriendsSubscriptions extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    // No resolvers — @aws_subscribe handles everything
  }
}
