import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";

const account = process.env.CosmosDBAccountName;
const accountKey = process.env.CosmosDBAccountKey;
const tableName = "ApologiesTable";
const credential = new AzureNamedKeyCredential(account, accountKey);
const tableClient = new TableClient(`https://${account}.table.cosmos.azure.com`, tableName, credential);

export async function GetApology(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const userId = request.query.get('userId');

    if (!userId) {
        return {
            status: 400,
            body: "Please provide a userId query parameter."
        };
    }

    try {
        const entity = await tableClient.getEntity("User", userId);
        const apologyCount = entity.count;
        return {
            status: 200,
            body: `User ${userId} has ${apologyCount} apologies.`
        };
    } catch (error) {
        context.log(`No apologies found for user ${userId}.`);
        return {
            status: 404,
            body: `No apologies found for user ${userId}.`
        };
    }
};

app.http('GetApology', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: GetApology
});
