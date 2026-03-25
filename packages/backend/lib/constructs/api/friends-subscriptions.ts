import * as appsync from 'aws-cdk-lib/aws-appsync';
import { Construct } from 'constructs';
import { nameStackResource } from '../../utils/name-resource';

interface FriendsSubscriptionsProps {
  noneDs: appsync.NoneDataSource;
}

export class FriendsSubscriptions extends Construct {
  constructor(scope: Construct, id: string, { noneDs }: FriendsSubscriptionsProps) {
    super(scope, id);

    /*
     * onFriendRequestReceived — Subscription that fires when a friend request
     * is sent to a user. The @aws_subscribe directive connects this to the
     * sendFriendRequest mutation. We filter to only notify the recipient.
     */
    noneDs.createResolver(nameStackResource('resolver-on-friend-request-received'), {
      typeName: 'Subscription',
      fieldName: 'onFriendRequestReceived',
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        {
          "version": "2017-02-28",
          "payload": {}
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.fromString(`
        ## Filter: only return data if the recipientId matches the subscription parameter
        #if($ctx.args.recipientId == $ctx.result.recipientId)
          $util.toJson($ctx.result)
        #else
          $util.unauthorized()
        #end
      `),
    });

    /*
     * onFriendRequestUpdated — Subscription that fires when a friend request
     * status changes (accepted/declined). Notifies both sender and recipient.
     */
    noneDs.createResolver(nameStackResource('resolver-on-friend-request-updated'), {
      typeName: 'Subscription',
      fieldName: 'onFriendRequestUpdated',
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        {
          "version": "2017-02-28",
          "payload": {}
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.fromString(`
        ## Filter: notify both the sender and recipient when request status changes
        #if($ctx.args.userId == $ctx.result.senderId || $ctx.args.userId == $ctx.result.recipientId)
          $util.toJson($ctx.result)
        #else
          $util.unauthorized()
        #end
      `),
    });

    /*
     * onFriendListUpdated — Subscription that fires when friends are added/removed.
     * Notifies both users involved in the friendship change.
     */
    noneDs.createResolver(nameStackResource('resolver-on-friend-list-updated'), {
      typeName: 'Subscription',
      fieldName: 'onFriendListUpdated',
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        {
          "version": "2017-02-28",
          "payload": {}
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.fromString(`
        ## Filter: notify both users when friend list changes
        #if($ctx.args.userId == $ctx.result.senderId || $ctx.args.userId == $ctx.result.recipientId)
          $util.toJson($ctx.result)
        #else
          $util.unauthorized()
        #end
      `),
    });
  }
}
