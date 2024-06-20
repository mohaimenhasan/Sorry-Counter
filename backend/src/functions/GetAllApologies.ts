import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
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

export async function GetAllApologies(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        const entities = tableClient.listEntities<ApologyEntity>();
        const allApologies: { userId: string; count: number }[] = [];

        for await (const entity of entities) {
            allApologies.push({
                userId: entity.rowKey,
                count: entity.count
            });
        }

        return {
            status: 200,
            jsonBody: allApologies
        };
    } catch (error) {
        context.log(`Error fetching apologies: ${error.message}`);
        return {
            status: 500,
            body: `Error fetching apologies: ${error.message}`
        };
    }
};

app.http('GetAllApologies', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: GetAllApologies
});
