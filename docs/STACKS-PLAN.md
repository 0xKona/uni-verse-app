# CDK Backend Stacks

This document outlines how the application backend is split up into CDK stacks and constructs.

## Stack List

- Auth Stack: Contains cognito user pools and setup
- API Stack: GraphQL setup and Translation Mutations
- Data Stack: Contains DynamoDB Tables and S3 Buckets
- Moderation Stack: Moderation queue.

## Constructs List

- Auth Stack:   
    - Cognito Construct

- API Stack: 
    - AppSync Construct
    - Translation Lambda Construct
    - Translate Construct


- Data Stack: 
    - DynamoDB Construct (Set up main and backup)
    - S3 Media Construct

- Moderation Stack: 
    - Moderation Queue (SQS) Construct
    - Moderation Lambda Construct
    - Comprehend Construct
    - Rekognition Construct

    