import { Aws } from "aws-cdk-lib";
import { CONSTANTS } from "./constants";

export default function nameResource(resourceName: string): string {
    const { NAMING_PREFIX: prefix } = CONSTANTS;
    return `${prefix}-${resourceName}-${Aws.ACCOUNT_ID}`;
}

export function nameStackResource(resourceName: string): string {
    const { NAMING_PREFIX: prefix } = CONSTANTS;
    return `${prefix}-${resourceName}`;
}