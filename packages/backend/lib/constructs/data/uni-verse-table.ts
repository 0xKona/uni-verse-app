import { RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, BillingMode, ProjectionType, StreamViewType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import nameResource, { nameStackResource } from '../../utils/name-resource';
import { isProd } from '../../utils/constants';

export class UniVerseTable extends Construct {
  public readonly table: Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.table = new Table(this, nameStackResource('table'), {
      tableName: nameResource('table'),
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      stream: StreamViewType.NEW_IMAGE,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });

    /*
     * recipient-index — Inverted index for recipient-based lookups.
     *
     * Friend requests are stored with PK=USER#<senderId>, which lets the sender
     * query their own sent requests. But the recipient needs to find requests sent
     * *to them* — a different access pattern. This index flips it by indexing on
     * recipientPK=USER#<recipientId>, so we can query all requests for a given recipient.
     *
     * Used for: incoming friend requests, accepted friends list (from recipient side)
     */
    this.table.addGlobalSecondaryIndex({
      indexName: 'recipient-index',
      partitionKey: { name: 'recipientPK', type: AttributeType.STRING },
      sortKey: { name: 'recipientSK', type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    /*
     * status-index — Status-based lookup for a user's relationships.
     *
     * Allows querying all items for a given user filtered by status (e.g. PENDING,
     * ACCEPTED). Without this, we'd have to scan all of a user's items and filter
     * client-side.
     *
     * Used for: listing all accepted friends or pending requests for a given user
     */
    this.table.addGlobalSecondaryIndex({
      indexName: 'status-index',
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'status', type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });
  }
}
