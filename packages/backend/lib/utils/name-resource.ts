import { Aws } from "aws-cdk-lib";
import { CONSTANTS } from "./constants";

export default function nameResource(resourceName: string): string {
    const { NAMING_PREFIX: prefix } = CONSTANTS;
    const name = `${prefix}-${resourceName}-${Aws.ACCOUNT_ID}`;
    return name;
}