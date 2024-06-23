import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";

const account = process.env.CosmosDBAccountName as string;
const accountKey = process.env.CosmosDBAccountKey as string;
const tableName = "ApologiesTable";
const credential = new AzureNamedKeyCredential(account, accountKey);
const tableClient = new TableClient(`https://${account}.table.cosmos.azure.com`, tableName, credential);

interface ApologyEntity {
    partitionKey: string;
    rowKey: string;
    count: number;
}

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log(`Http function processed request for url "${req.url}"`);
    try{
        const entities = tableClient.listEntities<ApologyEntity>();
        const allApologies: { userId: string; count: number }[] = [];

        for await (const entity of entities) {
            allApologies.push({
                userId: entity.rowKey,
                count: entity.count
            });
        }

        context.res = {
            status: 200,
            body: JSON.stringify(allApologies)
        };
    }
    catch (error){
        context.log(`Error fetching apologies: ${error.message}`);
        context.res = {
            status: 500,
            body: `Error fetching apologies: ${error.message}`
        };
    }
};

export default httpTrigger;